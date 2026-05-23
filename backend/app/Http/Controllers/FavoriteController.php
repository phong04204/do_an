<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\GameAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FavoriteController extends Controller
{
    /**
     * Get list of user's favorited game accounts.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $favorites = Favorite::with(['gameAccount.category', 'gameAccount.seller'])
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách yêu thích thành công',
            'data' => $favorites->pluck('gameAccount')
        ]);
    }

    /**
     * Add a game account to user's favorites.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'game_account_id' => 'required|exists:game_accounts,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $accountId = $request->game_account_id;

        // Check if already favorited
        $existing = Favorite::where('user_id', $user->id)
            ->where('game_account_id', $accountId)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Đã có trong danh sách yêu thích',
                'data' => $existing
            ]);
        }

        $favorite = Favorite::create([
            'user_id' => $user->id,
            'game_account_id' => $accountId
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm vào danh sách yêu thích',
            'data' => $favorite
        ], 201);
    }

    /**
     * Remove a game account from user's favorites.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        // The parameter could be either the Favorite ID or the GameAccount ID. Let's make it robust:
        // Try to find by Favorite ID first, then fallback to GameAccount ID.
        $favorite = Favorite::where('user_id', $user->id)
            ->where(function($q) use ($id) {
                $q->where('id', $id)
                  ->orWhere('game_account_id', $id);
            })
            ->first();

        if (!$favorite) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy mục yêu thích này'
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa khỏi danh sách yêu thích'
        ]);
    }
}
