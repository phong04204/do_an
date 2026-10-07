<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Upload one or multiple images
     */
    public function upload(Request $request)
    {
        // Support either a single file in 'file' / 'image', or array of files in 'files' / 'images'
        $uploadedUrls = [];

        if ($request->hasFile('files')) {
            $request->validate([
                'files'   => 'required|array',
                'files.*' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:25600',
            ], [
                'files.*.image' => 'File phải là hình ảnh hợp lệ.',
                'files.*.mimes' => 'Hệ thống chỉ hỗ trợ định dạng: jpeg, png, jpg, webp, gif.',
                'files.*.max'   => 'Dung lượng mỗi ảnh tối đa là 25MB.',
            ]);

            foreach ($request->file('files') as $file) {
                $path = $file->store('uploads/accounts', 'public');
                $uploadedUrls[] = asset('storage/' . $path);
            }
        } elseif ($request->hasFile('file')) {
            $request->validate([
                'file' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:25600',
            ], [
                'file.image' => 'File phải là hình ảnh hợp lệ.',
                'file.mimes' => 'Hệ thống chỉ hỗ trợ định dạng: jpeg, png, jpg, webp, gif.',
                'file.max'   => 'Dung lượng ảnh tối đa là 25MB.',
            ]);

            $path = $request->file('file')->store('uploads/accounts', 'public');
            $uploadedUrls[] = asset('storage/' . $path);
        } elseif ($request->hasFile('image')) {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:25600',
            ], [
                'image.image' => 'File phải là hình ảnh hợp lệ.',
                'image.mimes' => 'Hệ thống chỉ hỗ trợ định dạng: jpeg, png, jpg, webp, gif.',
                'image.max'   => 'Dung lượng ảnh tối đa là 25MB.',
            ]);

            $path = $request->file('image')->store('uploads/accounts', 'public');
            $uploadedUrls[] = asset('storage/' . $path);
        } else {
            return response()->json([
                'message' => 'Không tìm thấy file tải lên. Vui lòng chọn ít nhất một file ảnh.',
            ], 422);
        }

        return response()->json([
            'message' => 'Tải ảnh lên thành công!',
            'url'     => $uploadedUrls[0] ?? null,
            'urls'    => $uploadedUrls,
        ]);
    }
}
