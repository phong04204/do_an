<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:users,name',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
        ], [
            'name.unique' => 'Tên đăng nhập đã tồn tại trong hệ thống.',
            'email.unique' => 'Địa chỉ email đã được sử dụng bởi tài khoản khác.',
            'email.email' => 'Địa chỉ email không đúng định dạng.',
            'password.min' => 'Mật khẩu phải chứa ít nhất 6 ký tự.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first() ?: 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'buyer', // default role
            'avatar' => 'https://api.dicebear.com/7.x/adventurer/svg?seed=' . urlencode($request->name),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký tài khoản thành công',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 201);
    }

    /**
     * Log in a user and return token.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $loginValue = $request->email;
        $user = User::where('email', $loginValue)
            ->orWhere('name', $loginValue)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email/tên đăng nhập hoặc mật khẩu không chính xác'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ]);
    }

    /**
     * Log out the current user (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công'
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin tài khoản thành công',
            'data' => $request->user()
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:users,name,' . $user->id,
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string',
        ], [
            'name.unique' => 'Tên đăng nhập đã tồn tại trong hệ thống.',
            'email.unique' => 'Địa chỉ email đã được sử dụng bởi tài khoản khác.',
            'email.email' => 'Địa chỉ email không đúng định dạng.',
            'password.min' => 'Mật khẩu phải chứa ít nhất 6 ký tự.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first() ?: 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin cá nhân thành công',
            'data' => $user
        ]);
    }

    /**
     * Redirect to Google OAuth.
     */
    public function redirectToGoogle()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        if (empty(config('services.google.client_id')) || empty(config('services.google.client_secret'))) {
            return redirect($frontendUrl . '/login?error=' . urlencode('Chưa cấu hình GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong file backend/.env'));
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Handle callback from Google OAuth.
     */
    public function handleGoogleCallback()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            Log::error('Google OAuth callback error: ' . $e->getMessage());
            return redirect($frontendUrl . '/auth/callback?error=' . urlencode('Đăng nhập Google không thành công. Vui lòng thử lại.'));
        }

        try {
            $email = $googleUser->getEmail();
            $googleId = $googleUser->getId();
            $avatar = $googleUser->getAvatar();
            $name = $googleUser->getName();

            // 1. Try finding by google_id
            $user = User::where('google_id', $googleId)->first();

            if (!$user) {
                // 2. Try finding by email
                $user = User::where('email', $email)->first();

                if ($user) {
                    // Link google_id if existing user
                    $user->google_id = $googleId;
                    if (empty($user->avatar)) {
                        $user->avatar = $avatar;
                    }
                    $user->save();
                } else {
                    // 3. Create new user
                    // Ensure unique name
                    $baseName = $name ?: explode('@', $email)[0];
                    $uniqueName = $baseName;
                    $counter = 1;
                    while (User::where('name', $uniqueName)->exists()) {
                        $uniqueName = $baseName . '_' . $counter++;
                    }

                    $user = User::create([
                        'name' => $uniqueName,
                        'email' => $email,
                        'google_id' => $googleId,
                        'avatar' => $avatar ?: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' . urlencode($uniqueName),
                        'role' => 'buyer',
                        'status' => 'active',
                        'password' => null,
                    ]);
                }
            }

            if ($user->status === 'banned') {
                return redirect($frontendUrl . '/auth/callback?error=' . urlencode('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'));
            }

            // Create Sanctum Bearer Token
            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect($frontendUrl . '/auth/callback?token=' . $token);
        } catch (\Exception $e) {
            Log::error('Google OAuth user process error: ' . $e->getMessage());
            return redirect($frontendUrl . '/auth/callback?error=' . urlencode('Có lỗi xảy ra khi xử lý thông tin tài khoản Google.'));
        }
    }
}
