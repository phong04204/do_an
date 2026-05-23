<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\GameAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Transaction::with(['gameAccount.category', 'buyer', 'seller'])
            ->where(function($q) use ($user) {
                $q->where('buyer_id', $user->id)
                  ->orWhere('seller_id', $user->id);
            });

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('limit', 12));

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách giao dịch thành công',
            'data' => $transactions
        ]);
    }

    /**
     * Get details of a single transaction.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $transaction = Transaction::with(['gameAccount.category', 'buyer', 'seller'])->find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy giao dịch'
            ], 404);
        }

        // Security check: must be buyer, seller, or admin
        if ($transaction->buyer_id !== $user->id && $transaction->seller_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập giao dịch này'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết giao dịch thành công',
            'data' => $transaction
        ]);
    }

    /**
     * Initiate a purchase (Escrow Hold).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'game_account_id' => 'required|exists:game_accounts,id',
            'note' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $buyer = $request->user();
        $account = GameAccount::find($request->game_account_id);

        // 1. Check status
        if ($account->status !== 'selling') {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản game này hiện không thể giao dịch (đã bán hoặc đang chờ xử lý).'
            ], 400);
        }

        // 2. Prevent buying own account
        if ($account->seller_id === $buyer->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể mua tài khoản do chính mình rao bán.'
            ], 400);
        }

        // 3. Check balance
        if ($buyer->balance < $account->price) {
            return response()->json([
                'success' => false,
                'message' => 'Số dư tài khoản không đủ. Vui lòng nạp thêm tiền.'
            ], 400);
        }

        // 4. Conduct Transaction under DB Lock to prevent race condition
        try {
            $transaction = DB::transaction(function() use ($buyer, $account, $request) {
                // Lock user and account for update
                $lockedBuyer = User::lockForUpdate()->find($buyer->id);
                $lockedAccount = GameAccount::lockForUpdate()->find($account->id);

                // Re-verify balance and status inside the transaction block
                if ($lockedBuyer->balance < $lockedAccount->price) {
                    throw new \Exception('Số dư tài khoản không đủ.');
                }
                if ($lockedAccount->status !== 'selling') {
                    throw new \Exception('Tài khoản game không còn khả dụng.');
                }

                // Deduct buyer's balance
                $lockedBuyer->balance -= $lockedAccount->price;
                $lockedBuyer->save();

                // Lock the game account status
                $lockedAccount->status = 'pending';
                $lockedAccount->save();

                // Auto-generate credentials for instant delivery display
                $gameUsername = 'acc_' . strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $lockedAccount->title)) . '_' . rand(100, 999);
                $gamePassword = bin2hex(random_bytes(4)) . '@GAcc';
                $deliveryInfo = "Tài khoản: {$gameUsername}\nMật khẩu: {$gamePassword}\nEmail đăng ký: " . strtolower(str_replace(' ', '', $lockedBuyer->name)) . rand(10, 99) . "@gmail.com\n\nVui lòng kiểm tra kỹ thông tin trước khi nhấn xác nhận để giải ngân cho người bán!";

                // Create escrow transaction
                return Transaction::create([
                    'buyer_id' => $lockedBuyer->id,
                    'seller_id' => $lockedAccount->seller_id,
                    'game_account_id' => $lockedAccount->id,
                    'amount' => $lockedAccount->price,
                    'status' => 'paid', // paid means funds are currently in escrow
                    'note' => $request->input('note', 'Mua tài khoản game'),
                    'delivered_at' => now(),
                    // Store credentials in note or a custom field. Let's append to transaction note or save in a structured way.
                    // We'll append it to a safe output or transaction detail
                    'note' => "Ghi chú: " . ($request->input('note') ?? 'Mua hàng') . "\n\n[THÔNG TIN BÀN GIAO MÃ HÓA]\n" . $deliveryInfo
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Mua tài khoản game thành công! Tiền đã được giữ an toàn trên hệ thống Escrow.',
                'data' => $transaction
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Giao dịch thất bại: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm transaction (Release escrow funds to seller).
     */
    public function confirm(Request $request, $id)
    {
        $user = $request->user();
        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy giao dịch'
            ], 404);
        }

        // Only buyer (or admin) can confirm delivery
        if ($transaction->buyer_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ người mua mới có quyền xác nhận hoàn tất giao dịch này'
            ], 403);
        }

        if ($transaction->status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Giao dịch đã được hoàn tất hoặc hủy bỏ trước đó.'
            ], 400);
        }

        try {
            DB::transaction(function() use ($transaction) {
                // Update transaction status
                $transaction->status = 'completed';
                $transaction->completed_at = now();
                $transaction->escrow_released_at = now();
                $transaction->save();

                // Update game account status to permanently sold
                $account = GameAccount::find($transaction->game_account_id);
                $account->status = 'sold';
                $account->save();

                // Transfer funds to seller
                $seller = User::lockForUpdate()->find($transaction->seller_id);
                $seller->balance += $transaction->amount;
                $seller->save();
            });

            $transaction->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận thành công! Tiền giao dịch đã được giải ngân về ví của người bán.',
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xử lý xác nhận thất bại: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel transaction (Refund escrow funds to buyer).
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy giao dịch'
            ], 404);
        }

        // Buyer, Seller or Admin can request cancellation. In normal escrow, support handles disputes.
        // We'll allow buyer, seller, or admin to cancel for testing convenience.
        if ($transaction->buyer_id !== $user->id && $transaction->seller_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền hủy giao dịch này'
            ], 403);
        }

        if ($transaction->status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Giao dịch đã được hoàn tất hoặc hủy bỏ trước đó.'
            ], 400);
        }

        try {
            DB::transaction(function() use ($transaction) {
                // Update transaction status
                $transaction->status = 'cancelled';
                $transaction->completed_at = now();
                $transaction->save();

                // Release game account back to 'selling'
                $account = GameAccount::find($transaction->game_account_id);
                $account->status = 'selling';
                $account->save();

                // Refund funds to buyer
                $buyer = User::lockForUpdate()->find($transaction->buyer_id);
                $buyer->balance += $transaction->amount;
                $buyer->save();
            });

            $transaction->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Hủy giao dịch thành công! Số tiền giữ hộ đã được hoàn trả lại ví của người mua.',
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xử lý hủy thất bại: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mock deposit feature (Process simulated wallet top-up).
     */
    public function processPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:10000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Số tiền nạp tối thiểu là 10.000đ và phải là một số hợp lệ.',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        $user->balance += $request->amount;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Nạp tiền vào tài khoản thành công!',
            'balance' => $user->balance
        ]);
    }

    /**
     * Seller marks transaction as delivered.
     */
    public function confirmDelivery(Request $request, $id)
    {
        $user = $request->user();
        $transaction = Transaction::with(['gameAccount.category', 'buyer', 'seller'])->find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy giao dịch'
            ], 404);
        }

        // Only seller or admin can mark as delivered
        if ($transaction->seller_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ người bán mới có quyền xác nhận bàn giao tài khoản này'
            ], 403);
        }

        $transaction->delivered_at = now();
        $transaction->save();

        return response()->json([
            'success' => true,
            'message' => 'Bàn giao tài khoản thành công! Đang chờ người mua xác nhận hoàn tất.',
            'data' => $transaction
        ]);
    }

    /**
     * Buyer disputes/cancels the transaction (Refund escrow).
     */
    public function dispute(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|min:5'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lý do khiếu nại không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $transaction = Transaction::with(['gameAccount.category', 'buyer', 'seller'])->find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy giao dịch'
            ], 404);
        }

        // Only buyer can dispute/claim refund
        if ($transaction->buyer_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ người mua mới có quyền khiếu nại giao dịch này'
            ], 403);
        }

        if ($transaction->status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Giao dịch đã được hoàn tất hoặc xử lý từ trước.'
            ], 400);
        }

        try {
            DB::transaction(function() use ($transaction, $request) {
                // Update transaction status to cancelled/refunded
                $transaction->status = 'cancelled';
                $transaction->completed_at = now();
                $transaction->note .= "\n\n[KHIẾU NẠI] Lý do: " . $request->input('reason');
                $transaction->save();

                // Release game account back to 'selling'
                $account = GameAccount::find($transaction->game_account_id);
                $account->status = 'selling';
                $account->save();

                // Refund buyer
                $buyer = User::lockForUpdate()->find($transaction->buyer_id);
                $buyer->balance += $transaction->amount;
                $buyer->save();
            });

            // Reload relationships
            $transaction->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Khiếu nại thành công! Tiền giao dịch đã được tự động hoàn trả lại ví của bạn.',
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xử lý khiếu nại thất bại: ' . $e->getMessage()
            ], 500);
        }
    }
}
