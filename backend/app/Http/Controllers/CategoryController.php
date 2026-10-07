<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of all categories.
     */
    public function index()
    {
        $categories = [
            ['id' => 1, 'name' => 'Liên Minh Huyền Thoại', 'slug' => 'lol',      'icon' => 'lol',      'filter_schema' => [], 'accounts_count' => 1234],
            ['id' => 2, 'name' => 'VALORANT',             'slug' => 'valorant', 'icon' => 'valorant', 'filter_schema' => [], 'accounts_count' => 856],
            ['id' => 3, 'name' => 'Free Fire',            'slug' => 'freefire', 'icon' => 'freefire', 'filter_schema' => [], 'accounts_count' => 2341],
            ['id' => 4, 'name' => 'Liên Quân Mobile',     'slug' => 'lienquan', 'icon' => 'lienquan', 'filter_schema' => [], 'accounts_count' => 987],
            ['id' => 5, 'name' => 'Genshin Impact',        'slug' => 'genshin',  'icon' => 'genshin',  'filter_schema' => [], 'accounts_count' => 432],
            ['id' => 6, 'name' => 'Mobile Legends',        'slug' => 'mlbb',     'icon' => 'mlbb',     'filter_schema' => [], 'accounts_count' => 673],
        ];
        
        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách danh mục thành công',
            'data' => $categories
        ]);
    }
}
