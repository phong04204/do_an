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
        $categories = Category::all();
        
        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách danh mục thành công',
            'data' => $categories
        ]);
    }
}
