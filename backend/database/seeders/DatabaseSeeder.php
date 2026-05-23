<?php

namespace Database\Seeders;

use App\Models\GameAccount;
use App\Models\GameCard;
use App\Models\GameGiftcode;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ==================== SEED USERS ====================

        $admin = User::firstOrCreate(
            ['email' => 'admin@gameacc.vn'],
            [
                'name'     => 'Hệ Thống Admin',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
                'status'   => 'active',
            ]
        );

        $seller = User::firstOrCreate(
            ['email' => 'seller@gameacc.vn'],
            [
                'name'     => 'Nhà Bán Uy Tín',
                'password' => Hash::make('seller123'),
                'role'     => 'seller',
                'status'   => 'active',
            ]
        );

        $buyer = User::firstOrCreate(
            ['email' => 'buyer@gameacc.vn'],
            [
                'name'     => 'Người Mua Trải Nghiệm',
                'password' => Hash::make('buyer123'),
                'role'     => 'buyer',
                'status'   => 'active',
            ]
        );


        // ==================== SEED GAME ACCOUNTS ====================

        $acc1 = GameAccount::firstOrCreate(
            ['title' => 'LMHT Siêu Phẩm - Full Tướng - 250+ Trang Phục - Rank Kim Cương IV'],
            [
                'seller_id'        => $seller->id,
                'description'      => 'Cần bán acc LMHT tâm huyết chơi từ mùa 3. Đầy đủ các tướng đến thời điểm hiện tại. Sở hữu nhiều trang phục tối thượng và rất nhiều trang phục huyền thoại. Rank Kim Cương IV mùa này khung cực đẹp.',
                'price'            => 450000.00,
                'images'           => json_encode([
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                    'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600',
                ]),
                'account_username' => 'lmht_kc_user1',
                'account_password' => 'SuperSecret@123',
                'status'           => 'available',
            ]
        );

        $acc2 = GameAccount::firstOrCreate(
            ['title' => 'Acc LMHT Giá Rẻ - Khởi Đầu Hoàn Hảo - Rank Vàng II'],
            [
                'seller_id'        => $seller->id,
                'description'      => 'Tài khoản cực kỳ thích hợp cho các bạn muốn cày cuốc lại. Có 80 tướng thông dụng và 45 trang phục đẹp mắt. Level 78. Giá cực hạt dẻ.',
                'price'            => 99000.00,
                'images'           => json_encode([
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ]),
                'account_username' => 'lmht_vang_user2',
                'account_password' => 'GiaRe@456',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Valorant VIP - Dao Reaver, Vandal Prime - Rank Bạch Kim II'],
            [
                'seller_id'        => $seller->id,
                'description'      => 'Bán tài khoản Valorant đầy đủ súng quốc dân được nâng cấp full hiệu ứng: Reaver Vandal, Prime Vandal, Dao Karambit Prime. Chơi mượt mà không lo đụng hàng. Full đặc vụ.',
                'price'            => 350000.00,
                'images'           => json_encode([
                    'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600',
                ]),
                'account_username' => 'valo_bp_user3',
                'account_password' => 'ValoSecret@789',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Valorant Rank Thần Thoại - Full Agents - Nhiều Dao Độc Lạ'],
            [
                'seller_id'        => $seller->id,
                'description'      => 'Tài khoản rank cao Thần Thoại III cực ngầu. Có Dao Kuronami, Dao Champions 2023, Vandal Kuronami full nâng cấp.',
                'price'            => 690000.00,
                'images'           => json_encode([
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                ]),
                'account_username' => 'valo_tm_user4',
                'account_password' => 'ThanhThoai@999',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Nick Free Fire Cực VIP - MP40 Mãng Xà LV7 - AK Rồng Xanh LV6'],
            [
                'seller_id'        => $seller->id,
                'description'      => 'Nick Free Fire siêu phẩm cho anh em đam mê súng nâng cấp. MP40 Mãng Xà level max (lv7) bắn cực phê, AK Rồng Xanh level 6. Rất nhiều đồ thời trang VIP.',
                'price'            => 520000.00,
                'images'           => json_encode([
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ]),
                'account_username' => 'ff_vip_user5',
                'account_password' => 'FreeFire@VIP5',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Acc Free Fire Tầm Trung - Nhiều Set Đồ Hot Trend - Rank Kim Cương II'],
            [
                'seller_id'        => $seller->id,
                'description'      => 'Acc Free Fire ngon bổ rẻ, có set đồ Hip Hop huyền thoại. Phù hợp leo rank cùng bạn bè.',
                'price'            => 150000.00,
                'images'           => json_encode([
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ]),
                'account_username' => 'ff_mid_user6',
                'account_password' => 'TamTrung@321',
                'status'           => 'available',
            ]
        );


        // ==================== SEED GAME CARDS ====================

        $card1 = GameCard::firstOrCreate(
            ['card_serial' => 'GA123456789'],
            [
                'seller_id'   => $seller->id,
                'title'       => 'Thẻ Garena 100.000đ - Nạp ngay không cần chờ',
                'description' => 'Thẻ Garena mệnh giá 100k dùng được cho LMHT, VALORANT, Đấu Trường Chân Lý.',
                'price'       => 95000.00,
                'card_code'   => 'GARN-1234-5678-90AB',
                'status'      => 'available',
            ]
        );

        GameCard::firstOrCreate(
            ['card_serial' => 'GA987654321'],
            [
                'seller_id'   => $seller->id,
                'title'       => 'Thẻ Garena 50.000đ - Tiết kiệm thêm 5%',
                'description' => 'Thẻ Garena 50k giá ưu đãi, giao ngay sau khi thanh toán.',
                'price'       => 47500.00,
                'card_code'   => 'GARN-9876-5432-1ZYX',
                'status'      => 'available',
            ]
        );

        GameCard::firstOrCreate(
            ['card_serial' => 'MBL112233445'],
            [
                'seller_id'   => $seller->id,
                'title'       => 'Thẻ Mobi 200.000đ - Free Fire Diamond',
                'description' => 'Thẻ Mobi mệnh giá 200k dùng để nạp Kim Cương Free Fire hoặc các game mobile.',
                'price'       => 190000.00,
                'card_code'   => 'MOBI-2222-3344-5566',
                'status'      => 'available',
            ]
        );


        // ==================== SEED GAME GIFTCODES ====================

        $gc1 = GameGiftcode::firstOrCreate(
            ['giftcode_string' => 'VALO-CHAMP-2026-ABCD'],
            [
                'seller_id'   => $seller->id,
                'title'       => 'Giftcode VALORANT Champions 2026 - Vũ Khí Giới Hạn',
                'description' => 'Code đổi gói vũ khí Champions 2026 độc quyền. Sử dụng tại cửa hàng trong game để đổi.',
                'price'       => 250000.00,
                'status'      => 'available',
            ]
        );

        GameGiftcode::firstOrCreate(
            ['giftcode_string' => 'LMHT-SKIN-FREE-XYZW'],
            [
                'seller_id'   => $seller->id,
                'title'       => 'Giftcode LMHT - Trang Phục Miễn Phí Đặc Biệt',
                'description' => 'Code tặng trang phục đặc biệt cho tài khoản LMHT. Nhập vào mục đổi code trong game.',
                'price'       => 120000.00,
                'status'      => 'available',
            ]
        );

        GameGiftcode::firstOrCreate(
            ['giftcode_string' => 'FF-DIAMOND-500-QWER'],
            [
                'seller_id'   => $seller->id,
                'title'       => 'Giftcode Free Fire - 500 Kim Cương Tặng Kèm',
                'description' => 'Code đổi 500 Kim Cương Free Fire, sử dụng tại trang đổi thưởng chính thức.',
                'price'       => 80000.00,
                'status'      => 'available',
            ]
        );


        // ==================== SEED SAMPLE ORDER ====================

        $order = Order::firstOrCreate(
            ['payment_transaction_id' => 'TXN-SEED-20260523-001'],
            [
                'buyer_id'        => $buyer->id,
                'total_amount'    => 450000.00,
                'payment_method'  => 'bank_transfer',
                'status'          => 'completed',
            ]
        );

        OrderItem::firstOrCreate(
            ['order_id' => $order->id, 'purchasable_id' => $acc1->id],
            [
                'price'            => 450000.00,
                'purchasable_type' => 'App\\Models\\GameAccount',
                'delivered_data'   => json_encode([
                    'username' => $acc1->account_username,
                    'password' => $acc1->account_password,
                    'note'     => 'Giao dịch hoàn thành lúc ' . now()->toDateTimeString(),
                ]),
            ]
        );

        // Cập nhật trạng thái acc1 thành sold
        $acc1->update(['status' => 'sold']);

        $this->command->info('✅ Database web_game_db seeded successfully!');
        $this->command->table(
            ['Account', 'Email', 'Password', 'Role'],
            [
                ['Admin',  'admin@gameacc.vn',  'admin123',  'admin'],
                ['Seller', 'seller@gameacc.vn', 'seller123', 'seller'],
                ['Buyer',  'buyer@gameacc.vn',  'buyer123',  'buyer'],
            ]
        );
    }
}
