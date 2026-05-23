<?php

namespace App\Http\Controllers;

use App\Models\GameAccount;
use App\Models\GameCard;
use App\Models\GameGiftcode;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function requireAdmin(Request $request): void
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Chỉ admin mới có quyền truy cập.');
        }
    }

    // ── Dashboard stats ───────────────────────────────────────────────
    public function stats(Request $request)
    {
        $this->requireAdmin($request);

        return response()->json([
            'users'          => User::count(),
            'accounts'       => GameAccount::count(),
            'cards'          => GameCard::count(),
            'giftcodes'      => GameGiftcode::count(),
            'orders'         => Order::count(),
            'revenue'        => (float) Order::where('status', 'completed')->sum('total_amount'),
            'pending_orders' => Order::where('status', 'pending')->count(),
        ]);
    }

    // ── Users ─────────────────────────────────────────────────────────
    public function users(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(User::orderByDesc('created_at')->get());
    }

    public function updateUser(Request $request, int $id)
    {
        $this->requireAdmin($request);
        $user = User::findOrFail($id);
        $user->update($request->only(['name', 'email', 'role', 'status']));
        return response()->json($user);
    }

    public function deleteUser(Request $request, int $id)
    {
        $this->requireAdmin($request);
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa người dùng.']);
    }

    // ── Game Accounts ─────────────────────────────────────────────────
    public function gameAccounts(Request $request)
    {
        $this->requireAdmin($request);

        $accounts = GameAccount::with('seller:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->makeVisible(['account_username', 'account_password'])
            ->map(fn($a) => array_merge($a->toArray(), [
                'seller_name' => $a->seller?->name ?? 'Không rõ',
            ]));

        return response()->json($accounts);
    }

    public function storeGameAccount(Request $request)
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'price'            => 'required|numeric|min:0',
            'images'           => 'nullable|array',
            'account_username' => 'required|string',
            'account_password' => 'required|string',
            'status'           => 'in:available,sold,hidden',
            'seller_id'        => 'required|exists:users,id',
        ]);

        $account = GameAccount::create($data);
        $account->load('seller:id,name');

        return response()->json(array_merge($account->makeVisible(['account_username', 'account_password'])->toArray(), [
            'seller_name' => $account->seller?->name ?? 'Không rõ',
        ]), 201);
    }

    public function updateGameAccount(Request $request, int $id)
    {
        $this->requireAdmin($request);
        $account = GameAccount::findOrFail($id);
        $account->update($request->only(['title', 'description', 'price', 'images', 'status', 'account_username', 'account_password']));
        return response()->json($account->makeVisible(['account_username', 'account_password']));
    }

    public function deleteGameAccount(Request $request, int $id)
    {
        $this->requireAdmin($request);
        GameAccount::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa tài khoản game.']);
    }

    // ── Game Cards ────────────────────────────────────────────────────
    public function gameCards(Request $request)
    {
        $this->requireAdmin($request);

        $cards = GameCard::with('seller:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->makeVisible(['card_serial', 'card_code'])
            ->map(fn($c) => array_merge($c->toArray(), [
                'seller_name' => $c->seller?->name ?? 'Không rõ',
            ]));

        return response()->json($cards);
    }

    public function storeGameCard(Request $request)
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'card_serial' => 'required|string',
            'card_code'   => 'required|string',
            'status'      => 'in:available,sold,hidden',
            'seller_id'   => 'required|exists:users,id',
        ]);

        $card = GameCard::create($data);
        $card->load('seller:id,name');

        return response()->json(array_merge($card->makeVisible(['card_serial', 'card_code'])->toArray(), [
            'seller_name' => $card->seller?->name ?? 'Không rõ',
        ]), 201);
    }

    public function updateGameCard(Request $request, int $id)
    {
        $this->requireAdmin($request);
        $card = GameCard::findOrFail($id);
        $card->update($request->only(['title', 'description', 'price', 'card_serial', 'card_code', 'status']));
        return response()->json($card->makeVisible(['card_serial', 'card_code']));
    }

    public function deleteGameCard(Request $request, int $id)
    {
        $this->requireAdmin($request);
        GameCard::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa thẻ game.']);
    }

    // ── Game Giftcodes ────────────────────────────────────────────────
    public function gameGiftcodes(Request $request)
    {
        $this->requireAdmin($request);

        $giftcodes = GameGiftcode::with('seller:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->makeVisible(['giftcode_string'])
            ->map(fn($g) => array_merge($g->toArray(), [
                'seller_name' => $g->seller?->name ?? 'Không rõ',
            ]));

        return response()->json($giftcodes);
    }

    public function storeGameGiftcode(Request $request)
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'price'           => 'required|numeric|min:0',
            'giftcode_string' => 'required|string',
            'status'          => 'in:available,sold,hidden',
            'seller_id'       => 'required|exists:users,id',
        ]);

        $gc = GameGiftcode::create($data);
        $gc->load('seller:id,name');

        return response()->json(array_merge($gc->makeVisible(['giftcode_string'])->toArray(), [
            'seller_name' => $gc->seller?->name ?? 'Không rõ',
        ]), 201);
    }

    public function updateGameGiftcode(Request $request, int $id)
    {
        $this->requireAdmin($request);
        $gc = GameGiftcode::findOrFail($id);
        $gc->update($request->only(['title', 'description', 'price', 'giftcode_string', 'status']));
        return response()->json($gc->makeVisible(['giftcode_string']));
    }

    public function deleteGameGiftcode(Request $request, int $id)
    {
        $this->requireAdmin($request);
        GameGiftcode::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa giftcode.']);
    }

    // ── Orders ────────────────────────────────────────────────────────
    public function orders(Request $request)
    {
        $this->requireAdmin($request);

        $orders = Order::with(['buyer:id,name', 'items'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($order) {
                $data = $order->toArray();
                $data['buyer_name'] = $order->buyer?->name ?? 'Không rõ';
                $data['items'] = $order->items->map(function ($item) {
                    $d = $item->toArray();
                    $d['purchasable_title'] = $item->purchasable?->title ?? 'Sản phẩm đã bị xóa';
                    return $d;
                });
                return $data;
            });

        return response()->json($orders);
    }

    public function updateOrder(Request $request, int $id)
    {
        $this->requireAdmin($request);
        $order = Order::findOrFail($id);
        $order->update($request->only(['status']));
        return response()->json($order);
    }
}
