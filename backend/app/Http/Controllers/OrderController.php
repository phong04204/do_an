<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\GameAccount;
use App\Models\GameCard;
use App\Models\GameGiftcode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Get user's order history.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = Order::with(['items.purchasable'])
            ->where('buyer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $data = $order->toArray();
                $data['items'] = $order->items->map(function ($item) {
                    $d = $item->toArray();
                    $d['purchasable_title'] = $item->purchasable?->title ?? 'Sáº£n pháº©m Ä‘Ã£ mua';
                    return $d;
                });
                return $data;
            });

        return response()->json([
            'success' => true,
            'message' => 'Láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng thÃ nh cÃ´ng',
            'data' => $orders
        ]);
    }

    /**
     * Get specific order details (for buyer only).
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();
        $order = Order::with(['items.purchasable'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng'
            ], 404);
        }

        if ($order->buyer_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p Ä‘Æ¡n hÃ ng nÃ y'
            ], 403);
        }

        $data = $order->toArray();
        $data['items'] = $order->items->map(function ($item) {
            $d = $item->toArray();
            $d['purchasable_title'] = $item->purchasable?->title ?? 'Sáº£n pháº©m Ä‘Ã£ mua';
            return $d;
        });

        return response()->json([
            'success' => true,
            'message' => 'Láº¥y chi tiáº¿t Ä‘Æ¡n hÃ ng thÃ nh cÃ´ng',
            'data' => $data
        ]);
    }

    /**
     * Place order / checkout cart items.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|in:vnpay,demo,mock',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|in:1',
            'items.*.product_type' => 'required|in:account,card,giftcode'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu đơn hàng không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $buyer = $request->user();
        $cartItems = $request->input('items');
        $paymentMethod = $request->input('payment_method');

        // 1. Validate availability and calculate total
        $totalAmount = 0;
        $orderItemsData = [];
        $uniqueItems = [];

        foreach ($cartItems as $item) {
            $id = $item['id'];
            $type = $item['product_type'];

            $itemKey = $type . ':' . $id;
            if (isset($uniqueItems[$itemKey])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mỗi sản phẩm duy nhất chỉ được xuất hiện một lần trong đơn hàng.'
                ], 422);
            }
            $uniqueItems[$itemKey] = true;

            // Find class name
            $modelClass = $this->getModelClass($type);
            if (!$modelClass) {
                return response()->json([
                    'success' => false,
                    'message' => "Loại sản phẩm không hợp lệ: {$type}"
                ], 400);
            }

            // Check db product
            $product = $modelClass::find($id);
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => "Không tìm thấy sản phẩm ID {$id} trong hệ thống"
                ], 404);
            }

            if ($product->status !== 'available') {
                return response()->json([
                    'success' => false,
                    'message' => "Sản phẩm '{$product->title}' đã bán hoặc không sẵn sàng giao dịch"
                ], 400);
            }

            $totalAmount += $product->price;
            $orderItemsData[] = [
                'price' => $product->price,
                'purchasable_type' => $modelClass,
                'purchasable_id' => $product->id,
                'delivered_data' => [] // populated when order is completed
            ];
        }
        try {
            $order = DB::transaction(function () use ($buyer, $totalAmount, $paymentMethod, $orderItemsData) {
                // Generate a transaction ID
                $transactionId = 'GAMEACC-' . rand(100000, 999999);

                // Create Order
                $order = Order::create([
                    'buyer_id' => $buyer->id,
                    'total_amount' => $totalAmount,
                    'payment_method' => $paymentMethod,
                    'payment_transaction_id' => $transactionId,
                    'status' => 'pending' // pending until paid
                ]);

                // Create Order Items
                foreach ($orderItemsData as $itemData) {
                    $itemData['order_id'] = $order->id;
                    OrderItem::create($itemData);
                }

                return $order;
            });

            // Nếu là phương thức thanh toán thử nghiệm / demo: hoàn tất ngay lập tức
            if ($paymentMethod === 'demo' || $paymentMethod === 'mock') {
                $this->completeOrder($order);
                return response()->json([
                    'success' => true,
                    'is_demo' => true,
                    'message' => 'Thanh toán thành công! Hệ thống đã tự động bàn giao sản phẩm.',
                    'order_id' => $order->id,
                    'order' => $order->fresh()->load('items')
                ]);
            }

            // 2. Tạo liên kết thanh toán VNPay Sandbox trực tiếp
            $paymentUrl = $this->generateVNPayUrl($request, $order);

            return response()->json([
                'success' => true,
                'message' => 'Đã tạo hóa đơn VNPay. Chuyển hướng thanh toán...',
                'payment_url' => $paymentUrl,
                'order_id' => $order->id,
                'simulate_url' => url("/api/orders/{$order->id}/simulate-vnpay-success")
            ]);

        } catch (\Exception $e) {
            Log::error('Checkout failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Thanh toán đơn hàng thất bại: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * VNPay Callback handling (IPN / Return).
     */
    public function vnpayCallback(Request $request)
    {
        $vnp_HashSecret = env('VNP_HASH_SECRET', 'TXMSMWCZHEXEQYHRVXYMXRRYZSQYQZSY');
        $vnp_SecureHash = $request->input('vnp_SecureHash');
        
        $inputData = array();
        foreach ($request->all() as $key => $value) {
            if (substr($key, 0, 4) == 'vnp_') {
                $inputData[$key] = $value;
            }
        }

        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        
        $i = 0;
        $hashData = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        if ($secureHash === $vnp_SecureHash) {
            $vnp_ResponseCode = $request->input('vnp_ResponseCode');
            $vnp_TxnRef = $request->input('vnp_TxnRef');
            
            // Extract order ID
            $orderId = explode('_', $vnp_TxnRef)[0];
            $order = Order::find($orderId);

            if (!$order) {
                return response('KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng tÆ°Æ¡ng á»©ng', 404);
            }

            if ($vnp_ResponseCode == '00') {
                // Payment success
                $this->completeOrder($order);
                return redirect()->away("http://localhost:3000/checkout?vnpay_success=true&order_id=" . $order->id);
            } else {
                // Ghi log chi tiáº¿t lÃ½ do há»§y/tháº¥t báº¡i tá»« VNPay
                if ($vnp_ResponseCode == '24') {
                    Log::warning("Thanh toÃ¡n Ä‘Æ¡n hÃ ng #{$order->id} bá»‹ Há»¦Y Bá»žI KHÃCH HÃ€NG. (MÃ£ lá»—i VNPay: 24)");
                } else {
                    Log::error("Thanh toÃ¡n Ä‘Æ¡n hÃ ng #{$order->id} THáº¤T Báº I. (MÃ£ pháº£n há»“i lá»—i VNPay: {$vnp_ResponseCode})");
                }

                $order->status = 'failed';
                $order->save();
                return redirect()->away("http://localhost:3000/checkout?vnpay_failed=true");
            }
        } else {
            Log::alert("Cáº£nh bÃ¡o: Chá»¯ kÃ½ VNPay Callback khÃ´ng há»£p lá»‡ Ä‘á»‘i vá»›i Ref #{$request->input('vnp_TxnRef')}. Nghi ngá»  cÃ³ hÃ nh vi gian láº­n chá»¯ kÃ½.");
            return response('Chá»¯ kÃ½ VNPay khÃ´ng há»£p lá»‡. Giao dá»‹ch bá»‹ nghi ngá»  gian láº­n.', 400);
        }
    }

    /**
     * Giả lập thanh toán VNPay thành công khi Sandbox VNPay ngoài chưa duyệt website
     */
    public function simulateVnpaySuccess($id)
    {
        $order = Order::findOrFail($id);
        $this->completeOrder($order);
        return redirect()->away("http://localhost:3000/checkout?vnpay_success=true&order_id=" . $order->id);
    }

    /**
     * Helper to map key to Model class.
     */
    private function getModelClass($type)
    {
        switch ($type) {
            case 'account': return GameAccount::class;
            case 'card': return GameCard::class;
            case 'giftcode': return GameGiftcode::class;
        }
        return null;
    }

    /**
     * Helper to finalize/complete order and copy credentials.
     */
    private function completeOrder(Order $order)
    {
        if ($order->status === 'completed') {
            return;
        }

        DB::transaction(function () use ($order) {
            $order->status = 'completed';
            $order->save();

            foreach ($order->items as $item) {
                $type = $item->purchasable_type;
                $id = $item->purchasable_id;



                $purchasable = $type::find($id);
                if ($purchasable) {
                    // Update model status
                    $purchasable->status = 'sold';
                    $purchasable->save();

                    // Generate safe delivered credentials copy
                    $deliveredData = [];
                    if ($type === GameAccount::class) {
                        $deliveredData = [
                            'type' => 'account',
                            'username' => $purchasable->account_username,
                            'password' => $purchasable->account_password
                        ];
                    } elseif ($type === GameCard::class) {
                        $deliveredData = [
                            'type' => 'card',
                            'serial' => $purchasable->card_serial,
                            'code' => $purchasable->card_code
                        ];
                    } elseif ($type === GameGiftcode::class) {
                        $deliveredData = [
                            'type' => 'giftcode',
                            'code' => $purchasable->giftcode_string
                        ];
                    }

                    $item->delivered_data = $deliveredData;
                    $item->save();
                }
            }
        });
    }

    /**
     * Helper to generate VNPay redirect Sandbox URL.
     */
    private function generateVNPayUrl(Request $request, Order $order)
    {
        $vnp_Url = env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        $vnp_Returnurl = env('VNP_RETURN_URL', 'http://localhost:8000/api/orders/vnpay-callback');
        $vnp_TmnCode = env('VNP_TMN_CODE', '2QXUIB86');
        $vnp_HashSecret = env('VNP_HASH_SECRET', 'TXMSMWCZHEXEQYHRVXYMXRRYZSQYQZSY');

        $vnp_TxnRef = $order->id . '_' . time();
        $vnp_OrderInfo = "Thanh toan don hang #" . $order->id;
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = (int) ($order->total_amount * 100); // Cast to strict integer (no decimal points)
        $vnp_Locale = 'vn';
        
        $vnp_IpAddr = $request->ip();
        if (!$vnp_IpAddr || $vnp_IpAddr === '::1' || $vnp_IpAddr === '127.0.0.1') {
            $vnp_IpAddr = '118.70.192.11'; // Fallback to public IPv4 dummy address to avoid VNPay Sandbox rejection
        }

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_BankCode" => "NCB",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $vnp_Url . "?" . $query;
        if (isset($vnp_HashSecret)) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        return $vnp_Url;
    }
}

