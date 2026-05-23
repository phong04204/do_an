<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GameAccountController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\TransactionController;
use App\Models\GameCard;
use App\Models\GameGiftcode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==================== PUBLIC ROUTES ====================

// Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Categories
Route::get('/categories', [CategoryController::class, 'index']);

// Game Accounts
Route::get('/game-accounts', [GameAccountController::class, 'index']);
Route::get('/game-accounts/{id}', [GameAccountController::class, 'show']);

// Game Cards (public listing — serial/code hidden by model)
Route::get('/game-cards', function (Request $request) {
    $query = GameCard::where('status', 'available');
    if ($request->filled('q')) $query->where('title', 'like', '%' . $request->input('q') . '%');
    if ($request->filled('price_min')) $query->where('price', '>=', $request->input('price_min'));
    if ($request->filled('price_max')) $query->where('price', '<=', $request->input('price_max'));
    $sort = $request->input('sort', 'newest');
    if ($sort === 'price_asc') $query->orderBy('price', 'asc');
    elseif ($sort === 'price_desc') $query->orderBy('price', 'desc');
    else $query->orderByDesc('created_at');
    return response()->json($query->get());
});

Route::get('/game-cards/{id}', function ($id) {
    $card = GameCard::find($id);
    if (!$card) return response()->json(['success' => false, 'message' => 'Không tìm thấy thẻ game'], 404);
    return response()->json(['success' => true, 'data' => $card]);
});

// Game Giftcodes (public listing — giftcode_string hidden by model)
Route::get('/game-giftcodes', function (Request $request) {
    $query = GameGiftcode::where('status', 'available');
    if ($request->filled('q')) $query->where('title', 'like', '%' . $request->input('q') . '%');
    if ($request->filled('price_min')) $query->where('price', '>=', $request->input('price_min'));
    if ($request->filled('price_max')) $query->where('price', '<=', $request->input('price_max'));
    $sort = $request->input('sort', 'newest');
    if ($sort === 'price_asc') $query->orderBy('price', 'asc');
    elseif ($sort === 'price_desc') $query->orderBy('price', 'desc');
    else $query->orderByDesc('created_at');
    return response()->json($query->get());
});

Route::get('/game-giftcodes/{id}', function ($id) {
    $gc = GameGiftcode::find($id);
    if (!$gc) return response()->json(['success' => false, 'message' => 'Không tìm thấy giftcode'], 404);
    return response()->json(['success' => true, 'data' => $gc]);
});


// ==================== PROTECTED ROUTES (SANCTUM) ====================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth profile & logout
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Game Accounts (Protected operations)
    Route::get('/game-accounts/my', [GameAccountController::class, 'mySelling']); // Must be above dynamic {id}
    Route::post('/game-accounts', [GameAccountController::class, 'store']);
    Route::post('/game-accounts/{id}', [GameAccountController::class, 'update']); // Using POST to allow form data containing files/patch if needed, or update
    Route::delete('/game-accounts/{id}', [GameAccountController::class, 'destroy']);

    // Favorites
    Route::prefix('favorites')->group(function () {
        Route::get('/', [FavoriteController::class, 'index']);
        Route::post('/', [FavoriteController::class, 'store']);
        Route::delete('/{id}', [FavoriteController::class, 'destroy']);
    });

    // Transactions (Escrow System)
    Route::prefix('transactions')->group(function () {
        Route::get('/', [TransactionController::class, 'index']);
        Route::post('/', [TransactionController::class, 'store']);
        Route::post('/process-payment', [TransactionController::class, 'processPayment']); // deposit
        Route::get('/{id}', [TransactionController::class, 'show']);
        Route::patch('/{id}/confirm', [TransactionController::class, 'confirm']);
        Route::patch('/{id}/cancel', [TransactionController::class, 'cancel']);
        
        // Hooks-aligned routes
        Route::patch('/{id}/confirm-delivery', [TransactionController::class, 'confirmDelivery']);
        Route::patch('/{id}/complete', [TransactionController::class, 'confirm']);
        Route::post('/{id}/dispute', [TransactionController::class, 'dispute']);
    });

    // ── Admin routes (role=admin only, checked inside controller) ──
    Route::prefix('admin')->group(function () {
        Route::get('/stats',                  [AdminController::class, 'stats']);

        Route::get('/users',                  [AdminController::class, 'users']);
        Route::put('/users/{id}',             [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}',          [AdminController::class, 'deleteUser']);

        Route::get('/game-accounts',          [AdminController::class, 'gameAccounts']);
        Route::post('/game-accounts',         [AdminController::class, 'storeGameAccount']);
        Route::put('/game-accounts/{id}',     [AdminController::class, 'updateGameAccount']);
        Route::delete('/game-accounts/{id}',  [AdminController::class, 'deleteGameAccount']);

        Route::get('/game-cards',             [AdminController::class, 'gameCards']);
        Route::post('/game-cards',            [AdminController::class, 'storeGameCard']);
        Route::put('/game-cards/{id}',        [AdminController::class, 'updateGameCard']);
        Route::delete('/game-cards/{id}',     [AdminController::class, 'deleteGameCard']);

        Route::get('/game-giftcodes',         [AdminController::class, 'gameGiftcodes']);
        Route::post('/game-giftcodes',        [AdminController::class, 'storeGameGiftcode']);
        Route::put('/game-giftcodes/{id}',    [AdminController::class, 'updateGameGiftcode']);
        Route::delete('/game-giftcodes/{id}', [AdminController::class, 'deleteGameGiftcode']);

        Route::get('/orders',                 [AdminController::class, 'orders']);
        Route::put('/orders/{id}',            [AdminController::class, 'updateOrder']);
    });
});
