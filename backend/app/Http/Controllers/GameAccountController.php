<?php

namespace App\Http\Controllers;

use App\Models\GameAccount;
use Illuminate\Http\Request;

class GameAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = GameAccount::where('status', 'available');

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('price_min')) $query->where('price', '>=', $request->input('price_min'));
        if ($request->filled('price_max')) $query->where('price', '<=', $request->input('price_max'));

        $sort = $request->input('sort', 'newest');
        if ($sort === 'price_asc')  $query->orderBy('price', 'asc');
        elseif ($sort === 'price_desc') $query->orderBy('price', 'desc');
        else $query->orderByDesc('created_at');

        return response()->json($query->get());
    }

    public function show($id)
    {
        $account = GameAccount::find($id);

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản game'], 404);
        }

        return response()->json(['success' => true, 'data' => $account]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['seller', 'admin'])) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền đăng bán tài khoản.'], 403);
        }

        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'price'            => 'required|numeric|min:0',
            'images'           => 'nullable|array',
            'account_username' => 'required|string',
            'account_password' => 'required|string',
        ]);

        $account = GameAccount::create(array_merge($data, [
            'seller_id' => $user->id,
            'status'    => 'available',
        ]));

        return response()->json(['success' => true, 'data' => $account], 201);
    }

    public function update(Request $request, $id)
    {
        $account = GameAccount::find($id);

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản game'], 404);
        }

        $user = $request->user();
        if ($account->seller_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền chỉnh sửa tài khoản này'], 403);
        }

        $account->update($request->only(['title', 'description', 'price', 'images', 'status', 'account_username', 'account_password']));

        return response()->json(['success' => true, 'data' => $account]);
    }

    public function destroy(Request $request, $id)
    {
        $account = GameAccount::find($id);

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản game'], 404);
        }

        $user = $request->user();
        if ($account->seller_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền xóa tài khoản này'], 403);
        }

        $account->delete();

        return response()->json(['success' => true, 'message' => 'Xóa tài khoản game thành công']);
    }

    public function mySelling(Request $request)
    {
        $accounts = GameAccount::where('seller_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $accounts]);
    }
}
