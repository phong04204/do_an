"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Gamepad2, BarChart3,
  Sun, Moon, ChevronDown, Plus, Trash2, Edit3,
  Check, X, ShoppingBag,
  Calendar, UserCheck, UserX,
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency } from "@/lib/utils";
import apiClient from "@/lib/api-client";

// ==========================================
// 1. BACKEND-READY INTERFACES (DATABASES SCHEMAS)
// ==========================================
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "seller" | "buyer";
  status: "active" | "banned";
  created_at: string;
}

export interface AdminGameAccount {
  id: number;
  seller_id: number;
  seller_name: string;
  title: string;
  description: string;
  price: number;
  images: string[]; // Lưu trữ mảng danh sách link ảnh
  account_username: string;
  account_password: string;
  status: "available" | "sold" | "hidden";
  created_at: string;
}

export interface AdminGameCard {
  id: number;
  seller_id: number;
  seller_name: string;
  title: string;
  description: string;
  price: number;
  card_serial: string;
  card_code: string;
  status: "available" | "sold" | "hidden";
  created_at: string;
}

export interface AdminGameGiftcode {
  id: number;
  seller_id: number;
  seller_name: string;
  title: string;
  description: string;
  price: number;
  giftcode_string: string;
  status: "available" | "sold" | "hidden";
  created_at: string;
}

export interface AdminOrderItem {
  id: number;
  order_id: number;
  price: number;
  purchasable_type: "App\\Models\\GameAccount" | "App\\Models\\GameCard" | "App\\Models\\GameGiftcode";
  purchasable_id: number;
  purchasable_title: string;
  delivered_data: any; // JSON chứa chuỗi bảo mật
}

export interface AdminOrder {
  id: number;
  buyer_id: number;
  buyer_name: string;
  total_amount: number;
  payment_method: string;
  payment_transaction_id: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
  items: AdminOrderItem[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user: loggedInUser, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!loggedInUser) {
      router.push("/login");
    } else if (loggedInUser.role !== "admin" && loggedInUser.role !== "seller") {
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
  }, [mounted, loggedInUser, router]);

  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "products" | "orders">("dashboard");
  const [productSubTab, setProductSubTab] = useState<"accounts" | "cards" | "giftcodes">("accounts");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // States for CRUD
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [accounts, setAccounts] = useState<AdminGameAccount[]>([]);
  const [cards, setCards] = useState<AdminGameCard[]>([]);
  const [giftcodes, setGiftcodes] = useState<AdminGameGiftcode[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [stats, setStats] = useState({ users: 0, accounts: 0, cards: 0, giftcodes: 0, orders: 0, revenue: 0, pending_orders: 0 });

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ==========================================
  // FETCH DATA FROM API
  // ==========================================
  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      const [statsRes, usersRes, accountsRes, cardsRes, giftcodesRes, ordersRes] = await Promise.all([
        apiClient.get("/admin/stats"),
        apiClient.get("/admin/users"),
        apiClient.get("/admin/game-accounts"),
        apiClient.get("/admin/game-cards"),
        apiClient.get("/admin/game-giftcodes"),
        apiClient.get("/admin/orders"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAccounts(accountsRes.data.map((a: any) => ({ ...a, price: Number(a.price) })));
      setCards(cardsRes.data.map((c: any) => ({ ...c, price: Number(c.price) })));
      setGiftcodes(giftcodesRes.data.map((g: any) => ({ ...g, price: Number(g.price) })));
      setOrders(ordersRes.data.map((o: any) => ({
        ...o,
        total_amount: Number(o.total_amount),
        items: (o.items ?? []).map((i: any) => ({ ...i, price: Number(i.price) })),
      })));
    } catch (err) {
      showToast("Không thể tải dữ liệu từ server!", "error");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) fetchAdminData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized]);

  // ==========================================
  // 3. CRUD CONTROLLERS (BACKEND-READY STRUCTURE)
  // ==========================================

  // User CRUD states (SQL-Synced: No phone, No balance)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState<Omit<AdminUser, "id" | "created_at">>({
    name: "", email: "", role: "buyer", status: "active"
  });

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: "", email: "", role: "buyer", status: "active" });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setUserForm({
      name: user.name, email: user.email,
      role: user.role, status: user.status
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const { data } = await apiClient.put(`/admin/users/${editingUser.id}`, userForm);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? data : u));
        showToast(`Đã cập nhật thành viên ${userForm.name} thành công!`, "success");
      } else {
        showToast("Thêm người dùng mới chưa được hỗ trợ qua API!", "error");
        return;
      }
      setUserModalOpen(false);
    } catch (err) {
      showToast("Không thể lưu thông tin người dùng!", "error");
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" không?`)) {
      try {
        await apiClient.delete(`/admin/users/${id}`);
        setUsers(prev => prev.filter(u => u.id !== id));
        showToast(`Đã xóa thành viên "${name}"!`, "info");
      } catch (err) {
        showToast("Lỗi khi xóa thành viên!", "error");
      }
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    const nextStatus = user.status === "active" ? "banned" : "active";
    try {
      const { data } = await apiClient.put(`/admin/users/${user.id}`, { status: nextStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? data : u));
      showToast(`Đã ${nextStatus === "banned" ? "khóa" : "kích hoạt"} tài khoản ${user.name}!`, "info");
    } catch (err) {
      showToast("Không thể thay đổi trạng thái người dùng!", "error");
    }
  };

  // Account CRUD states (SQL-Synced: images array, login credentials, available/sold/hidden status)
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminGameAccount | null>(null);
  const [accountForm, setAccountForm] = useState<Omit<AdminGameAccount, "id" | "created_at" | "seller_id" | "seller_name">>({
    title: "", price: 0, status: "available", description: "", account_username: "", account_password: "", images: []
  });
  const [imageUrlInput, setImageUrlInput] = useState("");

  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountForm({
      title: "", price: 0, status: "available", description: "", account_username: "", account_password: "", images: []
    });
    setImageUrlInput("");
    setAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc: AdminGameAccount) => {
    setEditingAccount(acc);
    setAccountForm({
      title: acc.title,
      price: Number(acc.price) || 0,
      status: acc.status,
      description: acc.description ?? "",
      account_username: acc.account_username ?? "",
      account_password: acc.account_password ?? "",
      images: acc.images ?? []
    });
    setImageUrlInput("");
    setAccountModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pendingImages = imageUrlInput ? imageUrlInput.split(",").map(url => url.trim()).filter(Boolean) : [];
      const payload = { ...accountForm, images: [...accountForm.images, ...pendingImages] };

      if (editingAccount) {
        const { data } = await apiClient.put(`/admin/game-accounts/${editingAccount.id}`, payload);
        setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...data, price: Number(data.price), seller_name: editingAccount.seller_name } : a));
        showToast("Cập nhật tài khoản game thành công!", "success");
      } else {
        const { data } = await apiClient.post("/admin/game-accounts", { ...payload, seller_id: loggedInUser?.id });
        setAccounts(prev => [{ ...data, price: Number(data.price) }, ...prev]);
        showToast("Đã đăng bán tài khoản mới thành công!", "success");
      }
      setAccountModalOpen(false);
    } catch (err) {
      showToast("Lỗi khi lưu tài khoản game!", "error");
    }
  };

  const handleDeleteAccount = async (id: number, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tin đăng "${title}" không?`)) {
      try {
        await apiClient.delete(`/admin/game-accounts/${id}`);
        setAccounts(prev => prev.filter(a => a.id !== id));
        showToast("Đã xóa tin đăng tài khoản game!", "info");
      } catch (err) {
        showToast("Lỗi khi xóa tin đăng!", "error");
      }
    }
  };

  // Card CRUD states (SQL-Synced: serial, code)
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<AdminGameCard | null>(null);
  const [cardForm, setCardForm] = useState<Omit<AdminGameCard, "id" | "created_at" | "seller_id" | "seller_name">>({
    title: "", price: 0, status: "available", description: "", card_serial: "", card_code: ""
  });

  const handleOpenAddCard = () => {
    setEditingCard(null);
    setCardForm({ title: "", price: 0, status: "available", description: "", card_serial: "", card_code: "" });
    setCardModalOpen(true);
  };

  const handleOpenEditCard = (card: AdminGameCard) => {
    setEditingCard(card);
    setCardForm({
      title: card.title, price: card.price, status: card.status,
      description: card.description, card_serial: card.card_serial, card_code: card.card_code
    });
    setCardModalOpen(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCard) {
        const { data } = await apiClient.put(`/admin/game-cards/${editingCard.id}`, cardForm);
        setCards(prev => prev.map(c => c.id === editingCard.id ? { ...c, ...data, price: Number(data.price), seller_name: editingCard.seller_name } : c));
        showToast("Cập nhật thẻ game thành công!", "success");
      } else {
        const { data } = await apiClient.post("/admin/game-cards", { ...cardForm, seller_id: loggedInUser?.id });
        setCards(prev => [{ ...data, price: Number(data.price) }, ...prev]);
        showToast("Đăng bán thẻ game mới thành công!", "success");
      }
      setCardModalOpen(false);
    } catch (err) {
      showToast("Lỗi khi lưu thẻ game!", "error");
    }
  };

  const handleDeleteCard = async (id: number, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tin bán thẻ "${title}" không?`)) {
      try {
        await apiClient.delete(`/admin/game-cards/${id}`);
        setCards(prev => prev.filter(c => c.id !== id));
        showToast("Đã xóa tin đăng thẻ game!", "info");
      } catch (err) {
        showToast("Lỗi khi xóa thẻ game!", "error");
      }
    }
  };

  // Giftcode CRUD states (SQL-Synced: giftcode_string)
  const [giftcodeModalOpen, setGiftcodeModalOpen] = useState(false);
  const [editingGiftcode, setEditingGiftcode] = useState<AdminGameGiftcode | null>(null);
  const [giftcodeForm, setGiftcodeForm] = useState<Omit<AdminGameGiftcode, "id" | "created_at" | "seller_id" | "seller_name">>({
    title: "", price: 0, status: "available", description: "", giftcode_string: ""
  });

  const handleOpenAddGiftcode = () => {
    setEditingGiftcode(null);
    setGiftcodeForm({ title: "", price: 0, status: "available", description: "", giftcode_string: "" });
    setGiftcodeModalOpen(true);
  };

  const handleOpenEditGiftcode = (gc: AdminGameGiftcode) => {
    setEditingGiftcode(gc);
    setGiftcodeForm({
      title: gc.title, price: gc.price, status: gc.status,
      description: gc.description, giftcode_string: gc.giftcode_string
    });
    setGiftcodeModalOpen(true);
  };

  const handleSaveGiftcode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGiftcode) {
        const { data } = await apiClient.put(`/admin/game-giftcodes/${editingGiftcode.id}`, giftcodeForm);
        setGiftcodes(prev => prev.map(g => g.id === editingGiftcode.id ? { ...g, ...data, price: Number(data.price), seller_name: editingGiftcode.seller_name } : g));
        showToast("Cập nhật giftcode thành công!", "success");
      } else {
        const { data } = await apiClient.post("/admin/game-giftcodes", { ...giftcodeForm, seller_id: loggedInUser?.id });
        setGiftcodes(prev => [{ ...data, price: Number(data.price) }, ...prev]);
        showToast("Đăng bán giftcode mới thành công!", "success");
      }
      setGiftcodeModalOpen(false);
    } catch (err) {
      showToast("Lỗi khi lưu giftcode!", "error");
    }
  };

  const handleDeleteGiftcode = async (id: number, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tin bán giftcode "${title}" không?`)) {
      try {
        await apiClient.delete(`/admin/game-giftcodes/${id}`);
        setGiftcodes(prev => prev.filter(g => g.id !== id));
        showToast("Đã xóa tin đăng giftcode!", "info");
      } catch (err) {
        showToast("Lỗi khi xóa giftcode!", "error");
      }
    }
  };

  // Order Detail modal & status handlers
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const handleViewOrderDetail = (order: AdminOrder) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: number, nextStatus: "pending" | "completed" | "failed") => {
    try {
      await apiClient.put(`/admin/orders/${orderId}`, { status: nextStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
      }
      const label = nextStatus === "completed" ? "Thành công" : nextStatus === "failed" ? "Thất bại" : "Chờ xử lý";
      showToast(`Đã cập nhật đơn hàng #${orderId} thành "${label}"!`, "success");
    } catch (err) {
      showToast("Lỗi khi cập nhật trạng thái đơn hàng!", "error");
    }
  };

  // ==========================================
  // 4. SEARCH & FILTER STATE
  // ==========================================
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // Accounts
  const [accountSearch, setAccountSearch] = useState("");
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>("all");

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(accountSearch.toLowerCase()) ||
                          a.id.toString().includes(accountSearch) ||
                          a.seller_name.toLowerCase().includes(accountSearch.toLowerCase());
      const matchStatus = accountStatusFilter === "all" || a.status === accountStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [accounts, accountSearch, accountStatusFilter]);

  // Cards
  const [cardSearch, setCardSearch] = useState("");
  const [cardStatusFilter, setCardStatusFilter] = useState<string>("all");

  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(cardSearch.toLowerCase()) ||
                          c.id.toString().includes(cardSearch) ||
                          c.card_serial.toLowerCase().includes(cardSearch.toLowerCase());
      const matchStatus = cardStatusFilter === "all" || c.status === cardStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [cards, cardSearch, cardStatusFilter]);

  // Giftcodes
  const [giftcodeSearch, setGiftcodeSearch] = useState("");
  const [giftcodeStatusFilter, setGiftcodeStatusFilter] = useState<string>("all");

  const filteredGiftcodes = useMemo(() => {
    return giftcodes.filter(g => {
      const matchSearch = g.title.toLowerCase().includes(giftcodeSearch.toLowerCase()) ||
                          g.id.toString().includes(giftcodeSearch) ||
                          g.giftcode_string.toLowerCase().includes(giftcodeSearch.toLowerCase());
      const matchStatus = giftcodeStatusFilter === "all" || g.status === giftcodeStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [giftcodes, giftcodeSearch, giftcodeStatusFilter]);

  // Orders
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.id.toString().includes(orderSearch) ||
                          o.buyer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          (o.payment_transaction_id && o.payment_transaction_id.toLowerCase().includes(orderSearch.toLowerCase()));
      const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const [recentProductTab, setRecentProductTab] = useState<"accounts" | "cards" | "giftcodes">("accounts");

  // Calculate dynamic statistics
  const statsMonthlyEarnings = useMemo(() => {
    return orders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.total_amount, 0);
  }, [orders]);

  const statsAverageDailySales = useMemo(() => {
    return Math.round(statsMonthlyEarnings / 30);
  }, [statsMonthlyEarnings]);

  const statsOrdersThisMonthCount = useMemo(() => {
    return orders.length;
  }, [orders]);

  const statsAvailableAccountsCount = useMemo(() => {
    return accounts.filter(a => a.status === "available").length;
  }, [accounts]);

  const statsAvailableCardsCount = useMemo(() => {
    return cards.filter(c => c.status === "available").length;
  }, [cards]);

  const statsProductTypeEarnings = useMemo(() => {
    return statsMonthlyEarnings;
  }, [statsMonthlyEarnings]);

  const statsAccountEarnings = useMemo(() => {
    return orders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.items
        .filter(item => item.purchasable_type === "App\\Models\\GameAccount")
        .reduce((s, item) => s + item.price, 0), 0);
  }, [orders]);

  const statsCardEarnings = useMemo(() => {
    return orders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.items
        .filter(item => item.purchasable_type === "App\\Models\\GameCard")
        .reduce((s, item) => s + item.price, 0), 0);
  }, [orders]);

  const statsGiftcodeEarnings = useMemo(() => {
    return orders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.items
        .filter(item => item.purchasable_type === "App\\Models\\GameGiftcode")
        .reduce((s, item) => s + item.price, 0), 0);
  }, [orders]);

  const statsSoldAccountsCount = useMemo(() => accounts.filter(a => a.status === "sold").length, [accounts]);
  const statsTotalAccounts = useMemo(() => accounts.length, [accounts]);
  const statsAccountSoldPercentage = useMemo(() => {
    if (statsTotalAccounts === 0) return 0;
    return Math.round((statsSoldAccountsCount / statsTotalAccounts) * 100);
  }, [statsSoldAccountsCount, statsTotalAccounts]);

  const statsSoldCardsCount = useMemo(() => cards.filter(c => c.status === "sold").length, [cards]);
  const statsTotalCards = useMemo(() => cards.length, [cards]);
  const statsCardSoldPercentage = useMemo(() => {
    if (statsTotalCards === 0) return 0;
    return Math.round((statsSoldCardsCount / statsTotalCards) * 100);
  }, [statsSoldCardsCount, statsTotalCards]);

  return (
    <>
      {!isAuthorized ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0b0e14",
          color: "#fff",
          fontFamily: "sans-serif"
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(124, 58, 237, 0.2)",
              borderTopColor: "#7C3AED",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <span style={{ fontSize: "0.9rem", color: "#9ca3af", fontWeight: 500 }}>Đang xác thực quyền truy cập...</span>
          </div>
        </div>
      ) : (
        <div className="dash" data-theme={theme} style={{ position: "relative" }}>
          {/* Data loading overlay */}
          {dataLoading && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 999,
              background: "rgba(15,17,23,0.7)", backdropFilter: "blur(4px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem",
            }}>
              <div style={{
                width: "44px", height: "44px",
                border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: "0.9rem", color: "#9ca3af", fontWeight: 500 }}>Đang tải dữ liệu từ server...</span>
            </div>
          )}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .dash { display: flex; height: 100vh; min-height: 640px; background: #0f1117; color: #e2e8f0; border-radius: 12px; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; }
        .sidebar { width: 204px; flex-shrink: 0; background: #13151c; padding: 16px 0; display: flex; flex-direction: column; border-right: 0.5px solid rgba(255,255,255,0.07); }
        .sidebar-logo { display: flex; align-items: center; gap: 8px; padding: 4px 16px 20px; font-weight: 500; font-size: 15px; color: #e2e8f0; }
        .logo-icon { width: 28px; height: 28px; background: #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .nav-section { font-size: 10px; color: #4a5568; text-transform: uppercase; letter-spacing: 0.08em; padding: 0 16px 6px; margin-top: 8px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; font-size: 13px; color: #718096; cursor: pointer; transition: all 0.15s; border-left: 2px solid transparent; width: 100%; border-radius: 0; background: transparent; text-align: left; border: none; }
        .nav-item:hover { color: #e2e8f0; background: rgba(255,255,255,0.04); }
        .nav-item.active { color: #fff; background: rgba(99,102,241,0.15); border-left-color: #6366f1; }
        .nav-item i { font-size: 16px; }
        .nav-arr { margin-left: auto; font-size: 12px; }
        .main { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; background: #0f1117; }
        .topbar-row { display: flex; align-items: center; gap: 10px; }
        .page-title { font-size: 18px; font-weight: 500; color: #e2e8f0; }
        .page-sub { font-size: 12px; color: #4a5568; margin-top: 2px; }
        .search-box { background: #1a1d27; border: 0.5px solid rgba(255,255,255,0.08); border-radius: 8px; display: flex; align-items: center; gap: 6px; padding: 7px 12px; font-size: 13px; color: #4a5568; }
        .icon-btn { width: 34px; height: 34px; border-radius: 8px; background: #1a1d27; border: 0.5px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: #718096; cursor: pointer; font-size: 16px; transition: all 0.15s; }
        .icon-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.04); }
        .avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #7C3AED, #06B6D4); border: none; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; box-shadow: 0 4px 14px rgba(124,58,237,0.35); transition: all 0.2s; flex-shrink: 0; }
        .avatar:hover { transform: scale(1.07); box-shadow: 0 6px 18px rgba(6,182,212,0.45); }
        .avatar-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #1a1d27; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.45); min-width: 200px; padding: 6px; z-index: 999; }
        .avatar-name { padding: 8px 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.07); margin-bottom: 4px; }
        .avatar-menu-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 12px; font-size: 13px; color: #cbd5e0; background: none; border: none; border-radius: 8px; cursor: pointer; text-align: left; text-decoration: none; transition: background 0.15s; }
        .avatar-menu-item:hover { background: rgba(255,255,255,0.06); }
        .avatar-menu-item.danger { color: #f87171; }
        .avatar-menu-item.danger:hover { background: rgba(248,113,113,0.1); }
        .row { display: flex; gap: 14px; flex-wrap: wrap; }
        .card { background: #1a1d27; border: 0.5px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; }
        .stat-card { flex: 1; min-width: 280px; }
        .stat-label { font-size: 11px; color: #4a5568; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .stat-val { font-size: 24px; font-weight: 500; color: #e2e8f0; letter-spacing: -0.5px; }
        .curr { font-size: 16px; color: #718096; vertical-align: top; margin-top: 4px; display: inline-block; }
        .badge-up { background: rgba(16,185,129,0.15); color: #34d399; font-size: 11px; padding: 2px 7px; border-radius: 20px; margin-left: 8px; font-weight: 500; display: inline-flex; align-items: center; }
        .badge-dn { background: rgba(239,68,68,0.15); color: #f87171; font-size: 11px; padding: 2px 7px; border-radius: 20px; margin-left: 8px; font-weight: 500; display: inline-flex; align-items: center; }
        .badge-warn { background: rgba(245,158,11,0.15); color: #fbbf24; font-size: 11px; padding: 2px 7px; border-radius: 20px; margin-left: 8px; font-weight: 500; display: inline-flex; align-items: center; }
        .donut-wrap { display: flex; align-items: center; gap: 16px; margin-top: 12px; }
        .legend-item { font-size: 12px; color: #718096; display: flex; align-items: center; gap: 6px; margin-bottom: 6px; width: 100%; }
        .leg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .leg-val { color: #e2e8f0; font-weight: 500; margin-left: auto; padding-left: 12px; }
        .bar-wrap { margin-top: 10px; display: flex; align-items: flex-end; gap: 5px; height: 55px; }
        .bar { flex: 1; background: #6366f1; border-radius: 3px 3px 0 0; opacity: 0.55; transition: opacity 0.15s; cursor: pointer; }
        .bar:hover, .bar.active { opacity: 1; background: #818cf8; }
        .prog-bg { height: 6px; background: rgba(255,255,255,0.07); border-radius: 3px; margin-top: 10px; overflow: hidden; }
        .prog-fill { height: 100%; border-radius: 3px; }
        .prog-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 12px; color: #4a5568; }
        .card-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
        .card-title { font-size: 13px; font-weight: 500; color: #e2e8f0; }
        .card-sub { font-size: 11px; color: #4a5568; }
        .more-btn { color: #4a5568; font-size: 18px; cursor: pointer; }
        .tabs { display: flex; gap: 4px; margin-bottom: 14px; flex-wrap: wrap; }
        .tab { display: flex; flex-direction: row; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 11px; color: #4a5568; cursor: pointer; border: 0.5px solid transparent; transition: all 0.15s; background: transparent; }
        .tab.active { background: rgba(99,102,241,0.12); color: #818cf8; border-color: rgba(99,102,241,0.25); }
        .tbl { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .tbl th { font-size: 11px; color: #4a5568; text-align: left; padding: 0 8px 8px; font-weight: 400; }
        .tbl td { font-size: 12px; padding: 8px; border-top: 0.5px solid rgba(255,255,255,0.05); vertical-align: middle; color: #718096; }
        .prod-img { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .prod-name { font-size: 12px; font-weight: 500; color: #e2e8f0; }
        .prod-sku { font-size: 10px; color: #4a5568; }
        .status-pill { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 500; text-transform: uppercase; }
        .s-avail { background: rgba(16,185,129,0.15); color: #34d399; }
        .s-sold { background: rgba(99,102,241,0.15); color: #818cf8; }
        .s-pend { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .search-input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          font-size: 13px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          outline: none;
          color: #fff;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-input::placeholder {
          color: #5d687a;
        }
        .search-input:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .search-input:focus {
          background: #13151c;
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.15);
        }
        .filter-select {
          width: 100%;
          padding: 10px 36px 10px 14px;
          font-size: 13px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          outline: none;
          color: #fff;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b9ab5' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 14px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .filter-select:hover {
          background-color: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .filter-select:focus {
          background-color: #13151c;
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.15);
        }
        /* ===== DARK THEME: MANAGEMENT TABS ===== */
        .lt-hdr { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px; }
        .lt-h1 { font-size:20px;font-weight:700;color:#e2e8f0; }
        .lt-sub { font-size:12px;color:#718096;margin-top:3px; }
        .lt-hdr-btns { display:flex;align-items:center;gap:10px; }
        .lt-btn-dl { display:inline-flex;align-items:center;gap:6px;padding:7px 15px;border:0.5px solid rgba(255,255,255,0.12);border-radius:8px;background:#1e2130;color:#cbd5e0;font-size:13px;font-weight:600;cursor:pointer; }
        .lt-btn-dl:hover { background:#252840;border-color:rgba(255,255,255,0.2); }
        .lt-btn-add { display:inline-flex;align-items:center;gap:6px;padding:7px 15px;border:none;border-radius:8px;background:#6366f1;color:white;font-size:13px;font-weight:600;cursor:pointer; }
        .lt-btn-add:hover { background:#5254cc; }
        .cbar { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
        .cc { display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border:0.5px solid rgba(255,255,255,0.1);border-radius:7px;background:#1e2130;font-size:12px;cursor:pointer;white-space:nowrap;color:#a0aec0;position:relative; }
        .cc:hover { border-color:rgba(255,255,255,0.2);background:#252840; }
        .cc b { font-weight:600;color:#e2e8f0; }
        .cc em { font-style:normal;color:#718096; }
        .cc-sel { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;font-size:1px;border:none;appearance:none; }
        .cbar-right { margin-left:auto;font-size:12px;color:#718096; }
        .cbar-right b { color:#e2e8f0;font-weight:600; }
        .lt-box { background:#1a1d27;border:0.5px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;overflow-x:auto; }
        .lt-ta { width:100%;border-collapse:collapse; }
        .lt-ta th { font-size:11.5px;color:#4a5568;font-weight:600;padding:11px 14px;background:#1a1d27;border-bottom:0.5px solid rgba(255,255,255,0.05);text-align:left;white-space:nowrap; }
        .lt-ta td { font-size:13px;color:#cbd5e0;padding:12px 14px;border-bottom:0.5px solid rgba(255,255,255,0.04);vertical-align:middle; }
        .lt-ta tbody tr:last-child td { border-bottom:none; }
        .lt-ta tbody tr:hover td { background:rgba(255,255,255,0.025); }
        .lt-av { width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0; }
        .ltbs { display:inline-flex;align-items:center;gap:5px;border-radius:20px;padding:4px 11px;font-size:12px;font-weight:500;white-space:nowrap; }
        .ltbs-avail { background:rgba(16,185,129,0.15);color:#34d399; }
        .ltbs-sold { background:rgba(99,102,241,0.15);color:#818cf8; }
        .ltbs-hidden { background:rgba(255,255,255,0.06);color:#718096;border:0.5px solid rgba(255,255,255,0.1); }
        .ltbs-active { background:rgba(16,185,129,0.15);color:#34d399; }
        .ltbs-banned { background:rgba(239,68,68,0.15);color:#f87171; }
        .ltbs-pending { background:rgba(245,158,11,0.15);color:#fbbf24; }
        .ltbs-done { background:rgba(16,185,129,0.15);color:#34d399; }
        .ltbs-fail { background:rgba(239,68,68,0.15);color:#f87171; }
        .ltrb { display:inline-flex;align-items:center;gap:4px;border-radius:5px;padding:3px 8px;font-size:11px;font-weight:700;text-transform:uppercase; }
        .ltrb-admin { background:rgba(239,68,68,0.15);color:#f87171; }
        .ltrb-seller { background:rgba(59,130,246,0.15);color:#60a5fa; }
        .ltrb-buyer { background:rgba(16,185,129,0.15);color:#34d399; }
        .lt-ab { width:30px;height:30px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:#718096;transition:all 0.12s; }
        .lt-ab:hover { background:rgba(255,255,255,0.09);color:#e2e8f0;border-color:rgba(255,255,255,0.18); }
        .lt-ab-r { background:rgba(239,68,68,0.12) !important;border-color:rgba(239,68,68,0.3) !important;color:#f87171 !important; }
        .lt-ab-r:hover { background:rgba(239,68,68,0.22) !important; }
        .lt-ab-g { background:rgba(16,185,129,0.12) !important;border-color:rgba(16,185,129,0.3) !important;color:#34d399 !important; }
        .lt-ab-g:hover { background:rgba(16,185,129,0.22) !important; }
        .lt-stat-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px; }
        .lt-stat-card { background:#1a1d27;border:0.5px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 20px; }
        .lt-stat-lbl { font-size:11px;color:#4a5568;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px; }
        .lt-stat-val { font-size:22px;font-weight:700;color:#e2e8f0;letter-spacing:-0.5px; }
        .lt-stat-up { display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;padding:2px 7px;border-radius:20px;background:rgba(16,185,129,0.15);color:#34d399;margin-left:8px; }
        .lt-stat-dn { display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;padding:2px 7px;border-radius:20px;background:rgba(239,68,68,0.15);color:#f87171;margin-left:8px; }
        .lt-chart-box { background:#1a1d27;border:0.5px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px; }
        .lt-chart-title { font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:16px; }
        /* ===== LIGHT THEME OVERRIDES ===== */
        [data-theme="light"] .page-title { color:#111827; }
        [data-theme="light"] .page-sub { color:#6b7280; }
        [data-theme="light"] .search-box { background:white;border:1px solid #e5e7eb;color:#374151; }
        [data-theme="light"] .icon-btn { background:white;border:1px solid #e5e7eb;color:#374151; }
        [data-theme="light"] .icon-btn:hover { background:#f9fafb;color:#111827; }
        [data-theme="light"] .card { background:white;border:1px solid #e5e7eb; }
        [data-theme="light"] .stat-label { color:#6b7280; }
        [data-theme="light"] .stat-val { color:#111827; }
        [data-theme="light"] .curr { color:#9ca3af; }
        [data-theme="light"] .legend-item { color:#6b7280; }
        [data-theme="light"] .leg-val { color:#111827; }
        [data-theme="light"] .prog-bg { background:#f3f4f6; }
        [data-theme="light"] .prog-meta { color:#6b7280; }
        [data-theme="light"] .card-title { color:#111827; }
        [data-theme="light"] .card-sub { color:#9ca3af; }
        [data-theme="light"] .more-btn { color:#9ca3af; }
        [data-theme="light"] .tab { color:#6b7280; }
        [data-theme="light"] .tbl th { color:#9ca3af; }
        [data-theme="light"] .tbl td { color:#374151;border-top:1px solid #f3f4f6; }
        [data-theme="light"] .prod-name { color:#111827; }
        [data-theme="light"] .prod-sku { color:#9ca3af; }
        [data-theme="light"] .lt-h1 { color:#111827; }
        [data-theme="light"] .lt-sub { color:#6b7280; }
        [data-theme="light"] .lt-btn-dl { background:white;border:1px solid #d1d5db;color:#374151; }
        [data-theme="light"] .lt-btn-dl:hover { background:#f9fafb;border-color:#d1d5db; }
        [data-theme="light"] .lt-btn-add { background:#111827; }
        [data-theme="light"] .lt-btn-add:hover { background:#1f2937; }
        [data-theme="light"] .cc { background:white;border:1px solid #d1d5db;color:#374151; }
        [data-theme="light"] .cc:hover { background:#f9fafb;border-color:#9ca3af; }
        [data-theme="light"] .cc b { color:#111827; }
        [data-theme="light"] .cc em { color:#6b7280; }
        [data-theme="light"] .cbar-right { color:#6b7280; }
        [data-theme="light"] .cbar-right b { color:#111827; }
        [data-theme="light"] .lt-box { background:white;border:1px solid #e5e7eb; }
        [data-theme="light"] .lt-ta th { background:white;color:#9ca3af;border-bottom:1px solid #f3f4f6; }
        [data-theme="light"] .lt-ta td { color:#374151;border-bottom:1px solid #f8fafc; }
        [data-theme="light"] .lt-ta tbody tr:hover td { background:#fafafa; }
        [data-theme="light"] .ltbs-avail { background:#dcfce7;color:#15803d; }
        [data-theme="light"] .ltbs-sold { background:#dbeafe;color:#1d4ed8; }
        [data-theme="light"] .ltbs-hidden { background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb; }
        [data-theme="light"] .ltbs-active { background:#dcfce7;color:#15803d; }
        [data-theme="light"] .ltbs-banned { background:#fee2e2;color:#dc2626; }
        [data-theme="light"] .ltbs-pending { background:#fef3c7;color:#92400e; }
        [data-theme="light"] .ltbs-done { background:#dcfce7;color:#15803d; }
        [data-theme="light"] .ltbs-fail { background:#fee2e2;color:#dc2626; }
        [data-theme="light"] .ltrb-admin { background:#fee2e2;color:#dc2626; }
        [data-theme="light"] .ltrb-seller { background:#dbeafe;color:#2563eb; }
        [data-theme="light"] .ltrb-buyer { background:#dcfce7;color:#16a34a; }
        [data-theme="light"] .lt-ab { background:#f9fafb;border:1px solid #e5e7eb;color:#6b7280; }
        [data-theme="light"] .lt-ab:hover { background:#f3f4f6;color:#111827;border-color:#d1d5db; }
        [data-theme="light"] .lt-ab-r { background:#fef2f2 !important;border-color:#fecaca !important;color:#dc2626 !important; }
        [data-theme="light"] .lt-ab-r:hover { background:#fee2e2 !important; }
        [data-theme="light"] .lt-ab-g { background:#f0fdf4 !important;border-color:#bbf7d0 !important;color:#16a34a !important; }
        [data-theme="light"] .lt-ab-g:hover { background:#dcfce7 !important; }
        [data-theme="light"] .lt-stat-card { background:white;border:1px solid #e5e7eb; }
        [data-theme="light"] .lt-stat-lbl { color:#6b7280; }
        [data-theme="light"] .lt-stat-val { color:#111827; }
        [data-theme="light"] .lt-stat-up { background:#dcfce7;color:#15803d; }
        [data-theme="light"] .lt-stat-dn { background:#fee2e2;color:#dc2626; }
        [data-theme="light"] .lt-chart-box { background:white;border:1px solid #e5e7eb; }
        [data-theme="light"] .lt-chart-title { color:#111827; }
      ` }} />

      {/* Toast Notification popup */}
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] animate-fade-in-up flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl bg-[#161822] border-blue-500/30 text-white">
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === "success" ? "bg-green-400 shadow-[0_0_10px_#4ade80]" : toast.type === "error" ? "bg-red-400 shadow-[0_0_10px_#f87171]" : "bg-blue-400 shadow-[0_0_10px_#60a5fa]"}`} />
          <p className="text-sm font-semibold text-white">{toast.message}</p>
        </div>
      )}

      {/* SIDEBAR CONTAINER */}
      <div className="sidebar">
        <a href="/" className="sidebar-logo" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span style={{ fontWeight: 900, fontSize: "1.35rem", color: "#7C3AED", letterSpacing: "-0.02em" }}>
            GAME<span style={{ color: "#06B6D4" }}>ACC</span>
          </span>
          <span style={{
            fontSize: "0.55rem", fontWeight: 700, padding: "0.1rem 0.35rem",
            background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
            color: "#fff", borderRadius: "4px", marginLeft: "2px", letterSpacing: "0.05em",
            lineHeight: "1"
          }}>SHOP</span>
        </a>
        <div className="nav-section">Quản lý</div>
        
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
        >
          <i className="ti ti-layout-dashboard"></i> Dashboard
        </button>
        
        <button 
          onClick={() => { setActiveTab("products"); setProductSubTab("accounts"); }}
          className={`nav-item ${activeTab === "products" && productSubTab === "accounts" ? "active" : ""}`}
        >
          <i className="ti ti-user-circle"></i> Tài khoản game <i className="ti ti-chevron-right nav-arr"></i>
        </button>
        
        <button 
          onClick={() => { setActiveTab("products"); setProductSubTab("cards"); }}
          className={`nav-item ${activeTab === "products" && productSubTab === "cards" ? "active" : ""}`}
        >
          <i className="ti ti-cards"></i> Thẻ cào game <i className="ti ti-chevron-right nav-arr"></i>
        </button>
        
        <button 
          onClick={() => { setActiveTab("products"); setProductSubTab("giftcodes"); }}
          className={`nav-item ${activeTab === "products" && productSubTab === "giftcodes" ? "active" : ""}`}
        >
          <i className="ti ti-gift"></i> Gift code <i className="ti ti-chevron-right nav-arr"></i>
        </button>

        
        <button 
          onClick={() => setActiveTab("orders")}
          className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
        >
          <i className="ti ti-receipt"></i> Đơn hàng <i className="ti ti-chevron-right nav-arr"></i>
        </button>
        
        <button 
          onClick={() => setActiveTab("users")}
          className={`nav-item ${activeTab === "users" ? "active" : ""}`}
        >
          <i className="ti ti-users"></i> Người dùng <i className="ti ti-chevron-right nav-arr"></i>
        </button>
        
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main" style={{ background: theme === "dark" ? "#0f1117" : "#f4f6fb" }}>
        {/* Top Header Row */}
        <div className="row" style={{ alignItems: "center" }}>
          {activeTab === "dashboard" ? (
            <div>
              <div className="page-title">Dashboard tổng quan</div>
              <div className="page-sub">Trang chủ - Dashboard</div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: theme === "dark" ? "#4a5568" : "#9ca3af" }}>
              Trang chủ &rsaquo; {activeTab === "users" ? "Người dùng" : activeTab === "products" ? "Sản phẩm" : "Đơn hàng"}
            </div>
          )}

          <div className="topbar-row" style={{ marginLeft: "auto" }}>
            <div className="search-box">
              <i className="ti ti-search"></i> Tìm kiếm...
            </div>
            <div className="icon-btn" onClick={() => showToast("Không có thông báo mới", "info")}><i className="ti ti-bell"></i></div>
            <div className="icon-btn" title="Làm mới dữ liệu" onClick={fetchAdminData}><i className="ti ti-refresh"></i></div>
            <div style={{ position: "relative" }}>
              <button className="avatar" onClick={() => setProfileOpen(!profileOpen)} title={`Hồ sơ của ${loggedInUser?.name}`}>
                {loggedInUser?.name ? loggedInUser.name.charAt(0).toUpperCase() : "A"}
              </button>
              {profileOpen && (
                <div className="avatar-dropdown">
                  <div className="avatar-name">
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{loggedInUser?.name}</div>
                    <div style={{ fontSize: 11, color: "#718096", marginTop: 2 }}>{loggedInUser?.email}</div>
                  </div>
                  <a href="/" className="avatar-menu-item" onClick={() => setProfileOpen(false)}>
                    <i className="ti ti-home" style={{ fontSize: 15 }} /> Trang chủ
                  </a>
                  <button className="avatar-menu-item danger" onClick={() => { logout(); router.push("/login"); setProfileOpen(false); }}>
                    <i className="ti ti-logout" style={{ fontSize: 15 }} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Đổi giao diện"
              style={{
                width: 38, height: 38, borderRadius: "50%", cursor: "pointer",
                background: theme === "dark" ? "#1a1d27" : "white",
                border: theme === "dark" ? "1.5px solid rgba(255,255,255,0.12)" : "1.5px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: theme === "dark" ? "#94a3b8" : "#374151",
                transition: "all 0.2s", flexShrink: 0
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.color = "#7C3AED"; }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = theme === "dark" ? "rgba(255,255,255,0.12)" : "#e5e7eb";
                e.currentTarget.style.color = theme === "dark" ? "#94a3b8" : "#374151";
              }}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            {/* First Row of Cards */}
            <div className="row">
              {/* Card 1: Doanh thu tháng này */}
              <div className="card stat-card">
                <div className="stat-label">Doanh thu tháng này</div>
                <div className="stat-val">
                  <span className="curr">₫</span>
                  {statsMonthlyEarnings.toLocaleString("vi-VN")}
                  <span className="badge-up">↑ 2.2%</span>
                </div>
                <div className="donut-wrap">
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="28" fill="none" stroke={theme === "dark" ? "rgba(255,255,255,0.07)" : "#e5e7eb"} strokeWidth="10"/>
                    <circle cx="36" cy="36" r="28" fill="none" stroke="#6366f1" strokeWidth="10" strokeDasharray="70 106" strokeDashoffset="42" strokeLinecap="round"/>
                    <circle cx="36" cy="36" r="28" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="50 126" strokeDashoffset="-28" strokeLinecap="round"/>
                    <circle cx="36" cy="36" r="28" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="56 120" strokeDashoffset="-78" strokeLinecap="round"/>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div className="legend-item">
                      <span className="leg-dot" style={{ background: "#6366f1" }}></span>
                      Tài khoản
                      <span className="leg-val">{(statsAccountEarnings / 1000).toLocaleString("vi-VN")}k</span>
                    </div>
                    <div className="legend-item">
                      <span className="leg-dot" style={{ background: "#f59e0b" }}></span>
                      Thẻ cào
                      <span className="leg-val">{(statsCardEarnings / 1000).toLocaleString("vi-VN")}k</span>
                    </div>
                    <div className="legend-item">
                      <span className="leg-dot" style={{ background: "#10b981" }}></span>
                      Gift code
                      <span className="leg-val">{(statsGiftcodeEarnings / 1000).toLocaleString("vi-VN")}k</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Doanh thu trung bình / ngày */}
              <div className="card stat-card">
                <div className="stat-label">Doanh thu trung bình / ngày</div>
                <div className="stat-val">
                  <span className="curr">₫</span>
                  {statsAverageDailySales.toLocaleString("vi-VN")}
                  <span className="badge-up">↑ 2.6%</span>
                </div>
                <div className="bar-wrap">
                  <div className="bar" style={{ height: "38%" }}></div>
                  <div className="bar" style={{ height: "52%" }}></div>
                  <div className="bar" style={{ height: "46%" }}></div>
                  <div className="bar" style={{ height: "68%" }}></div>
                  <div className="bar active" style={{ height: "84%" }}></div>
                  <div className="bar" style={{ height: "60%" }}></div>
                  <div className="bar" style={{ height: "75%" }}></div>
                  <div className="bar" style={{ height: "63%" }}></div>
                  <div className="bar" style={{ height: "90%" }}></div>
                  <div className="bar" style={{ height: "78%" }}></div>
                  <div className="bar" style={{ height: "70%" }}></div>
                </div>
              </div>

              {/* Card 3: Đơn hàng tháng này */}
              <div className="card" style={{ flex: 1.5, minWidth: "300px" }}>
                <div className="card-hdr">
                  <div>
                    <div className="card-title">Đơn hàng tháng này</div>
                    <div className="card-sub">Tất cả kênh thanh toán</div>
                  </div>
                  <div className="more-btn" onClick={() => showToast("Đang tải dữ liệu chu kỳ mới...", "info")}>
                    <i className="ti ti-dots"></i>
                  </div>
                </div>
                <div className="stat-val" style={{ marginTop: "8px" }}>
                  {statsOrdersThisMonthCount}
                  <span className="badge-up">↑ 4.6%</span>
                </div>
                <div style={{ fontSize: "11px", color: "#4a5568", marginTop: "2px" }}>Còn 48,346 đơn đến mục tiêu</div>
                
                {/* SVG spline line graph that replaces the Chart.js canvas */}
                <div style={{ position: "relative", height: "80px", marginTop: "12px" }}>
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ display: "block" }}>
                    <defs>
                      <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 35 Q 20 20 40 28 T 80 15 T 100 8" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 0 35 Q 20 20 40 28 T 80 15 T 100 8 L 100 40 L 0 40 Z" fill="url(#orderGrad)" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Second Row of Cards */}
            <div className="row">
              {/* Card 4: Tài khoản game còn hàng */}
              <div className="card stat-card">
                <div className="stat-label">Tài khoản game còn hàng</div>
                <div className="stat-val">
                  {statsAvailableAccountsCount}
                  <span className="badge-dn">↓ 2.2%</span>
                </div>
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#4a5568" }}>
                  Đã bán: {statsSoldAccountsCount} tài khoản
                </div>
                <div className="prog-bg">
                  <div className="prog-fill" style={{ width: `${statsAccountSoldPercentage}%`, background: "#6366f1" }}></div>
                </div>
                <div className="prog-meta">
                  <span>Tỷ lệ bán ra</span>
                  <span style={{ color: "#818cf8", fontWeight: 500 }}>{statsAccountSoldPercentage}%</span>
                </div>
              </div>

              {/* Card 5: Thẻ cào còn hàng */}
              <div className="card stat-card">
                <div className="stat-label">Thẻ cào còn hàng</div>
                <div className="stat-val">
                  {statsAvailableCardsCount}
                  <span className="badge-up">↑ 1.8%</span>
                </div>
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#4a5568" }}>
                  Đã bán: {statsSoldCardsCount} thẻ
                </div>
                <div className="prog-bg">
                  <div className="prog-fill" style={{ width: `${statsCardSoldPercentage}%`, background: "#f59e0b" }}></div>
                </div>
                <div className="prog-meta">
                  <span>Tỷ lệ bán ra</span>
                  <span style={{ color: "#fbbf24", fontWeight: 500 }}>{statsCardSoldPercentage}%</span>
                </div>
              </div>

              {/* Card 6: Doanh thu theo loại sản phẩm */}
              <div className="card" style={{ flex: 2, minWidth: "320px" }}>
                <div className="card-hdr">
                  <div>
                    <div className="card-title">Doanh thu theo loại sản phẩm</div>
                    <div className="card-sub">Tất cả kênh - tháng này</div>
                  </div>
                  <div className="more-btn" onClick={() => showToast("Đang lọc theo loại sản phẩm...", "info")}>
                    <i className="ti ti-dots"></i>
                  </div>
                </div>
                <div className="stat-val" style={{ marginTop: "6px" }}>
                  <span className="curr">₫</span>
                  {statsProductTypeEarnings.toLocaleString("vi-VN")}
                  <span className="badge-up">↑ 2.8%</span>
                </div>
                <div style={{ fontSize: "11px", color: "#4a5568", marginTop: "2px", marginBottom: "10px" }}>
                  Gift code & thẻ cào giảm giá
                </div>
                
                {/* SVG spline line graph that replaces the Chart.js canvas */}
                <div style={{ position: "relative", height: "70px" }}>
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ display: "block" }}>
                    <defs>
                      <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 30 Q 25 15 50 32 T 100 18" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 0 30 Q 25 15 50 32 T 100 18 L 100 40 L 0 40 Z" fill="url(#discGrad)" />
                  </svg>
                </div>
              </div>
            </div>

            {/* BẢNG ĐƠN HÀNG GẦN ĐÂY */}
            <div className="card">
              <div className="card-hdr" style={{ marginBottom: "12px" }}>
                <div>
                  <div className="card-title">Đơn hàng gần đây</div>
                  <div className="card-sub">Danh sách các sản phẩm và giao dịch vừa diễn ra trên hệ thống</div>
                </div>
                <div className="more-btn" onClick={() => showToast("Đang tải danh sách giao dịch mới...", "info")}>
                  <i className="ti ti-dots"></i>
                </div>
              </div>
              
              <div className="tabs">
                <div 
                  onClick={() => setRecentProductTab("accounts")}
                  className={`tab ${recentProductTab === "accounts" ? "active" : ""}`}
                >
                  <i className="ti ti-user-circle"></i> Tài khoản
                </div>
                <div 
                  onClick={() => setRecentProductTab("cards")}
                  className={`tab ${recentProductTab === "cards" ? "active" : ""}`}
                >
                  <i className="ti ti-cards"></i> Thẻ cào
                </div>
                <div 
                  onClick={() => setRecentProductTab("giftcodes")}
                  className={`tab ${recentProductTab === "giftcodes" ? "active" : ""}`}
                >
                  <i className="ti ti-gift"></i> Gift code
                </div>
              </div>

              <div id="orders-body" style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {recentProductTab === "accounts" && (
                        <>
                          <th style={{ width: "45%" }}>Tên tài khoản</th>
                          <th style={{ width: "20%" }}>Người bán</th>
                          <th style={{ width: "20%" }}>Rank / Cấp độ</th>
                          <th style={{ width: "15%" }}>Giá tiền</th>
                          <th style={{ width: "15%", textAlign: "right" }}>Trạng thái</th>
                        </>
                      )}
                      {recentProductTab === "cards" && (
                        <>
                          <th style={{ width: "45%" }}>Thông tin thẻ</th>
                          <th style={{ width: "20%" }}>Số Serial</th>
                          <th style={{ width: "20%" }}>Mã nạp</th>
                          <th style={{ width: "15%" }}>Mệnh giá</th>
                          <th style={{ width: "15%", textAlign: "right" }}>Trạng thái</th>
                        </>
                      )}
                      {recentProductTab === "giftcodes" && (
                        <>
                          <th style={{ width: "45%" }}>Thông tin Giftcode</th>
                          <th style={{ width: "20%" }}>Người đăng</th>
                          <th style={{ width: "20%" }}>Mã Code</th>
                          <th style={{ width: "15%" }}>Mệnh giá</th>
                          <th style={{ width: "15%", textAlign: "right" }}>Trạng thái</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {recentProductTab === "accounts" && (
                      accounts.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>Không có tài khoản game nào.</td>
                        </tr>
                      ) : (
                        accounts.slice(0, 5).map(acc => (
                          <tr key={acc.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div className="prod-img" style={{ background: "rgba(99,102,241,0.12)" }}>
                                  <i className="ti ti-user-circle" style={{ fontSize: "16px", color: "#818cf8" }}></i>
                                </div>
                                <div>
                                  <div className="prod-name">{acc.title}</div>
                                  <div className="prod-sku">MÃ: #{acc.id}</div>
                                </div>
                              </div>
                            </td>
                            <td>{acc.seller_name}</td>
                            <td>
                              <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "#e2e8f0", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>
                                {acc.description || "—"}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500, color: "#e2e8f0" }}>{acc.price.toLocaleString("vi-VN")}₫</td>
                            <td style={{ textAlign: "right" }}>
                              <span className={`status-pill ${acc.status === "sold" ? "s-sold" : "s-avail"}`}>
                                {acc.status === "sold" ? "Đã bán" : "Còn hàng"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )
                    )}

                    {recentProductTab === "cards" && (
                      cards.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>Không có thẻ game nào.</td>
                        </tr>
                      ) : (
                        cards.slice(0, 5).map(card => (
                          <tr key={card.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div className="prod-img" style={{ background: "rgba(16,185,129,0.12)" }}>
                                  <i className="ti ti-cards" style={{ fontSize: "16px", color: "#34d399" }}></i>
                                </div>
                                <div>
                                  <div className="prod-name">{card.title}</div>
                                  <div className="prod-sku">MÃ: #{card.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontFamily: "monospace" }}>{card.card_serial}</td>
                            <td>
                              <span style={{ fontFamily: "monospace", filter: "blur(4px)", transition: "filter 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.filter = "none"} onMouseLeave={(e) => e.currentTarget.style.filter = "blur(4px)"}>
                                {card.card_code}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500, color: "#e2e8f0" }}>{card.price.toLocaleString("vi-VN")}₫</td>
                            <td style={{ textAlign: "right" }}>
                              <span className={`status-pill ${card.status === "sold" ? "s-sold" : "s-avail"}`}>
                                {card.status === "sold" ? "Đã bán" : "Có sẵn"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )
                    )}

                    {recentProductTab === "giftcodes" && (
                      giftcodes.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>Không có giftcode nào.</td>
                        </tr>
                      ) : (
                        giftcodes.slice(0, 5).map(gc => (
                          <tr key={gc.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div className="prod-img" style={{ background: "rgba(245,158,11,0.12)" }}>
                                  <i className="ti ti-gift" style={{ fontSize: "16px", color: "#fbbf24" }}></i>
                                </div>
                                <div>
                                  <div className="prod-name">{gc.title}</div>
                                  <div className="prod-sku">MÃ: #{gc.id}</div>
                                </div>
                              </div>
                            </td>
                            <td>{gc.seller_name}</td>
                            <td>
                              <span style={{ fontFamily: "monospace", filter: "blur(4px)", transition: "filter 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.filter = "none"} onMouseLeave={(e) => e.currentTarget.style.filter = "blur(4px)"}>
                                {gc.giftcode_string}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500, color: "#e2e8f0" }}>{gc.price.toLocaleString("vi-VN")}₫</td>
                            <td style={{ textAlign: "right" }}>
                              <span className={`status-pill ${gc.status === "sold" ? "s-sold" : "s-avail"}`}>
                                {gc.status === "sold" ? "Đã bán" : "Có sẵn"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}


          {/* ==========================================
             TAB 2: USER MANAGEMENT (CRUD)
          ========================================== */}
          {activeTab === "users" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Page Header */}
              <div className="lt-hdr">
                <div>
                  <div className="lt-h1">Người dùng</div>
                  <div className="lt-sub">Xem, phân quyền và điều chỉnh tài khoản thành viên sàn</div>
                </div>
                <div className="lt-hdr-btns">
                  <button className="lt-btn-add" onClick={handleOpenAddUser}>
                    + Thêm thành viên
                  </button>
                </div>
              </div>

              {/* Filter Chip Bar */}
              <div className="cbar">
                <div className="cc">
                  <b>Vai trò:</b>&nbsp;<em>{userRoleFilter === "all" ? "Tất cả" : userRoleFilter === "admin" ? "Admin" : userRoleFilter === "seller" ? "Seller" : "Buyer"}</em>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                  <select className="cc-sel" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="seller">Seller</option>
                    <option value="buyer">Buyer</option>
                  </select>
                </div>
                <div className="cc">
                  <b>Tìm kiếm:</b>&nbsp;<em style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" }}>{userSearch || "Tất cả"}</em>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                  <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Tìm tên, email..." className="cc-sel" style={{ cursor: "text" }} />
                </div>
                <span className="cbar-right">Total : <b>{filteredUsers.length}</b> and showing <b>10</b> page</span>
              </div>

              {/* Data Table */}
              <div className="lt-box">
                <table className="lt-ta">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></th>
                      <th>Thành viên</th>
                      <th>Vai trò</th>
                      <th>Ngày tham gia</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, color: "#9ca3af" }}>Không tìm thấy thành viên nào.</td></tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="lt-av" style={{ background: user.role === "admin" ? "#fee2e2" : user.role === "seller" ? "#dbeafe" : "#dcfce7", color: user.role === "admin" ? "#dc2626" : user.role === "seller" ? "#1d4ed8" : "#16a34a" }}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                                <div style={{ fontSize: 11, color: "#9ca3af" }}>{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`ltrb ${user.role === "admin" ? "ltrb-admin" : user.role === "seller" ? "ltrb-seller" : "ltrb-buyer"}`}>
                              {user.role === "admin" ? "Admin" : user.role === "seller" ? "Seller" : "Buyer"}
                            </span>
                          </td>
                          <td style={{ color: "#6b7280" }}>
                            {new Date(user.created_at).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })}
                          </td>
                          <td>
                            <span className={`ltbs ${user.status === "active" ? "ltbs-active" : "ltbs-banned"}`}>
                              {user.status === "active" ? "✓ Hoạt động" : "✕ Bị khóa"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button className="lt-ab" onClick={() => handleOpenEditUser(user)} title="Chỉnh sửa"><Edit3 size={13} /></button>
                              <button className={`lt-ab ${user.status === "active" ? "lt-ab-r" : "lt-ab-g"}`} onClick={() => handleToggleUserStatus(user)} title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa"}>
                                {user.status === "active" ? <UserX size={13} /> : <UserCheck size={13} />}
                              </button>
                              <button className="lt-ab lt-ab-r" onClick={() => handleDeleteUser(user.id, user.name)} title="Xóa thành viên"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ==========================================
             TAB 3: PRODUCT MANAGEMENT (CRUD - ACCOUNTS, CARDS, GIFTCODES)
          ========================================== */}
          {activeTab === "products" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Page Header */}
              <div className="lt-hdr">
                <div>
                  <div className="lt-h1">
                    {productSubTab === "accounts" ? "Tài khoản Game" : productSubTab === "cards" ? "Thẻ cào Game" : "Gift Code"}
                  </div>
                  <div className="lt-sub">
                    {productSubTab === "accounts" ? "Đăng bán và kiểm duyệt các tài khoản game trên hệ thống" : productSubTab === "cards" ? "Quản lý danh sách mã thẻ cào nạp game đang bán" : "Quản lý và kiểm duyệt các mã Giftcode nạp thưởng"}
                  </div>
                </div>
                <div className="lt-hdr-btns">
                  {productSubTab === "accounts" && <button className="lt-btn-add" onClick={handleOpenAddAccount}>+ Đăng tài khoản mới</button>}
                  {productSubTab === "cards" && <button className="lt-btn-add" onClick={handleOpenAddCard}>+ Đăng thẻ game mới</button>}
                  {productSubTab === "giftcodes" && <button className="lt-btn-add" onClick={handleOpenAddGiftcode}>+ Đăng giftcode mới</button>}
                </div>
              </div>

              {/* SUB-TAB 1: GAME ACCOUNTS */}
              {productSubTab === "accounts" && (
                <>
                  <div className="cbar">
                    <div className="cc">
                      <b>Trạng thái:</b>&nbsp;<em>{accountStatusFilter === "all" ? "Tất cả" : accountStatusFilter === "available" ? "Còn hàng" : accountStatusFilter === "sold" ? "Đã bán" : "Đã ẩn"}</em>
                      <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                      <select className="cc-sel" value={accountStatusFilter} onChange={e => setAccountStatusFilter(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="available">Còn hàng</option>
                        <option value="sold">Đã bán</option>
                        <option value="hidden">Đã ẩn</option>
                      </select>
                    </div>
                    <div className="cc">
                      <b>Tìm kiếm:</b>&nbsp;<em style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>{accountSearch || "Tất cả"}</em>
                      <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                      <input type="text" value={accountSearch} onChange={e => setAccountSearch(e.target.value)} placeholder="Tìm tiêu đề, ID..." className="cc-sel" style={{ cursor: "text" }} />
                    </div>
                    <span className="cbar-right">Total : <b>{filteredAccounts.length}</b> and showing <b>10</b> page</span>
                  </div>
                  <div className="lt-box">
                    <table className="lt-ta">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></th>
                          <th>Thông tin Acc</th>
                          <th>Mô tả</th>
                          <th>Người bán</th>
                          <th>Giá tiền</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAccounts.length === 0 ? (
                          <tr><td colSpan={7} style={{ textAlign: "center", padding: 28, color: "#9ca3af" }}>Không có tài khoản nào được rao bán.</td></tr>
                        ) : filteredAccounts.map(acc => (
                          <tr key={acc.id}>
                            <td><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎮</div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.title}</div>
                                  <div style={{ fontSize: 11, color: "#9ca3af" }}>#{acc.id}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: 12, color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.description || "—"}</div>
                            </td>
                            <td style={{ color: "#6b7280" }}>{acc.seller_name}</td>
                            <td style={{ fontWeight: 700 }}>{acc.price.toLocaleString("vi-VN")}₫</td>
                            <td>
                              <span className={`ltbs ${acc.status === "sold" ? "ltbs-sold" : acc.status === "available" ? "ltbs-avail" : "ltbs-hidden"}`}>
                                {acc.status === "sold" ? "● Đã bán" : acc.status === "available" ? "✓ Còn hàng" : "○ Đã ẩn"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="lt-ab" onClick={() => handleOpenEditAccount(acc)} title="Chỉnh sửa"><Edit3 size={13} /></button>
                                <button className="lt-ab lt-ab-r" onClick={() => handleDeleteAccount(acc.id, acc.title)} title="Xóa tin đăng"><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* SUB-TAB 2: GAME CARDS */}
              {productSubTab === "cards" && (
                <>
                  <div className="cbar">
                    <div className="cc">
                      <b>Trạng thái:</b>&nbsp;<em>{cardStatusFilter === "all" ? "Tất cả" : cardStatusFilter === "available" ? "Chưa nạp" : cardStatusFilter === "sold" ? "Đã bán" : "Đã ẩn"}</em>
                      <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                      <select className="cc-sel" value={cardStatusFilter} onChange={e => setCardStatusFilter(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="available">Chưa nạp</option>
                        <option value="sold">Đã bán</option>
                        <option value="hidden">Đã ẩn</option>
                      </select>
                    </div>
                    <div className="cc">
                      <b>Tìm kiếm:</b>&nbsp;<em style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>{cardSearch || "Tất cả"}</em>
                      <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                      <input type="text" value={cardSearch} onChange={e => setCardSearch(e.target.value)} placeholder="Tìm tiêu đề, serial..." className="cc-sel" style={{ cursor: "text" }} />
                    </div>
                    <span className="cbar-right">Total : <b>{filteredCards.length}</b> and showing <b>10</b> page</span>
                  </div>
                  <div className="lt-box">
                    <table className="lt-ta">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></th>
                          <th>Thông tin Thẻ</th>
                          <th>Số Serial</th>
                          <th>Mã nạp</th>
                          <th>Giá tiền</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCards.length === 0 ? (
                          <tr><td colSpan={7} style={{ textAlign: "center", padding: 28, color: "#9ca3af" }}>Không có thẻ game nào được rao bán.</td></tr>
                        ) : filteredCards.map(card => (
                          <tr key={card.id}>
                            <td><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎫</div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.title}</div>
                                  <div style={{ fontSize: 11, color: "#9ca3af" }}>#{card.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontFamily: "monospace", color: "#6b7280", fontSize: 12 }}>{card.card_serial}</td>
                            <td>
                              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280", filter: "blur(3px)", transition: "filter 0.2s" }} onMouseEnter={e => (e.currentTarget.style.filter = "none")} onMouseLeave={e => (e.currentTarget.style.filter = "blur(3px)")}>
                                {card.card_code}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700 }}>{card.price.toLocaleString("vi-VN")}₫</td>
                            <td>
                              <span className={`ltbs ${card.status === "sold" ? "ltbs-sold" : card.status === "available" ? "ltbs-avail" : "ltbs-hidden"}`}>
                                {card.status === "sold" ? "● Đã bán" : card.status === "available" ? "✓ Có sẵn" : "○ Đã ẩn"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="lt-ab" onClick={() => handleOpenEditCard(card)} title="Chỉnh sửa"><Edit3 size={13} /></button>
                                <button className="lt-ab lt-ab-r" onClick={() => handleDeleteCard(card.id, card.title)} title="Xóa"><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* SUB-TAB 3: GIFTCODES */}
              {productSubTab === "giftcodes" && (
                <>
                  <div className="cbar">
                    <div className="cc">
                      <b>Trạng thái:</b>&nbsp;<em>{giftcodeStatusFilter === "all" ? "Tất cả" : giftcodeStatusFilter === "available" ? "Chưa dùng" : giftcodeStatusFilter === "sold" ? "Đã bán" : "Đã ẩn"}</em>
                      <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                      <select className="cc-sel" value={giftcodeStatusFilter} onChange={e => setGiftcodeStatusFilter(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="available">Chưa dùng</option>
                        <option value="sold">Đã bán</option>
                        <option value="hidden">Đã ẩn</option>
                      </select>
                    </div>
                    <div className="cc">
                      <b>Tìm kiếm:</b>&nbsp;<em style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>{giftcodeSearch || "Tất cả"}</em>
                      <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                      <input type="text" value={giftcodeSearch} onChange={e => setGiftcodeSearch(e.target.value)} placeholder="Tìm tiêu đề, mã code..." className="cc-sel" style={{ cursor: "text" }} />
                    </div>
                    <span className="cbar-right">Total : <b>{filteredGiftcodes.length}</b> and showing <b>10</b> page</span>
                  </div>
                  <div className="lt-box">
                    <table className="lt-ta">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></th>
                          <th>Thông tin Giftcode</th>
                          <th>Người đăng</th>
                          <th>Mã Code</th>
                          <th>Giá tiền</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGiftcodes.length === 0 ? (
                          <tr><td colSpan={7} style={{ textAlign: "center", padding: 28, color: "#9ca3af" }}>Không có giftcode nào được rao bán.</td></tr>
                        ) : filteredGiftcodes.map(gc => (
                          <tr key={gc.id}>
                            <td><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎁</div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gc.title}</div>
                                  <div style={{ fontSize: 11, color: "#9ca3af" }}>#{gc.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: "#6b7280" }}>{gc.seller_name}</td>
                            <td>
                              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280", filter: "blur(3px)", transition: "filter 0.2s" }} onMouseEnter={e => (e.currentTarget.style.filter = "none")} onMouseLeave={e => (e.currentTarget.style.filter = "blur(3px)")}>
                                {gc.giftcode_string}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700 }}>{gc.price.toLocaleString("vi-VN")}₫</td>
                            <td>
                              <span className={`ltbs ${gc.status === "sold" ? "ltbs-sold" : gc.status === "available" ? "ltbs-avail" : "ltbs-hidden"}`}>
                                {gc.status === "sold" ? "● Đã bán" : gc.status === "available" ? "✓ Có sẵn" : "○ Đã ẩn"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="lt-ab" onClick={() => handleOpenEditGiftcode(gc)} title="Chỉnh sửa"><Edit3 size={13} /></button>
                                <button className="lt-ab lt-ab-r" onClick={() => handleDeleteGiftcode(gc.id, gc.title)} title="Xóa"><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

            </div>
          )}

          {/* ==========================================
             TAB 4: ORDER MANAGEMENT (CRUD & ESCROW DELIVERY)
          ========================================== */}
          {activeTab === "orders" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Page Header */}
              <div className="lt-hdr">
                <div>
                  <div className="lt-h1">Đơn hàng</div>
                  <div className="lt-sub">Quản lý luồng thanh toán Escrow, hóa đơn mua hàng và bàn giao dữ liệu bí mật</div>
                </div>
                <div className="lt-hdr-btns">
                </div>
              </div>

              {/* Filter Chip Bar */}
              <div className="cbar">
                <div className="cc">
                  <b>Trạng thái:</b>&nbsp;<em>{orderStatusFilter === "all" ? "Tất cả" : orderStatusFilter === "pending" ? "Chờ duyệt" : orderStatusFilter === "completed" ? "Hoàn thành" : "Thất bại"}</em>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                  <select className="cc-sel" value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="failed">Thất bại</option>
                  </select>
                </div>
                <div className="cc">
                  <b>Tìm kiếm:</b>&nbsp;<em style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" }}>{orderSearch || "Tất cả"}</em>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                  <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Tìm mã đơn, tên KH..." className="cc-sel" style={{ cursor: "text" }} />
                </div>
                <span className="cbar-right">Total : <b>{filteredOrders.length}</b> and showing <b>10</b> page</span>
              </div>

              {/* Orders Data Table */}
              <div className="lt-box">
                <table className="lt-ta">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></th>
                      <th>Mã Đơn / Mã GD</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Phương thức</th>
                      <th>Ngày giao dịch</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: 28, color: "#9ca3af" }}>Không tìm thấy đơn hàng nào.</td></tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></td>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>#{order.id}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>{order.payment_transaction_id}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{order.buyer_name}</td>
                          <td style={{ fontWeight: 700 }}>{order.total_amount.toLocaleString("vi-VN")}₫</td>
                          <td style={{ color: "#6b7280", fontSize: 12 }}>{order.payment_method}</td>
                          <td style={{ color: "#6b7280" }}>
                            {new Date(order.created_at).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })}
                          </td>
                          <td>
                            <span className={`ltbs ${order.status === "completed" ? "ltbs-done" : order.status === "pending" ? "ltbs-pending" : "ltbs-fail"}`}>
                              {order.status === "completed" ? "✓ Hoàn thành" : order.status === "pending" ? "○ Chờ duyệt" : "✕ Thất bại"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="lt-ab" onClick={() => handleViewOrderDetail(order)} title="Xem chi tiết"><Eye size={13} /></button>
                              {order.status === "pending" && (
                                <>
                                  <button className="lt-ab lt-ab-g" onClick={() => handleUpdateOrderStatus(order.id, "completed")} title="Hoàn thành"><Check size={13} /></button>
                                  <button className="lt-ab lt-ab-r" onClick={() => handleUpdateOrderStatus(order.id, "failed")} title="Thất bại"><X size={13} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}




      </div>

      {/* ==========================================
         USER DYNAMIC CRUD MODAL DIALOG
      ========================================== */}
      {userModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: "rgba(5,7,16,0.78)", backdropFilter: "blur(18px)" }}
        >
          <div style={{
            width: "100%", maxWidth: 480, borderRadius: 20,
            background: "linear-gradient(145deg, #13151f 0%, #0e1018 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1) inset",
            position: "relative", overflow: "hidden"
          }}>

            {/* Gradient header */}
            <div style={{
              padding: "22px 24px 20px",
              background: "linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(99,102,241,0.10) 100%)",
              borderBottom: "1px solid rgba(59,130,246,0.15)",
              position: "relative"
            }}>
              {/* Glow orb */}
              <div style={{
                position: "absolute", top: -30, left: -30, width: 120, height: 120,
                background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)",
                borderRadius: "50%", pointerEvents: "none"
              }} />

              {/* Close button */}
              <button
                onClick={() => setUserModalOpen(false)}
                style={{
                  position: "absolute", top: 16, right: 16,
                  width: 30, height: 30, borderRadius: 8,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#8b9ab5", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#8b9ab5"; }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Avatar preview */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: userForm.role === "admin"
                    ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                    : userForm.role === "seller"
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "linear-gradient(135deg, #059669, #047857)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 800, color: "#fff",
                  boxShadow: userForm.role === "admin"
                    ? "0 8px 20px rgba(220,38,38,0.35)"
                    : userForm.role === "seller"
                    ? "0 8px 20px rgba(37,99,235,0.35)"
                    : "0 8px 20px rgba(5,150,105,0.35)",
                  transition: "all 0.3s"
                }}>
                  {userForm.name ? userForm.name.charAt(0).toUpperCase() : <Users style={{ width: 22, height: 22 }} />}
                </div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
                    {editingUser ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                      background: userForm.role === "admin" ? "rgba(220,38,38,0.15)" : userForm.role === "seller" ? "rgba(37,99,235,0.15)" : "rgba(5,150,105,0.15)",
                      color: userForm.role === "admin" ? "#f87171" : userForm.role === "seller" ? "#60a5fa" : "#34d399",
                      textTransform: "uppercase", letterSpacing: "0.05em"
                    }}>
                      {userForm.role === "admin" ? "⚡ Admin" : userForm.role === "seller" ? "🏪 Seller" : "🛒 Buyer"}
                    </span>
                    <span style={{ color: "#4a5568" }}>·</span>
                    <span style={{
                      padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                      background: userForm.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: userForm.status === "active" ? "#34d399" : "#f87171"
                    }}>
                      {userForm.status === "active" ? "✓ Hoạt động" : "✕ Đã khóa"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveUser} style={{ padding: "20px 24px 24px" }}>

              {/* Section: Thông tin cá nhân */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6
                }}>
                  <div style={{ width: 16, height: 1.5, background: "#3b82f6", borderRadius: 1 }} />
                  Thông tin cá nhân
                  <div style={{ flex: 1, height: 1.5, background: "rgba(59,130,246,0.15)", borderRadius: 1 }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Name */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>
                      👤 Họ và tên đầy đủ
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      placeholder="Nhập họ và tên thành viên..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>
                      📧 Địa chỉ Email
                    </label>
                    <input
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="example@email.com"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Phân quyền & Trạng thái */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6
                }}>
                  <div style={{ width: 16, height: 1.5, background: "#8b5cf6", borderRadius: 1 }} />
                  🛡️ Phân quyền & Trạng thái
                  <div style={{ flex: 1, height: 1.5, background: "rgba(139,92,246,0.15)", borderRadius: 1 }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Role */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>
                      🎭 Vai trò
                    </label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as "admin" | "seller" | "buyer" })}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", cursor: "pointer", boxSizing: "border-box",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b9ab5' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px",
                        transition: "all 0.2s"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <option value="buyer" style={{ background: "#10121a" }}>🛒 Người mua</option>
                      <option value="seller" style={{ background: "#10121a" }}>🏪 Người bán</option>
                      <option value="admin" style={{ background: "#10121a" }}>⚡ Quản trị viên</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>
                      📊 Trạng thái
                    </label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value as "active" | "banned" })}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", cursor: "pointer", boxSizing: "border-box",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b9ab5' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px",
                        transition: "all 0.2s"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <option value="active" style={{ background: "#10121a" }}>✅ Hoạt động</option>
                      <option value="banned" style={{ background: "#10121a" }}>🔒 Khóa tài khoản</option>
                    </select>
                  </div>
                </div>

                {/* Role info hint */}
                <div style={{
                  marginTop: 10, padding: "10px 14px", borderRadius: 10,
                  background: userForm.role === "admin"
                    ? "rgba(220,38,38,0.07)" : userForm.role === "seller"
                    ? "rgba(37,99,235,0.07)" : "rgba(5,150,105,0.07)",
                  border: `1px solid ${userForm.role === "admin" ? "rgba(220,38,38,0.2)" : userForm.role === "seller" ? "rgba(37,99,235,0.2)" : "rgba(5,150,105,0.2)"}`,
                  fontSize: 11, color: userForm.role === "admin" ? "#f87171" : userForm.role === "seller" ? "#60a5fa" : "#34d399",
                  display: "flex", alignItems: "flex-start", gap: 8
                }}>
                  <span style={{ fontSize: 14, marginTop: 1 }}>
                    {userForm.role === "admin" ? "⚡" : userForm.role === "seller" ? "🏪" : "🛒"}
                  </span>
                  <span>
                    {userForm.role === "admin"
                      ? "Admin có toàn quyền quản lý hệ thống, duyệt sản phẩm và quản lý người dùng."
                      : userForm.role === "seller"
                      ? "Seller có thể đăng bán tài khoản game, thẻ cào và giftcode trên sàn."
                      : "Buyer chỉ có thể xem và mua sản phẩm, không có quyền đăng bán."}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 10,
                paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)"
              }}>
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  style={{
                    padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#8b9ab5", cursor: "pointer", transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#e2e8f0"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8b9ab5"; }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    border: "none", color: "#fff", cursor: "pointer", transition: "all 0.15s",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.35)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(59,130,246,0.5)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.35)"}
                >
                  {editingUser ? "💾 Lưu thay đổi" : "✨ Tạo thành viên"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         GAME ACCOUNT DYNAMIC CRUD MODAL DIALOG
      ========================================== */}
      {accountModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: "rgba(5,7,16,0.78)", backdropFilter: "blur(18px)" }}
        >
          <div
            style={{
              width: "100%", maxWidth: 540, borderRadius: 20,
              background: "linear-gradient(145deg, #13151f 0%, #0e1018 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1) inset",
              position: "relative", overflow: "hidden", maxHeight: "92vh", overflowY: "auto"
            }}
          >
            
            {/* Gradient header bar */}
            <div style={{
              padding: "22px 24px 18px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 100%)",
              borderBottom: "1px solid rgba(99,102,241,0.15)",
              position: "sticky", top: 0, zIndex: 2,
              backdropFilter: "blur(8px)"
            }}>
              {/* Glow orb */}
              <div style={{
                position: "absolute", top: -30, left: -30, width: 120, height: 120,
                background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
                borderRadius: "50%", pointerEvents: "none"
              }} />
              <button
                onClick={() => setAccountModalOpen(false)}
                style={{
                  position: "absolute", top: 16, right: 16,
                  width: 30, height: 30, borderRadius: 8,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#8b9ab5", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#8b9ab5"; }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(99,102,241,0.35)"
                }}>
                  <Gamepad2 style={{ width: 20, height: 20, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
                    {editingAccount ? "Chỉnh sửa tài khoản Game" : "Đăng bán tài khoản mới"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                    {editingAccount ? `Đang sửa: ${editingAccount.title}` : "Điền thông tin sản phẩm bên dưới"}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAccount} style={{ padding: "20px 24px 24px" }}>

              {/* Section: Thông tin cơ bản */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#6366f1", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6
                }}>
                  <div style={{ width: 16, height: 1.5, background: "#6366f1", borderRadius: 1 }} />
                  Thông tin sản phẩm
                  <div style={{ flex: 1, height: 1.5, background: "rgba(99,102,241,0.15)", borderRadius: 1 }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* Title */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>📝 Tiêu đề tin đăng bán</label>
                    <input
                      type="text" required
                      value={accountForm.title}
                      onChange={(e) => setAccountForm({ ...accountForm, title: e.target.value })}
                      placeholder="Ví dụ: Acc LMHT Kim Cương - 120 Skins..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>📊 Trạng thái rao bán</label>
                    <select
                      value={accountForm.status}
                      onChange={(e) => setAccountForm({ ...accountForm, status: e.target.value as any })}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", cursor: "pointer", boxSizing: "border-box",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b9ab5' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px"
                      }}
                    >
                      <option value="available" style={{ background: "#10121a" }}>✅ Sẵn sàng bán</option>
                      <option value="sold" style={{ background: "#10121a" }}>🔒 Đã bán</option>
                      <option value="hidden" style={{ background: "#10121a" }}>👁️ Đã ẩn</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>📄 Mô tả chi tiết</label>
                    <textarea
                      value={accountForm.description}
                      onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })}
                      placeholder="Mô tả trang phục, ngọc bổ sung, số tướng..."
                      rows={3}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", resize: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>💰 Giá bán (₫ VND)</label>
                    <input
                      type="number" min="0" required
                      value={accountForm.price}
                      onChange={(e) => setAccountForm({ ...accountForm, price: parseInt(e.target.value) || 0 })}
                      placeholder="450000"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>

                </div>
              </div>

              {/* Section: Thông tin bảo mật */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6
                }}>
                  <div style={{ width: 16, height: 1.5, background: "#f59e0b", borderRadius: 1 }} />
                  🔐 Thông tin đăng nhập (Bảo mật Escrow)
                  <div style={{ flex: 1, height: 1.5, background: "rgba(245,158,11,0.15)", borderRadius: 1 }} />
                </div>
                <div style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12
                }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#fbbf24", marginBottom: 6 }}>👤 Tên đăng nhập</label>
                    <input
                      type="text" required
                      value={accountForm.account_username}
                      onChange={(e) => setAccountForm({ ...accountForm, account_username: e.target.value })}
                      placeholder="Username..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontFamily: "monospace",
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                        color: "#fde68a", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.10)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#fbbf24", marginBottom: 6 }}>🔑 Mật khẩu</label>
                    <input
                      type="text" required
                      value={accountForm.account_password}
                      onChange={(e) => setAccountForm({ ...accountForm, account_password: e.target.value })}
                      placeholder="Password..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontFamily: "monospace",
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                        color: "#fde68a", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.10)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Ảnh sản phẩm */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#06b6d4", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6
                }}>
                  <div style={{ width: 16, height: 1.5, background: "#06b6d4", borderRadius: 1 }} />
                  🖼️ Ảnh sản phẩm
                  <div style={{ flex: 1, height: 1.5, background: "rgba(6,182,212,0.15)", borderRadius: 1 }} />
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Dán link ảnh (https://...)"
                    style={{
                      flex: 1, padding: "9px 14px", borderRadius: 10, fontSize: 12,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "#e2e8f0", outline: "none", boxSizing: "border-box"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imageUrlInput.trim()) {
                        setAccountForm({ ...accountForm, images: [...accountForm.images, imageUrlInput.trim()] });
                        setImageUrlInput("");
                      }
                    }}
                    style={{
                      padding: "9px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                      border: "none", color: "#fff", cursor: "pointer", whiteSpace: "nowrap"
                    }}
                  >
                    + Thêm
                  </button>
                </div>
                {accountForm.images.length > 0 && (
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: 8, padding: 10, borderRadius: 10,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)"
                  }}>
                    {accountForm.images.map((img, i) => (
                      <div key={i} style={{ position: "relative", width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}
                        className="group"
                      >
                        <img src={img} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => setAccountForm({ ...accountForm, images: accountForm.images.filter((_, idx) => idx !== i) })}
                          style={{
                            position: "absolute", inset: 0, background: "rgba(239,68,68,0.85)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: 11, border: "none", cursor: "pointer",
                            opacity: 0, transition: "opacity 0.15s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                        >Xóa</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 10,
                paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)"
              }}>
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(false)}
                  style={{
                    padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#8b9ab5", cursor: "pointer", transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#e2e8f0"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8b9ab5"; }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none", color: "#fff", cursor: "pointer", transition: "all 0.15s",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.35)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)"}
                >
                  {editingAccount ? "💾 Lưu thay đổi" : "🚀 Đăng rao bán"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         GAME CARD DYNAMIC CRUD MODAL DIALOG
      ========================================== */}
      {cardModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: "rgba(5,7,16,0.78)", backdropFilter: "blur(18px)" }}
        >
          <div style={{
            width: "100%", maxWidth: 480, borderRadius: 20,
            background: "linear-gradient(145deg, #13151f 0%, #0e1018 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.1) inset",
            position: "relative", overflow: "hidden"
          }}>

            {/* Gradient header */}
            <div style={{
              padding: "22px 24px 18px",
              background: "linear-gradient(135deg, rgba(16,185,129,0.16) 0%, rgba(5,150,105,0.10) 100%)",
              borderBottom: "1px solid rgba(16,185,129,0.15)",
            }}>
              <div style={{
                position: "absolute", top: -30, left: -30, width: 120, height: 120,
                background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
                borderRadius: "50%", pointerEvents: "none"
              }} />
              <button
                onClick={() => setCardModalOpen(false)}
                style={{
                  position: "absolute", top: 16, right: 16,
                  width: 30, height: 30, borderRadius: 8,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#8b9ab5", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#8b9ab5"; }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(16,185,129,0.35)"
                }}>
                  <Plus style={{ width: 20, height: 20, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
                    {editingCard ? "Chỉnh sửa thẻ Game" : "Đăng bán thẻ Game mới"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                    {editingCard ? `Đang sửa: ${editingCard.title}` : "Nhập thông tin thẻ cào bên dưới"}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveCard} style={{ padding: "20px 24px 24px" }}>

              {/* Thông tin cơ bản */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 1.5, background: "#10b981", borderRadius: 1 }} />
                  Thông tin sản phẩm
                  <div style={{ flex: 1, height: 1.5, background: "rgba(16,185,129,0.15)", borderRadius: 1 }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>📝 Tiêu đề tin thẻ game</label>
                    <input
                      type="text" required
                      value={cardForm.title}
                      onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                      placeholder="Ví dụ: Thẻ Garena 100k sỉ lẻ..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>💰 Giá bán (₫ VND)</label>
                      <input
                        type="number" min="0" required
                        value={cardForm.price}
                        onChange={(e) => setCardForm({ ...cardForm, price: parseInt(e.target.value) || 0 })}
                        placeholder="90000"
                        style={{
                          width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "#e2e8f0", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.12)"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>📊 Trạng thái</label>
                      <select
                        value={cardForm.status}
                        onChange={(e) => setCardForm({ ...cardForm, status: e.target.value as any })}
                        style={{
                          width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "#e2e8f0", outline: "none", cursor: "pointer", boxSizing: "border-box",
                          appearance: "none",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b9ab5' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px"
                        }}
                      >
                        <option value="available" style={{ background: "#10121a" }}>✅ Chưa nạp</option>
                        <option value="sold" style={{ background: "#10121a" }}>🔒 Đã bán</option>
                        <option value="hidden" style={{ background: "#10121a" }}>👁️ Ẩn đi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin bảo mật */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 1.5, background: "#f59e0b", borderRadius: 1 }} />
                  🔐 Mã thẻ (Bảo mật Escrow)
                  <div style={{ flex: 1, height: 1.5, background: "rgba(245,158,11,0.15)", borderRadius: 1 }} />
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#fbbf24", marginBottom: 6 }}>🔢 Serial thẻ</label>
                    <input
                      type="text" required
                      value={cardForm.card_serial}
                      onChange={(e) => setCardForm({ ...cardForm, card_serial: e.target.value })}
                      placeholder="Serial..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontFamily: "monospace",
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                        color: "#fde68a", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.10)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#fbbf24", marginBottom: 6 }}>🔑 Mã PIN nạp</label>
                    <input
                      type="text" required
                      value={cardForm.card_code}
                      onChange={(e) => setCardForm({ ...cardForm, card_code: e.target.value })}
                      placeholder="Mã pin..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontFamily: "monospace",
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                        color: "#fde68a", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.10)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  type="button"
                  onClick={() => setCardModalOpen(false)}
                  style={{
                    padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#8b9ab5", cursor: "pointer", transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#e2e8f0"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8b9ab5"; }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    border: "none", color: "#fff", cursor: "pointer", transition: "all 0.15s",
                    boxShadow: "0 4px 16px rgba(16,185,129,0.35)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(16,185,129,0.5)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,0.35)"}
                >
                  {editingCard ? "💾 Lưu thay đổi" : "🃏 Đăng bán thẻ"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         GAME GIFTCODE DYNAMIC CRUD MODAL DIALOG
      ========================================== */}
      {giftcodeModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: "rgba(5,7,16,0.78)", backdropFilter: "blur(18px)" }}
        >
          <div style={{
            width: "100%", maxWidth: 480, borderRadius: 20,
            background: "linear-gradient(145deg, #13151f 0%, #0e1018 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1) inset",
            position: "relative", overflow: "hidden"
          }}>

            {/* Gradient header */}
            <div style={{
              padding: "22px 24px 18px",
              background: "linear-gradient(135deg, rgba(139,92,246,0.16) 0%, rgba(109,40,217,0.10) 100%)",
              borderBottom: "1px solid rgba(139,92,246,0.15)",
            }}>
              <div style={{
                position: "absolute", top: -30, left: -30, width: 120, height: 120,
                background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
                borderRadius: "50%", pointerEvents: "none"
              }} />
              <button
                onClick={() => setGiftcodeModalOpen(false)}
                style={{
                  position: "absolute", top: 16, right: 16,
                  width: 30, height: 30, borderRadius: 8,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#8b9ab5", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#8b9ab5"; }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(139,92,246,0.35)", fontSize: 20
                }}>🎁</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
                    {editingGiftcode ? "Chỉnh sửa Giftcode" : "Đăng bán Giftcode mới"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                    {editingGiftcode ? `Đang sửa: ${editingGiftcode.title}` : "Nhập thông tin mã giftcode bên dưới"}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveGiftcode} style={{ padding: "20px 24px 24px" }}>

              {/* Thông tin cơ bản */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 1.5, background: "#8b5cf6", borderRadius: 1 }} />
                  Thông tin sản phẩm
                  <div style={{ flex: 1, height: 1.5, background: "rgba(139,92,246,0.15)", borderRadius: 1 }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>📝 Tiêu đề tin giftcode</label>
                    <input
                      type="text" required
                      value={giftcodeForm.title}
                      onChange={(e) => setGiftcodeForm({ ...giftcodeForm, title: e.target.value })}
                      placeholder="Ví dụ: Code VALORANT Champion 2026..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>💰 Giá bán (₫ VND)</label>
                      <input
                        type="number" min="0" required
                        value={giftcodeForm.price}
                        onChange={(e) => setGiftcodeForm({ ...giftcodeForm, price: parseInt(e.target.value) || 0 })}
                        placeholder="250000"
                        style={{
                          width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "#e2e8f0", outline: "none", transition: "all 0.2s", boxSizing: "border-box"
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b9ab5", marginBottom: 6 }}>📊 Trạng thái</label>
                      <select
                        value={giftcodeForm.status}
                        onChange={(e) => setGiftcodeForm({ ...giftcodeForm, status: e.target.value as any })}
                        style={{
                          width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 12,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "#e2e8f0", outline: "none", cursor: "pointer", boxSizing: "border-box",
                          appearance: "none",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b9ab5' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px"
                        }}
                      >
                        <option value="available" style={{ background: "#10121a" }}>✅ Chưa dùng</option>
                        <option value="sold" style={{ background: "#10121a" }}>🔒 Đã bán</option>
                        <option value="hidden" style={{ background: "#10121a" }}>👁️ Ẩn đi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin bảo mật */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 1.5, background: "#f59e0b", borderRadius: 1 }} />
                  🔐 Mã Giftcode (Bảo mật Escrow)
                  <div style={{ flex: 1, height: 1.5, background: "rgba(245,158,11,0.15)", borderRadius: 1 }} />
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#fbbf24", marginBottom: 6 }}>🎟️ Chuỗi mã Giftcode</label>
                  <input
                    type="text" required
                    value={giftcodeForm.giftcode_string}
                    onChange={(e) => setGiftcodeForm({ ...giftcodeForm, giftcode_string: e.target.value })}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontFamily: "monospace",
                      background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                      color: "#fde68a", outline: "none", transition: "all 0.2s", boxSizing: "border-box",
                      letterSpacing: "0.08em"
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.10)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  type="button"
                  onClick={() => setGiftcodeModalOpen(false)}
                  style={{
                    padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#8b9ab5", cursor: "pointer", transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#e2e8f0"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8b9ab5"; }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                    border: "none", color: "#fff", cursor: "pointer", transition: "all 0.15s",
                    boxShadow: "0 4px 16px rgba(139,92,246,0.35)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,92,246,0.5)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,92,246,0.35)"}
                >
                  {editingGiftcode ? "💾 Lưu thay đổi" : "🎁 Đăng bán code"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         ORDER DETAIL & SECURE DELIVERED DATA MODAL
      ========================================== */}
      {orderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg p-6 rounded-2xl border ${theme === "dark" ? "bg-[#161822] border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"} shadow-2xl relative max-h-[85vh] overflow-y-auto`}>
            
            <button
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8b9ab5] hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              Chi tiết Hóa đơn & Bàn giao # {selectedOrder.id}
            </h3>

            <div className="space-y-4 text-xs">
              
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-black/15 border border-white/5">
                <div>
                  <p className="text-[#8b9ab5] font-semibold">Khách hàng</p>
                  <p className="font-bold text-white mt-1">{selectedOrder.buyer_name}</p>
                </div>
                <div>
                  <p className="text-[#8b9ab5] font-semibold">Mã giao dịch</p>
                  <p className="font-bold text-white mt-1 font-mono">{selectedOrder.payment_transaction_id}</p>
                </div>
                <div>
                  <p className="text-[#8b9ab5] font-semibold">Tổng thanh toán</p>
                  <p className="font-bold text-white mt-1">{selectedOrder.total_amount.toLocaleString("vi-VN")}₫</p>
                </div>
                <div>
                  <p className="text-[#8b9ab5] font-semibold">Phương thức</p>
                  <p className="font-bold text-white mt-1 uppercase">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-[#8b9ab5] font-semibold">Ngày tạo</p>
                  <p className="font-bold text-white mt-1">
                    {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-[#8b9ab5] font-semibold">Trạng thái</p>
                  <span className={`inline-block text-[9px] px-2 py-0.5 mt-1 rounded font-bold uppercase ${selectedOrder.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/15" : selectedOrder.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/15" : "bg-red-500/10 text-red-400 border border-red-500/15"}`}>
                    {selectedOrder.status === "completed" ? "Hoàn thành" : selectedOrder.status === "pending" ? "Đang xử lý" : "Thất bại"}
                  </span>
                </div>
              </div>

              {/* Secure Escrow Delivered Data */}
              <div className="space-y-4">
                <h4 className="font-bold text-yellow-400/90 flex items-center gap-1.5 uppercase tracking-wide">
                  <span>🔐</span> Các sản phẩm bàn giao bảo mật (Escrow Payloads)
                </h4>
                
                {selectedOrder.items.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-red-500/10 border border-red-500/15 text-red-400">
                    Chưa có sản phẩm nào thuộc đơn hàng này.
                  </div>
                ) : (
                  selectedOrder.items.map((item, idx) => {
                    let delivered: any = null;
                    if (item.delivered_data) {
                      try {
                        delivered = typeof item.delivered_data === "string" 
                          ? JSON.parse(item.delivered_data)
                          : item.delivered_data;
                      } catch (e) {
                        delivered = { raw: item.delivered_data };
                      }
                    }

                    return (
                      <div key={item.id} className="p-4 rounded-xl bg-[#1d1912] border border-yellow-500/15 text-yellow-100 font-mono space-y-3 shadow-inner">
                        <div className="flex justify-between items-center border-b border-yellow-500/10 pb-2">
                          <div className="max-w-[70%]">
                            <p className="text-white font-bold text-xs truncate">{item.purchasable_title}</p>
                            <p className="text-[10px] text-[#8b9ab5] mt-0.5">Mã SP: #{item.purchasable_id} | Giá: {item.price.toLocaleString("vi-VN")}₫</p>
                          </div>
                          <span className="bg-yellow-500/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-yellow-400 shrink-0">
                            {item.purchasable_type === "App\\Models\\GameAccount" ? "Tài khoản" : item.purchasable_type === "App\\Models\\GameCard" ? "Thẻ Game" : "Giftcode"}
                          </span>
                        </div>

                        {!delivered ? (
                          <div className="text-[11px] text-[#8b9ab5] italic">Chưa có thông tin bàn giao bí mật cho sản phẩm này.</div>
                        ) : (
                          <div className="space-y-2 text-[11px]">
                            {item.purchasable_type === "App\\Models\\GameAccount" && (
                              <>
                                <div>
                                  <span className="text-[#8b9ab5]">Tên đăng nhập:</span>
                                  <p className="text-white font-bold select-all mt-0.5 blur-[1px] hover:blur-none transition-all">{delivered.account_username || "N/A"}</p>
                                </div>
                                <div>
                                  <span className="text-[#8b9ab5]">Mật khẩu bí mật:</span>
                                  <p className="text-white font-bold select-all mt-0.5 blur-[1px] hover:blur-none transition-all">{delivered.account_password || "N/A"}</p>
                                </div>
                              </>
                            )}

                            {item.purchasable_type === "App\\Models\\GameCard" && (
                              <>
                                <div>
                                  <span className="text-[#8b9ab5]">Số Serial thẻ:</span>
                                  <p className="text-white font-bold select-all mt-0.5">{delivered.card_serial || "N/A"}</p>
                                </div>
                                <div>
                                  <span className="text-[#8b9ab5]">Mã cào ẩn:</span>
                                  <p className="text-white font-bold select-all mt-0.5 blur-[1px] hover:blur-none transition-all">{delivered.card_code || "N/A"}</p>
                                </div>
                              </>
                            )}

                            {item.purchasable_type === "App\\Models\\GameGiftcode" && (
                              <>
                                <div>
                                  <span className="text-[#8b9ab5]">Mã Giftcode nhận thưởng:</span>
                                  <p className="text-white font-bold select-all mt-0.5 blur-[1px] hover:blur-none transition-all">{delivered.giftcode_string || "N/A"}</p>
                                </div>
                              </>
                            )}

                            {!delivered.account_username && !delivered.card_serial && !delivered.giftcode_string && delivered.raw && (
                              <div>
                                <span className="text-[#8b9ab5]">Payload raw data:</span>
                                <p className="text-white font-bold select-all mt-0.5">{delivered.raw}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                
                <div className="text-[10px] text-yellow-500/60 leading-normal border-t border-yellow-500/10 pt-2.5 mt-2 flex items-start gap-1">
                  <span>⚠️</span>
                  <span>Mẹo bảo mật: Rê chuột hoặc chạm vào thông tin để hiện rõ mã bí mật bàn giao.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                >
                  Đóng lại
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
      )}
    </>
  );
}
