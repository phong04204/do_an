<?php

namespace Database\Seeders;

use App\Models\GameAccount;
use App\Models\GameCard;
use App\Models\GameGiftcode;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
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
                'phone'    => '0901234567',
            ]
        );

        $buyer1 = User::firstOrCreate(
            ['email' => 'buyer@gameacc.vn'],
            [
                'name'     => 'Người Mua Trải Nghiệm',
                'password' => Hash::make('buyer123'),
                'role'     => 'buyer',
                'status'   => 'active',
                'phone'    => '0912345678',
            ]
        );

        $buyer2 = User::firstOrCreate(
            ['email' => 'nguyenvana@gmail.com'],
            [
                'name'     => 'Nguyễn Văn A',
                'password' => Hash::make('password123'),
                'role'     => 'buyer',
                'status'   => 'active',
                'phone'    => '0923456789',
            ]
        );

        $buyer3 = User::firstOrCreate(
            ['email' => 'tranthib@gmail.com'],
            [
                'name'     => 'Trần Thị B',
                'password' => Hash::make('password123'),
                'role'     => 'buyer',
                'status'   => 'active',
                'phone'    => '0934567890',
            ]
        );

        $buyer4 = User::firstOrCreate(
            ['email' => 'levanc@gmail.com'],
            [
                'name'     => 'Lê Văn C',
                'password' => Hash::make('password123'),
                'role'     => 'buyer',
                'status'   => 'active',
                'phone'    => '0945678901',
            ]
        );

        $buyer5 = User::firstOrCreate(
            ['email' => 'phamthid@gmail.com'],
            [
                'name'     => 'Phạm Thị D',
                'password' => Hash::make('password123'),
                'role'     => 'buyer',
                'status'   => 'active',
                'phone'    => '0956789012',
            ]
        );

        $buyer6 = User::firstOrCreate(
            ['email' => 'hoangvane@gmail.com'],
            [
                'name'     => 'Hoàng Văn E',
                'password' => Hash::make('password123'),
                'role'     => 'buyer',
                'status'   => 'active',
                'phone'    => '0967890123',
            ]
        );


        // ==================== SEED GAME ACCOUNTS ====================

        // --- LMHT ---
        $acc_lmht_1 = GameAccount::firstOrCreate(
            ['title' => 'LMHT Siêu Phẩm - Full Tướng - 250+ Trang Phục - Rank Kim Cương IV'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Cần bán acc LMHT tâm huyết chơi từ mùa 3. Đầy đủ các tướng đến thời điểm hiện tại. Sở hữu nhiều trang phục tối thượng và rất nhiều trang phục huyền thoại. Rank Kim Cương IV mùa này khung cực đẹp.',
                'price'            => 450000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                    'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600',
                ],
                'account_username' => 'lmht_kc_user1',
                'account_password' => 'SuperSecret@123',
                'status'           => 'sold',
            ]
        );

        $acc_lmht_2 = GameAccount::firstOrCreate(
            ['title' => 'Acc LMHT Giá Rẻ - Khởi Đầu Hoàn Hảo - Rank Vàng II'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Tài khoản cực kỳ thích hợp cho các bạn muốn cày cuốc lại. Có 80 tướng thông dụng và 45 trang phục đẹp mắt. Level 78. Giá cực hạt dẻ.',
                'price'            => 99000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ],
                'account_username' => 'lmht_vang_user2',
                'account_password' => 'GiaRe@456',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'LMHT Thách Đấu Việt Nam - Full Tướng - 500+ Skin - Rank Thách Đấu'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Tài khoản đỉnh của đỉnh, rank Thách Đấu server Việt Nam. Có 500+ trang phục bao gồm skin prestige, tối thượng, huyền thoại. Full tướng không thiếu cái nào.',
                'price'            => 1500000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ],
                'account_username' => 'lmht_thachdau_vn',
                'account_password' => 'ThachDau@VN2026',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'LMHT Bạch Kim I - 120 Tướng - 80 Skin Đẹp - Level 100'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Nick LMHT sạch đẹp không vi phạm, rank Bạch Kim I ổn định. Có 120 tướng và 80 skin bao gồm nhiều skin hiếm theo mùa. Level 100.',
                'price'            => 180000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600',
                ],
                'account_username' => 'lmht_bp1_user4',
                'account_password' => 'BachKim@111',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'LMHT Tân Binh - 30 Tướng Starter - Rank Sắt III'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Tài khoản mới tạo phù hợp cho người mới bắt đầu chơi LMHT. Đã có 30 tướng cơ bản, một số skin đẹp. Rank sắt III để leo dần.',
                'price'            => 30000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ],
                'account_username' => 'lmht_newbie_user5',
                'account_password' => 'TanBinh@333',
                'status'           => 'available',
            ]
        );

        // --- Valorant ---
        $acc_valo_1 = GameAccount::firstOrCreate(
            ['title' => 'Valorant VIP - Dao Reaver, Vandal Prime - Rank Bạch Kim II'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Bán tài khoản Valorant đầy đủ súng quốc dân được nâng cấp full hiệu ứng: Reaver Vandal, Prime Vandal, Dao Karambit Prime. Chơi mượt mà không lo đụng hàng. Full đặc vụ.',
                'price'            => 350000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600',
                ],
                'account_username' => 'valo_bp_user3',
                'account_password' => 'ValoSecret@789',
                'status'           => 'sold',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Valorant Rank Thần Thoại - Full Agents - Nhiều Dao Độc Lạ'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Tài khoản rank cao Thần Thoại III cực ngầu. Có Dao Kuronami, Dao Champions 2023, Vandal Kuronami full nâng cấp.',
                'price'            => 690000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                ],
                'account_username' => 'valo_tm_user4',
                'account_password' => 'ThanhThoai@999',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Valorant Tân Binh - Full Agent - Rank Đồng II'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Nick Valorant mới, đã mở full tất cả đặc vụ. Rank đồng II phù hợp leo rank từ đầu. Một số bundle vũ khí cơ bản.',
                'price'            => 120000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ],
                'account_username' => 'valo_bronze_user7',
                'account_password' => 'Bronze@Valo7',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Valorant Kim Cương I - Bundle RGX - 15 Agents - Nhiều VP'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Tài khoản Valorant Kim Cương I cực xịn. Bundle RGX full bộ, Phantom RGX max level cực đẹp. Còn 2400 VP chưa dùng. 15 đặc vụ đã mở.',
                'price'            => 480000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600',
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                ],
                'account_username' => 'valo_kc1_rgx',
                'account_password' => 'Diamond@RGX1',
                'status'           => 'available',
            ]
        );

        // --- Free Fire ---
        $acc_ff_1 = GameAccount::firstOrCreate(
            ['title' => 'Nick Free Fire Cực VIP - MP40 Mãng Xà LV7 - AK Rồng Xanh LV6'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Nick Free Fire siêu phẩm cho anh em đam mê súng nâng cấp. MP40 Mãng Xà level max (lv7) bắn cực phê, AK Rồng Xanh level 6. Rất nhiều đồ thời trang VIP.',
                'price'            => 520000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ],
                'account_username' => 'ff_vip_user5',
                'account_password' => 'FreeFire@VIP5',
                'status'           => 'sold',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Acc Free Fire Tầm Trung - Nhiều Set Đồ Hot Trend - Rank Kim Cương II'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Acc Free Fire ngon bổ rẻ, có set đồ Hip Hop huyền thoại. Phù hợp leo rank cùng bạn bè.',
                'price'            => 150000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ],
                'account_username' => 'ff_mid_user6',
                'account_password' => 'TamTrung@321',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Free Fire Heroic - Full Pet Max - Lô Súng Nâng Cấp Khủng'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Tài khoản Free Fire Heroic xịn sò. Pet đầy đủ đã max level hết. Súng AWM Rồng nâng level 7, M1014 Vàng level 6. Cực nhiều trang phục đặc biệt và set giày hiếm.',
                'price'            => 750000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ],
                'account_username' => 'ff_heroic_top',
                'account_password' => 'Heroic@FF2026',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Free Fire Mới - Rank Vàng - Có Gói Élite Pass Season 50'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Nick Free Fire rank Vàng, đã mua Élite Pass Season 50 hoàn thành 100%. Nhiều skin đẹp từ pass. Phù hợp người muốn có nick ngon mà không tốn công.',
                'price'            => 85000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ],
                'account_username' => 'ff_gold_ep50',
                'account_password' => 'Gold@ElitePass',
                'status'           => 'available',
            ]
        );

        // --- Liên Quân Mobile ---
        GameAccount::firstOrCreate(
            ['title' => 'Liên Quân Mobile - 80 Tướng - 50+ Skin - Rank Tinh Anh II'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Tài khoản Liên Quân Mobile ngon, có 80 tướng đầy đủ các role. Hơn 50 skin đẹp bao gồm một số skin từ sự kiện. Rank Tinh Anh II ổn định.',
                'price'            => 220000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600',
                ],
                'account_username' => 'lq_elite2_user',
                'account_password' => 'LienQuan@Elite',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'Liên Quân Mobile - Huyền Thoại III - Full Tướng - Nhiều Skin Limited'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Nick Liên Quân cực phẩm rank Huyền Thoại III. Full tướng, nhiều skin limited theo sự kiện cực hiếm. Đây là tài khoản đầu tư nhiều năm.',
                'price'            => 980000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                    'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600',
                ],
                'account_username' => 'lq_mythic3_vip',
                'account_password' => 'Mythic@LQ999',
                'status'           => 'available',
            ]
        );

        // --- PUBG Mobile ---
        GameAccount::firstOrCreate(
            ['title' => 'PUBG Mobile - Conqueror - Full Outfit - M416 Glacier LV9'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Tài khoản PUBG Mobile đỉnh cao rank Conqueror. M416 Glacier nâng level 9 là cây súng ngon nhất game. Đầy đủ outfit giới hạn theo mùa.',
                'price'            => 850000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                ],
                'account_username' => 'pubg_conq_glacier',
                'account_password' => 'Conqueror@PUBG',
                'status'           => 'available',
            ]
        );

        GameAccount::firstOrCreate(
            ['title' => 'PUBG Mobile - Platinum II - Starter Kit Tốt - Nhiều Crate Outfit'],
            [
                'seller_id'        => $admin->id,
                'description'      => 'Tài khoản PUBG Mobile rank Platinum II, phù hợp cho người muốn tiếp tục leo rank. Có nhiều outfit từ crate mùa cũ. Súng AWM đã nâng cấp.',
                'price'            => 160000.00,
                'images'           => [
                    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
                ],
                'account_username' => 'pubg_plat2_user',
                'account_password' => 'Platinum@PUBG2',
                'status'           => 'available',
            ]
        );


        // ==================== SEED GAME CARDS ====================

        // --- Thẻ Garena ---
        $card_ga_100k = GameCard::firstOrCreate(['card_serial' => 'GA123456789'], ['seller_id' => $admin->id, 'title' => 'Thẻ Garena 100.000đ - Nạp ngay không cần chờ', 'description' => 'Thẻ Garena mệnh giá 100k dùng được cho LMHT, VALORANT, Đấu Trường Chân Lý. Giao ngay sau khi thanh toán.', 'price' => 95000.00, 'card_code' => 'GARN-1234-5678-90AB', 'status' => 'available']);
        $card_ga_50k  = GameCard::firstOrCreate(['card_serial' => 'GA987654321'], ['seller_id' => $admin->id, 'title' => 'Thẻ Garena 50.000đ - Tiết kiệm thêm 5%',        'description' => 'Thẻ Garena 50k giá ưu đãi, giao ngay sau khi thanh toán. Dùng nạp RP LMHT hoặc VP Valorant.',              'price' => 47500.00, 'card_code' => 'GARN-9876-5432-1ZYX', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'GA555666777'], ['seller_id' => $admin->id, 'title' => 'Thẻ Garena 200.000đ - Siêu Tiết Kiệm 5%',         'description' => 'Thẻ Garena 200k mua cả lô tiết kiệm 5% so với giá gốc. Dùng nạp cho tất cả game Garena.',                'price' => 190000.00, 'card_code' => 'GARN-5556-6677-7AAA', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'GA111222333'], ['seller_id' => $admin->id, 'title' => 'Thẻ Garena 500.000đ - Nạp Lớn Lợi Lớn',           'description' => 'Thẻ Garena 500k dành cho game thủ nạp nhiều. Tiết kiệm đáng kể so với nạp lẻ. Giao mã ngay lập tức.',   'price' => 470000.00, 'card_code' => 'GARN-1112-2233-3BBB', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'GA010000001'], ['seller_id' => $admin->id, 'title' => 'Thẻ Garena 10.000đ - Nạp Nhỏ Tiện Lợi',           'description' => 'Thẻ Garena mệnh giá 10k phù hợp nạp nhỏ lẻ hoặc thử nghiệm. Giao mã tức thì.',                       'price' => 9500.00,  'card_code' => 'GARN-0100-0000-1KKK', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'GA020000001'], ['seller_id' => $admin->id, 'title' => 'Thẻ Garena 20.000đ - Nạp Nhanh Giá Tốt',           'description' => 'Thẻ Garena 20k tiết kiệm 5% so với giá gốc. Giao ngay, không cần chờ đợi.',                          'price' => 19000.00, 'card_code' => 'GARN-0200-0000-1LLL', 'status' => 'available']);

        // --- Thẻ Mobifone ---
        $card_mobi_200k = GameCard::firstOrCreate(['card_serial' => 'MBL112233445'], ['seller_id' => $admin->id, 'title' => 'Thẻ Mobifone 200.000đ - Nạp Kim Cương Free Fire', 'description' => 'Thẻ Mobifone mệnh giá 200k dùng để nạp Kim Cương Free Fire hoặc các game mobile hỗ trợ nạp thẻ điện thoại.', 'price' => 190000.00, 'card_code' => 'MOBI-2222-3344-5566', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'MBL998877665'], ['seller_id' => $admin->id, 'title' => 'Thẻ Mobifone 100.000đ - Đa Năng Nạp Game',        'description' => 'Thẻ Mobifone 100k dùng nạp game hoặc nạp tiền điện thoại. Tương thích nhiều game mobile phổ biến tại Việt Nam.',          'price' => 95000.00,  'card_code' => 'MOBI-9988-7766-5CCC', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'MBL444555666'], ['seller_id' => $admin->id, 'title' => 'Thẻ Mobifone 500.000đ - Nạp Lớn Giảm Sâu',       'description' => 'Thẻ Mobifone 500k tiết kiệm 5%. Lý tưởng cho việc nạp Kim Cương Free Fire số lượng lớn hoặc nạp cho nhiều game cùng lúc.', 'price' => 475000.00, 'card_code' => 'MOBI-4445-5566-6DDD', 'status' => 'available']);

        // --- Thẻ Viettel ---
        GameCard::firstOrCreate(['card_serial' => 'VTL010000001'], ['seller_id' => $admin->id, 'title' => 'Thẻ Viettel 10.000đ - Nạp Nhỏ Tiện Lợi',    'description' => 'Thẻ Viettel 10k phù hợp nạp nhỏ lẻ hoặc thử nghiệm. Giao mã tức thì.',                                                              'price' => 9500.00,   'card_code' => 'VTTEL-0100-0000-1AAA', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'VTL020000001'], ['seller_id' => $admin->id, 'title' => 'Thẻ Viettel 20.000đ - Nạp Nhanh Giá Tốt',   'description' => 'Thẻ Viettel 20k tiết kiệm 5% so với giá gốc. Giao ngay, không cần chờ đợi.',                                                        'price' => 19000.00,  'card_code' => 'VTTEL-0200-0000-1BBB', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'VTL050000001'], ['seller_id' => $admin->id, 'title' => 'Thẻ Viettel 50.000đ - Tiết Kiệm 5%',        'description' => 'Thẻ Viettel 50k giá ưu đãi, giao ngay sau khi thanh toán. Dùng nạp game mobile hoặc tiền thoại.',                                  'price' => 47500.00,  'card_code' => 'VTTEL-0500-0000-1CCC', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'VTL334455667'], ['seller_id' => $admin->id, 'title' => 'Thẻ Viettel 100.000đ - Phổ Thông Tiện Dụng', 'description' => 'Thẻ Viettel 100k dùng nạp game mobile hoặc nạp tiền thoại. Mạng phủ sóng rộng nhất Việt Nam. Giao mã nhanh.',                      'price' => 95000.00,  'card_code' => 'VTTEL-3344-5566-7EEE', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'VTL778899001'], ['seller_id' => $admin->id, 'title' => 'Thẻ Viettel 200.000đ - Tốt Nhất Thị Trường', 'description' => 'Thẻ Viettel 200k giá tốt, dùng nạp Liên Quân, Free Fire, PUBG Mobile và nhiều game khác. Giao mã tức thì.',                          'price' => 190000.00, 'card_code' => 'VTTEL-7788-9900-1FFF', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'VTL500000001'], ['seller_id' => $admin->id, 'title' => 'Thẻ Viettel 500.000đ - Nạp Lớn Lợi Lớn',   'description' => 'Thẻ Viettel 500k dành cho game thủ nạp nhiều. Tiết kiệm đáng kể so với nạp lẻ. Giao mã ngay lập tức.',                              'price' => 475000.00, 'card_code' => 'VTTEL-5000-0000-1DDD', 'status' => 'available']);

        // --- Thẻ Vietnamobile ---
        GameCard::firstOrCreate(['card_serial' => 'VNM202020202'], ['seller_id' => $admin->id, 'title' => 'Thẻ Vietnamobile 50.000đ - Giá Rẻ Nạp Nhanh',  'description' => 'Thẻ Vietnamobile 50k giá siêu rẻ, phù hợp nạp nhỏ lẻ hoặc dùng nạp game hỗ trợ thẻ điện thoại.',       'price' => 47000.00,  'card_code' => 'VNM-2020-2020-2GGG', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'VNM303030303'], ['seller_id' => $admin->id, 'title' => 'Thẻ Vietnamobile 100.000đ - Thực Dụng',        'description' => 'Thẻ Vietnamobile 100k phù hợp nhiều mục đích nạp game. Giá cạnh tranh nhất thị trường.',                  'price' => 94000.00,  'card_code' => 'VNM-3030-3030-3HHH', 'status' => 'available']);

        // --- Thẻ VinaPhone ---
        GameCard::firstOrCreate(['card_serial' => 'VNP505050505'], ['seller_id' => $admin->id, 'title' => 'Thẻ VinaPhone 100.000đ - Nạp Game Linh Hoạt', 'description' => 'Thẻ VinaPhone 100k tương thích nhiều trò chơi trực tuyến. Đặc biệt phù hợp game VNG như Kiếm Thế, Võ Lâm.', 'price' => 95000.00,  'card_code' => 'VNP-5050-5050-5III', 'status' => 'available']);
        GameCard::firstOrCreate(['card_serial' => 'VNP606060606'], ['seller_id' => $admin->id, 'title' => 'Thẻ VinaPhone 200.000đ - Nạp Game VNG Ưu Đãi', 'description' => 'Thẻ VinaPhone 200k dành riêng cho người hay nạp game VNG. Giao hàng tức thì không cần chờ đợi.',             'price' => 190000.00, 'card_code' => 'VNP-6060-6060-6JJJ', 'status' => 'available']);


        // ==================== SEED GAME GIFTCODES ====================

        // --- Valorant ---
        GameGiftcode::firstOrCreate(['giftcode_string' => 'VALO-CHAMP-2026-ABCD'],   ['seller_id' => $admin->id, 'title' => 'Giftcode VALORANT Champions 2026 - Vũ Khí Giới Hạn',      'description' => 'Code đổi gói vũ khí Champions 2026 độc quyền. Sử dụng tại cửa hàng trong game để đổi.',                              'price' => 250000.00, 'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'VALO-VP2400-ZXCV'],       ['seller_id' => $admin->id, 'title' => 'Giftcode Valorant - 2400 VP Miễn Phí',                    'description' => 'Code tặng 2400 VP dùng mua skin súng hoặc mua Battle Pass trong game. Nhập vào mục Redeem Code.',                   'price' => 320000.00, 'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'VALO-SKIN-FREE-1234'],    ['seller_id' => $admin->id, 'title' => 'Giftcode Valorant - Skin Phantom Đặc Biệt',               'description' => 'Code tặng skin Phantom độc quyền không bán trong cửa hàng. Rất hiếm, giới hạn số lượng.',                           'price' => 180000.00, 'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'VALO-AGENT-UNLOCK-9999'], ['seller_id' => $admin->id, 'title' => 'Giftcode Valorant - Mở Khoá Agent Clove',                 'description' => 'Code mở khoá ngay đặc vụ Clove không cần cày Kingdom Credit. Tiết kiệm rất nhiều thời gian.',                      'price' => 95000.00,  'status' => 'available']);

        // --- LMHT ---
        GameGiftcode::firstOrCreate(['giftcode_string' => 'LMHT-SKIN-FREE-XYZW'],    ['seller_id' => $admin->id, 'title' => 'Giftcode LMHT - Trang Phục Miễn Phí Đặc Biệt',           'description' => 'Code tặng trang phục đặc biệt cho tài khoản LMHT. Nhập vào mục đổi code trong game.',                              'price' => 120000.00, 'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'LMHT-RP10000-MNOP'],      ['seller_id' => $admin->id, 'title' => 'Giftcode LMHT - 10.000 RP Tặng Thêm',                    'description' => 'Code tặng 10.000 RP dùng mua tướng, trang phục hoặc chromas trong LMHT. Nhập tại trang Riot Games.',                'price' => 200000.00, 'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'LMHT-PRESTIGE-ASHE-5678'],['seller_id' => $admin->id, 'title' => 'Giftcode LMHT - Skin Prestige Ashe Giới Hạn',             'description' => 'Code đổi skin Prestige Ashe siêu hiếm không còn bán lại. Nhập trong phần quà tặng của client LMHT.',                'price' => 450000.00, 'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'LMHT-TANGO-CHAMP-2025'],  ['seller_id' => $admin->id, 'title' => 'Giftcode LMHT - Icon + Ward Champ Select 2025',           'description' => 'Code đổi bộ Icon Profile và Ward Skin kỷ niệm Champ Select 2025. Cực hiếm và đẹp.',                                 'price' => 75000.00,  'status' => 'available']);

        // --- Free Fire ---
        GameGiftcode::firstOrCreate(['giftcode_string' => 'FF-DIAMOND-500-QWER'],    ['seller_id' => $admin->id, 'title' => 'Giftcode Free Fire - 500 Kim Cương',                     'description' => 'Code đổi 500 Kim Cương Free Fire, sử dụng tại trang đổi thưởng chính thức của Garena.',                            'price' => 80000.00,  'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'FF-ELITEPASS-S51-ASDF'],  ['seller_id' => $admin->id, 'title' => 'Giftcode Free Fire - Élite Pass Season 51 Full',          'description' => 'Code mở Élite Pass Season 51 đã nâng cấp lên Plus. Nhận ngay toàn bộ phần thưởng cao cấp mùa này.',                'price' => 135000.00, 'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'FF-GUN-M1887-LIMITED'],   ['seller_id' => $admin->id, 'title' => 'Giftcode Free Fire - Skin M1887 Rồng Vàng Giới Hạn',     'description' => 'Code đổi skin M1887 Rồng Vàng cực hiếm chỉ có từ sự kiện đặc biệt. Không bán trong cửa hàng thông thường.',        'price' => 200000.00, 'status' => 'available']);

        // --- Liên Quân ---
        GameGiftcode::firstOrCreate(['giftcode_string' => 'LQ-VOUCHER-100K-HJKL'],   ['seller_id' => $admin->id, 'title' => 'Giftcode Liên Quân - Voucher 100K Nạp Game',              'description' => 'Code voucher trị giá 100.000đ dùng nạp vào tài khoản Liên Quân Mobile. Nhập tại trang nạp thẻ chính thức.',        'price' => 95000.00,  'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'LQ-SKIN-FLORENTINO-VIP'], ['seller_id' => $admin->id, 'title' => 'Giftcode Liên Quân - Skin Florentino Siêu Phẩm',          'description' => 'Code tặng skin Florentino phiên bản đặc biệt từ sự kiện. Cực hiếm, không có trong cửa hàng thường.',               'price' => 280000.00, 'status' => 'available']);

        // --- PUBG Mobile ---
        GameGiftcode::firstOrCreate(['giftcode_string' => 'PUBG-UC-600-BNMQ'],       ['seller_id' => $admin->id, 'title' => 'Giftcode PUBG Mobile - 600 UC',                          'description' => 'Code đổi 600 UC (Unknown Cash) trong PUBG Mobile. Dùng mua outfit, súng skin hoặc tham gia Royale Pass.',          'price' => 150000.00, 'status' => 'available']);
        GameGiftcode::firstOrCreate(['giftcode_string' => 'PUBG-RP-S31-PASS'],       ['seller_id' => $admin->id, 'title' => 'Giftcode PUBG Mobile - Royale Pass Season 31 Elite',     'description' => 'Code kích hoạt Royale Pass Élite Season 31 cùng 25 rank up. Nhận ngay outfit và súng skin exclusive.',              'price' => 320000.00, 'status' => 'available']);


        // ==================== SEED SAMPLE ORDERS ====================

        $order1 = Order::firstOrCreate(
            ['payment_transaction_id' => 'TXN-SEED-20260523-001'],
            ['buyer_id' => $buyer1->id, 'total_amount' => 450000.00, 'payment_method' => 'bank_transfer', 'status' => 'completed']
        );
        OrderItem::firstOrCreate(
            ['order_id' => $order1->id, 'purchasable_id' => $acc_lmht_1->id],
            ['price' => 450000.00, 'purchasable_type' => 'App\\Models\\GameAccount', 'delivered_data' => ['username' => $acc_lmht_1->account_username, 'password' => $acc_lmht_1->account_password, 'note' => 'Giao dịch hoàn thành lúc 2026-05-23 10:30:00']]
        );

        $order2 = Order::firstOrCreate(
            ['payment_transaction_id' => 'TXN-SEED-20260524-002'],
            ['buyer_id' => $buyer2->id, 'total_amount' => 95000.00, 'payment_method' => 'momo', 'status' => 'completed']
        );
        OrderItem::firstOrCreate(
            ['order_id' => $order2->id, 'purchasable_id' => $card_ga_100k->id],
            ['price' => 95000.00, 'purchasable_type' => 'App\\Models\\GameCard', 'delivered_data' => ['serial' => 'GA123456789', 'code' => 'GARN-1234-5678-90AB', 'note' => 'Giao dịch hoàn thành lúc 2026-05-24 14:15:00']]
        );
        $card_ga_100k->update(['status' => 'sold']);

        $order3 = Order::firstOrCreate(
            ['payment_transaction_id' => 'TXN-SEED-20260525-003'],
            ['buyer_id' => $buyer3->id, 'total_amount' => 430000.00, 'payment_method' => 'zalopay', 'status' => 'completed']
        );
        OrderItem::firstOrCreate(
            ['order_id' => $order3->id, 'purchasable_id' => $acc_valo_1->id],
            ['price' => 350000.00, 'purchasable_type' => 'App\\Models\\GameAccount', 'delivered_data' => ['username' => $acc_valo_1->account_username, 'password' => $acc_valo_1->account_password, 'note' => 'Giao dịch hoàn thành lúc 2026-05-25 09:00:00']]
        );

        $order4 = Order::firstOrCreate(
            ['payment_transaction_id' => 'TXN-SEED-20260526-004'],
            ['buyer_id' => $buyer4->id, 'total_amount' => 520000.00, 'payment_method' => 'bank_transfer', 'status' => 'completed']
        );
        OrderItem::firstOrCreate(
            ['order_id' => $order4->id, 'purchasable_id' => $acc_ff_1->id],
            ['price' => 520000.00, 'purchasable_type' => 'App\\Models\\GameAccount', 'delivered_data' => ['username' => $acc_ff_1->account_username, 'password' => $acc_ff_1->account_password, 'note' => 'Giao dịch hoàn thành lúc 2026-05-26 16:45:00']]
        );

        Order::firstOrCreate(['payment_transaction_id' => 'TXN-SEED-20260527-005'], ['buyer_id' => $buyer5->id, 'total_amount' => 237500.00, 'payment_method' => 'momo',    'status' => 'pending']);
        Order::firstOrCreate(['payment_transaction_id' => 'TXN-SEED-20260528-006'], ['buyer_id' => $buyer6->id, 'total_amount' => 99000.00,  'payment_method' => 'zalopay', 'status' => 'pending']);


        // ==================== UPDATE ẢNH QUA DB TRỰC TIẾP ====================
        // (tránh lỗi double-encode của Eloquent array cast)
        $accountImageMap = [
            'LMHT Siêu Phẩm - Full Tướng - 250+ Trang Phục - Rank Kim Cương IV' => [
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_9.jpg',
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lucian_6.jpg',
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_3.jpg',
            ],
            'Acc LMHT Giá Rẻ - Khởi Đầu Hoàn Hảo - Rank Vàng II' => [
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/LeeSin_4.jpg',
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Blitzcrank_29.jpg',
            ],
            'LMHT Thách Đấu Việt Nam - Full Tướng - 500+ Skin - Rank Thách Đấu' => [
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_14.jpg',
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_7.jpg',
            ],
            'LMHT Bạch Kim I - 120 Tướng - 80 Skin Đẹp - Level 100' => [
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yone_1.jpg',
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_37.jpg',
            ],
            'LMHT Tân Binh - 30 Tướng Starter - Rank Sắt III' => [
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg',
                'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ashe_0.jpg',
            ],
            'Valorant VIP - Dao Reaver, Vandal Prime - Rank Bạch Kim II' => [
                'https://media.valorant-api.com/playercards/8bbdc250-4ffc-f6ba-61a0-0d84c4756a4e/wideart.png',
                'https://media.valorant-api.com/playercards/d93ad22d-4db7-b6bc-5e9c-e5959bb9dd76/wideart.png',
            ],
            'Valorant Rank Thần Thoại - Full Agents - Nhiều Dao Độc Lạ' => [
                'https://media.valorant-api.com/playercards/1a127cbf-4131-3581-da59-529b7e0d9495/wideart.png',
                'https://media.valorant-api.com/playercards/b56b2bee-4c04-89ea-370c-37a7dd1c11e4/wideart.png',
            ],
            'Valorant Tân Binh - Full Agent - Rank Đồng II' => [
                'https://media.valorant-api.com/playercards/ab5a453a-f726-4e04-b277-f30d56a8b152/wideart.png',
                'https://media.valorant-api.com/playercards/3432dc3d-47da-4675-67ae-53adb1fdad5e/wideart.png',
            ],
            'Valorant Kim Cương I - Bundle RGX - 15 Agents - Nhiều VP' => [
                'https://media.valorant-api.com/playercards/cada2e3f-4b1d-8279-3e1a-49984a71d4d3/wideart.png',
                'https://media.valorant-api.com/playercards/59861a06-4cb7-24d0-b8f8-c58ad033e5d3/wideart.png',
            ],
            'Nick Free Fire Cực VIP - MP40 Mãng Xà LV7 - AK Rồng Xanh LV6' => [
                '/images/accounts/ff_mp40_cobra.jpg',
                '/images/accounts/ff_heroic.jpg',
            ],
            'Acc Free Fire Tầm Trung - Nhiều Set Đồ Hot Trend - Rank Kim Cương II' => [
                '/images/accounts/ff_hiphop.jpg',
                '/images/accounts/ff_mp40_cobra.jpg',
            ],
            'Free Fire Heroic - Full Pet Max - Lô Súng Nâng Cấp Khủng' => [
                '/images/accounts/ff_heroic.jpg',
                '/images/accounts/ff_hiphop.jpg',
            ],
            'Free Fire Mới - Rank Vàng - Có Gói Élite Pass Season 50' => [
                '/images/accounts/ff_elite_pass.jpg',
                '/images/accounts/ff_hiphop.jpg',
            ],
            'Liên Quân Mobile - 80 Tướng - 50+ Skin - Rank Tinh Anh II' => [
                '/images/accounts/lq_florentino.jpg',
                '/images/accounts/lq_nakroth.jpg',
            ],
            'Liên Quân Mobile - Huyền Thoại III - Full Tướng - Nhiều Skin Limited' => [
                '/images/accounts/lq_nakroth.jpg',
                '/images/accounts/lq_florentino.jpg',
            ],
            'PUBG Mobile - Conqueror - Full Outfit - M416 Glacier LV9' => [
                '/images/accounts/pubg_m416_glacier.jpg',
                '/images/accounts/pubg_conqueror.jpg',
            ],
            'PUBG Mobile - Platinum II - Starter Kit Tốt - Nhiều Crate Outfit' => [
                '/images/accounts/pubg_awm_dragon.jpg',
                '/images/accounts/pubg_m416_glacier.jpg',
            ],
        ];

        foreach ($accountImageMap as $title => $images) {
            DB::table('game_accounts')->where('title', $title)->update(['images' => json_encode($images)]);
        }

        $imageMap = [
            // Garena
            'GA123456789' => ['/images/cards/garena100k.jfif'],
            'GA987654321' => ['/images/cards/The-Garena-50k.webp'],
            'GA555666777' => ['/images/cards/garena200k.png'],
            'GA111222333' => ['/images/cards/The-Garena-500k.webp'],
            'GA010000001' => ['/images/cards/The-Garena-10k.webp'],
            'GA020000001' => ['/images/cards/Garena_20k.png'],
            // Viettel
            'VTL010000001' => ['/images/cards/car-vietell-10k.jfif'],
            'VTL020000001' => ['/images/cards/car-vietell-20k.png'],
            'VTL050000001' => ['/images/cards/car-vietell-50k.webp'],
            'VTL334455667' => ['/images/cards/car-vietell-100k.jfif'],
            'VTL778899001' => ['/images/cards/car-vietell-200k.jfif'],
            'VTL500000001' => ['/images/cards/car-vietell-500k.jfif'],
            // Mobifone
            'MBL112233445' => ['/images/cards/mobifone-200k.svg'],
            'MBL998877665' => ['/images/cards/mobifone-100k.svg'],
            'MBL444555666' => ['/images/cards/mobifone-500k.svg'],
            // Vietnamobile
            'VNM202020202' => ['/images/cards/vietnamobile-50k.svg'],
            'VNM303030303' => ['/images/cards/vietnamobile-100k.svg'],
            // VinaPhone
            'VNP505050505' => ['/images/cards/vinaphone-100k.svg'],
            'VNP606060606' => ['/images/cards/vinaphone-200k.svg'],
        ];

        foreach ($imageMap as $serial => $images) {
            DB::table('game_cards')->where('card_serial', $serial)->update(['images' => json_encode($images)]);
        }

        $giftcodeImageMap = [
            // Valorant
            'VALO-CHAMP-2026-ABCD'   => ['/images/giftcodes/gc_valo_champ.svg'],
            'VALO-VP2400-ZXCV'       => ['/images/giftcodes/gc_valo_vp.svg'],
            'VALO-SKIN-FREE-1234'    => ['/images/giftcodes/gc_valo_phantom.svg'],
            'VALO-AGENT-UNLOCK-9999' => ['/images/giftcodes/gc_valo_clove.svg'],
            // LMHT
            'LMHT-SKIN-FREE-XYZW'    => ['/images/giftcodes/gc_lmht_skin.svg'],
            'LMHT-RP10000-MNOP'      => ['/images/giftcodes/gc_lmht_rp.svg'],
            'LMHT-PRESTIGE-ASHE-5678'=> ['/images/giftcodes/gc_lmht_ashe.svg'],
            'LMHT-TANGO-CHAMP-2025'  => ['/images/giftcodes/gc_lmht_icon.svg'],
            // Free Fire
            'FF-DIAMOND-500-QWER'    => ['/images/giftcodes/gc_ff_diamond.svg'],
            'FF-ELITEPASS-S51-ASDF'  => ['/images/giftcodes/gc_ff_elitepass.svg'],
            'FF-GUN-M1887-LIMITED'   => ['/images/giftcodes/gc_ff_m1887.svg'],
            // Liên Quân
            'LQ-VOUCHER-100K-HJKL'   => ['/images/giftcodes/gc_lq_voucher.svg'],
            'LQ-SKIN-FLORENTINO-VIP' => ['/images/giftcodes/gc_lq_florentino.svg'],
            // PUBG Mobile
            'PUBG-UC-600-BNMQ'       => ['/images/giftcodes/gc_pubg_uc.svg'],
            'PUBG-RP-S31-PASS'       => ['/images/giftcodes/gc_pubg_rp.svg'],
        ];

        foreach ($giftcodeImageMap as $code => $images) {
            DB::table('game_giftcodes')->where('giftcode_string', $code)->update(['images' => json_encode($images)]);
        }


        // ==================== OUTPUT SUMMARY ====================
        $this->command->info('');
        $this->command->info('✅ Database seeded successfully!');
        $this->command->info('');
        $this->command->table(
            ['Account', 'Email', 'Password', 'Role'],
            [
                ['Admin',        'admin@gameacc.vn',      'admin123',    'admin'],
                ['Người Mua 1',  'buyer@gameacc.vn',      'buyer123',    'buyer'],
                ['Nguyễn Văn A', 'nguyenvana@gmail.com',  'password123', 'buyer'],
                ['Trần Thị B',   'tranthib@gmail.com',    'password123', 'buyer'],
                ['Lê Văn C',     'levanc@gmail.com',      'password123', 'buyer'],
                ['Phạm Thị D',   'phamthid@gmail.com',    'password123', 'buyer'],
                ['Hoàng Văn E',  'hoangvane@gmail.com',   'password123', 'buyer'],
            ]
        );
        $this->command->info('');
        $this->command->info('Tổng dữ liệu đã seed:');
        $this->command->info('  - Users:         ' . User::count() . ' người dùng');
        $this->command->info('  - GameAccounts:  ' . GameAccount::count() . ' tài khoản game');
        $this->command->info('  - GameCards:     ' . GameCard::count() . ' thẻ cào');
        $this->command->info('  - GameGiftcodes: ' . GameGiftcode::count() . ' giftcode');
        $this->command->info('  - Orders:        ' . Order::count() . ' đơn hàng');
    }
}
