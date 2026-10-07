"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Gamepad2, BarChart3,
  Sun, Moon, ChevronDown, Plus, Trash2, Edit3,
  Check, X, ShoppingBag,
  Calendar, CalendarDays, UserCheck, UserX,
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye, EyeOff, Copy, ShieldCheck, CreditCard,
  UploadCloud, Loader2, Image as ImageIcon,
  DollarSign, ShoppingCart, CheckCircle2,
  Search, ChevronLeft, ChevronRight, Package, AlertTriangle
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency } from "@/lib/utils";
import apiClient, { getErrorMessage } from "@/lib/api-client";

// ==========================================
// 1. BACKEND-READY INTERFACES (DATABASES SCHEMAS)
// ==========================================
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "buyer";
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
  images?: string[];
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
  images?: string[];
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

const normalizeImages = (imgs: unknown): string[] => {
  if (!imgs) return [];
  if (Array.isArray(imgs)) {
    return imgs.flatMap((item) => {
      if (typeof item === "string") {
        if (item.startsWith("[") || item.startsWith("{")) {
          try {
            const parsed = JSON.parse(item);
            return Array.isArray(parsed) ? parsed : [item];
          } catch {
            return [item];
          }
        }
        return [item];
      }
      return [];
    });
  }
  if (typeof imgs === "string") {
    try {
      const parsed = JSON.parse(imgs);
      return normalizeImages(parsed);
    } catch {
      return imgs.trim() ? [imgs.trim()] : [];
    }
  }
  return [];
};

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
    } else if (loggedInUser.role !== "admin") {
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "giftcodes" || tab === "giftcode") {
        setActiveTab("products");
        setProductSubTab("giftcodes");
      } else if (tab === "cards" || tab === "card") {
        setActiveTab("products");
        setProductSubTab("cards");
      } else if (tab === "accounts" || tab === "account") {
        setActiveTab("products");
        setProductSubTab("accounts");
      } else if (tab === "orders") {
        setActiveTab("orders");
      } else if (tab === "users") {
        setActiveTab("users");
      }
    }
  }, []);

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
  const [showModalPassword, setShowModalPassword] = useState<{ [key: string]: boolean }>({});
  const [copiedModalField, setCopiedModalField] = useState<string | null>(null);

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
      setAccounts(accountsRes.data.map((a: any) => ({ ...a, price: Number(a.price), images: normalizeImages(a.images) })));
      setCards(cardsRes.data.map((c: any) => ({ ...c, price: Number(c.price), images: normalizeImages(c.images) })));
      setGiftcodes(giftcodesRes.data.map((g: any) => ({ ...g, price: Number(g.price), images: normalizeImages(g.images) })));
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

  // Custom Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    itemName?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: "",
    onConfirm: () => {},
  });

  const openConfirmDialog = ({
    title,
    itemName,
    message,
    confirmText = "Xác nhận xóa",
    cancelText = "Hủy bỏ",
    onConfirm,
  }: {
    title: string;
    itemName?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      itemName,
      message,
      confirmText,
      cancelText,
      isLoading: false,
      onConfirm,
    });
  };

  const handleDeleteUser = (id: number, name: string) => {
    openConfirmDialog({
      title: "Xác nhận xóa thành viên",
      itemName: name,
      message: "Bạn có chắc chắn muốn xóa thành viên này khỏi hệ thống?",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/admin/users/${id}`);
          setUsers(prev => prev.filter(u => u.id !== id));
          showToast(`Đã xóa thành viên "${name}"!`, "info");
        } catch (err) {
          showToast("Lỗi khi xóa thành viên!", "error");
        }
      }
    });
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files[]", files[i]);
    }

    try {
      const { data } = await apiClient.post<{ message: string; url: string; urls: string[] }>(
        "/admin/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newUrls = data.urls || (data.url ? [data.url] : []);
      if (newUrls.length > 0) {
        const cur = normalizeImages(accountForm.images);
        setAccountForm(prev => ({ ...prev, images: [...cur, ...newUrls] }));
        showToast(`Đã tải lên ${newUrls.length} ảnh thành công!`, "success");
      }
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      images: normalizeImages(acc.images)
    });
    setImageUrlInput("");
    setAccountModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pendingImages = imageUrlInput ? imageUrlInput.split(",").map(url => url.trim()).filter(Boolean) : [];
      const curImages = normalizeImages(accountForm.images);
      const payload = { ...accountForm, images: [...curImages, ...pendingImages] };

      if (editingAccount) {
        const { data } = await apiClient.put(`/admin/game-accounts/${editingAccount.id}`, payload);
        setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...data, price: Number(data.price), images: normalizeImages(data.images), seller_name: editingAccount.seller_name } : a));
        showToast("Cập nhật tài khoản game thành công!", "success");
      } else {
        const { data } = await apiClient.post("/admin/game-accounts", { ...payload, seller_id: loggedInUser?.id });
        setAccounts(prev => [{ ...data, price: Number(data.price), images: normalizeImages(data.images) }, ...prev]);
        showToast("Đã đăng bán tài khoản mới thành công!", "success");
      }
      setAccountModalOpen(false);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDeleteAccount = (id: number, title: string) => {
    openConfirmDialog({
      title: "Xác nhận xóa tài khoản game",
      itemName: title,
      message: "Bạn có chắc chắn muốn xóa tin đăng bán tài khoản game này không?",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/admin/game-accounts/${id}`);
          setAccounts(prev => prev.filter(a => a.id !== id));
          showToast("Đã xóa tin đăng tài khoản game!", "info");
        } catch (err) {
          showToast("Lỗi khi xóa tin đăng!", "error");
        }
      }
    });
  };

  // Card CRUD states (SQL-Synced: serial, code, images)
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<AdminGameCard | null>(null);
  const [cardForm, setCardForm] = useState<Omit<AdminGameCard, "id" | "created_at" | "seller_id" | "seller_name">>({
    title: "", price: 0, status: "available", description: "", card_serial: "", card_code: "", images: []
  });
  const [cardImageUrlInput, setCardImageUrlInput] = useState("");
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [isCardUploading, setIsCardUploading] = useState(false);

  const handleUploadCardImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsCardUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files[]", files[i]);
    }
    try {
      const { data } = await apiClient.post<{ message: string; url: string; urls: string[] }>(
        "/admin/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const newUrls = data.urls || (data.url ? [data.url] : []);
      if (newUrls.length > 0) {
        const cur = normalizeImages(cardForm.images);
        setCardForm(prev => ({ ...prev, images: [...cur, ...newUrls] }));
        showToast(`Đã tải lên ${newUrls.length} ảnh thành công!`, "success");
      }
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsCardUploading(false);
      if (cardFileInputRef.current) cardFileInputRef.current.value = "";
    }
  };

  const handleOpenAddCard = () => {
    setEditingCard(null);
    setCardForm({ title: "", price: 0, status: "available", description: "", card_serial: "", card_code: "", images: [] });
    setCardImageUrlInput("");
    setCardModalOpen(true);
  };

  const handleOpenEditCard = (card: AdminGameCard) => {
    setEditingCard(card);
    setCardForm({
      title: card.title, price: Number(card.price) || 0, status: card.status,
      description: card.description ?? "", card_serial: card.card_serial, card_code: card.card_code,
      images: normalizeImages(card.images)
    });
    setCardImageUrlInput("");
    setCardModalOpen(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCard) {
        const { data } = await apiClient.put(`/admin/game-cards/${editingCard.id}`, cardForm);
        setCards(prev => prev.map(c => c.id === editingCard.id ? { ...c, ...data, price: Number(data.price), images: normalizeImages(data.images), seller_name: editingCard.seller_name } : c));
        showToast("Cập nhật thẻ game thành công!", "success");
      } else {
        const { data } = await apiClient.post("/admin/game-cards", { ...cardForm, seller_id: loggedInUser?.id });
        setCards(prev => [{ ...data, price: Number(data.price), images: normalizeImages(data.images) }, ...prev]);
        showToast("Đăng bán thẻ game mới thành công!", "success");
      }
      setCardModalOpen(false);
    } catch (err) {
      showToast("Lỗi khi lưu thẻ game!", "error");
    }
  };

  const handleDeleteCard = (id: number, title: string) => {
    openConfirmDialog({
      title: "Xác nhận xóa thẻ game",
      itemName: title,
      message: "Bạn có chắc chắn muốn xóa tin bán thẻ game này không?",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/admin/game-cards/${id}`);
          setCards(prev => prev.filter(c => c.id !== id));
          showToast("Đã xóa tin đăng thẻ game!", "info");
        } catch (err) {
          showToast("Lỗi khi xóa thẻ game!", "error");
        }
      }
    });
  };

  // Giftcode CRUD states (SQL-Synced: giftcode_string, images)
  const [giftcodeModalOpen, setGiftcodeModalOpen] = useState(false);
  const [editingGiftcode, setEditingGiftcode] = useState<AdminGameGiftcode | null>(null);
  const [giftcodeForm, setGiftcodeForm] = useState<Omit<AdminGameGiftcode, "id" | "created_at" | "seller_id" | "seller_name">>({
    title: "", price: 0, status: "available", description: "", giftcode_string: "", images: []
  });
  const [giftcodeImageUrlInput, setGiftcodeImageUrlInput] = useState("");
  const giftcodeFileInputRef = useRef<HTMLInputElement>(null);
  const [isGiftcodeUploading, setIsGiftcodeUploading] = useState(false);

  const handleUploadGiftcodeImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsGiftcodeUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files[]", files[i]);
    }
    try {
      const { data } = await apiClient.post<{ message: string; url: string; urls: string[] }>(
        "/admin/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const newUrls = data.urls || (data.url ? [data.url] : []);
      if (newUrls.length > 0) {
        const cur = normalizeImages(giftcodeForm.images);
        setGiftcodeForm(prev => ({ ...prev, images: [...cur, ...newUrls] }));
        showToast(`Đã tải lên ${newUrls.length} ảnh thành công!`, "success");
      }
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsGiftcodeUploading(false);
      if (giftcodeFileInputRef.current) giftcodeFileInputRef.current.value = "";
    }
  };

  const handleOpenAddGiftcode = () => {
    setEditingGiftcode(null);
    setGiftcodeForm({ title: "", price: 0, status: "available", description: "", giftcode_string: "", images: [] });
    setGiftcodeImageUrlInput("");
    setGiftcodeModalOpen(true);
  };

  const handleOpenEditGiftcode = (gc: AdminGameGiftcode) => {
    setEditingGiftcode(gc);
    setGiftcodeForm({
      title: gc.title, price: Number(gc.price) || 0, status: gc.status,
      description: gc.description ?? "", giftcode_string: gc.giftcode_string,
      images: normalizeImages(gc.images)
    });
    setGiftcodeImageUrlInput("");
    setGiftcodeModalOpen(true);
  };

  const handleSaveGiftcode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGiftcode) {
        const { data } = await apiClient.put(`/admin/game-giftcodes/${editingGiftcode.id}`, giftcodeForm);
        setGiftcodes(prev => prev.map(g => g.id === editingGiftcode.id ? { ...g, ...data, price: Number(data.price), images: normalizeImages(data.images), seller_name: editingGiftcode.seller_name } : g));
        showToast("Cập nhật giftcode thành công!", "success");
      } else {
        const { data } = await apiClient.post("/admin/game-giftcodes", { ...giftcodeForm, seller_id: loggedInUser?.id });
        setGiftcodes(prev => [{ ...data, price: Number(data.price), images: normalizeImages(data.images) }, ...prev]);
        showToast("Đăng bán giftcode mới thành công!", "success");
      }
      setGiftcodeModalOpen(false);
    } catch (err) {
      showToast("Lỗi khi lưu giftcode!", "error");
    }
  };

  const handleDeleteGiftcode = (id: number, title: string) => {
    openConfirmDialog({
      title: "Xác nhận xóa giftcode",
      itemName: title,
      message: "Bạn có chắc chắn muốn xóa tin bán giftcode này không?",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/admin/game-giftcodes/${id}`);
          setGiftcodes(prev => prev.filter(g => g.id !== id));
          showToast("Đã xóa tin đăng giftcode!", "info");
        } catch (err) {
          showToast("Lỗi khi xóa giftcode!", "error");
        }
      }
    });
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
  const [accountSort, setAccountSort] = useState<"newest" | "oldest" | "price_desc" | "price_asc">("newest");
  const [accountPage, setAccountPage] = useState(1);

  const accountKPIs = useMemo(() => {
    const total = accounts.length;
    const available = accounts.filter(a => a.status === "available");
    const sold = accounts.filter(a => a.status === "sold");
    const hidden = accounts.filter(a => a.status === "hidden");
    const availableValue = available.reduce((s, a) => s + (Number(a.price) || 0), 0);
    const soldValue = sold.reduce((s, a) => s + (Number(a.price) || 0), 0);
    const availRate = total > 0 ? Math.round((available.length / total) * 100) : 0;
    return {
      total,
      availableCount: available.length,
      soldCount: sold.length,
      hiddenCount: hidden.length,
      availableValue,
      soldValue,
      availRate
    };
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
      const matchSearch = (a.title || "").toLowerCase().includes(accountSearch.toLowerCase()) ||
                          (a.id || "").toString().includes(accountSearch) ||
                          (a.seller_name || "").toLowerCase().includes(accountSearch.toLowerCase());
      const matchStatus = accountStatusFilter === "all" || a.status === accountStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [accounts, accountSearch, accountStatusFilter]);

  const sortedAccounts = useMemo(() => {
    const list = [...filteredAccounts];
    if (accountSort === "newest") {
      return list.sort((a, b) => b.id - a.id);
    }
    if (accountSort === "oldest") {
      return list.sort((a, b) => a.id - b.id);
    }
    if (accountSort === "price_desc") {
      return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    if (accountSort === "price_asc") {
      return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }
    return list;
  }, [filteredAccounts, accountSort]);

  const ACCOUNTS_PER_PAGE = 8;
  const accountTotalPages = Math.max(1, Math.ceil(sortedAccounts.length / ACCOUNTS_PER_PAGE));
  const pagedAccounts = useMemo(() => {
    const start = (accountPage - 1) * ACCOUNTS_PER_PAGE;
    return sortedAccounts.slice(start, start + ACCOUNTS_PER_PAGE);
  }, [sortedAccounts, accountPage]);

  // Reset page when search or filter changes
  useEffect(() => {
    setAccountPage(1);
  }, [accountSearch, accountStatusFilter, accountSort]);

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

  // Helper tính doanh thu theo loại sản phẩm cho danh sách đơn
  const calculateCategoryRevenue = (orderList: AdminOrder[]) => {
    let accRev = 0;
    let cardRev = 0;
    let gcRev = 0;

    orderList.forEach(o => {
      if (o.status === "completed" && Array.isArray(o.items)) {
        o.items.forEach(item => {
          const type = (item.purchasable_type || "").toLowerCase();
          const p = Number(item.price) || 0;
          if (type.includes("account")) accRev += p;
          else if (type.includes("card")) cardRev += p;
          else if (type.includes("giftcode")) gcRev += p;
          else accRev += p;
        });
      }
    });

    return { accRev, cardRev, gcRev };
  };

  // ==========================================
  // BỘ LỌC CHU KỲ CHO 4 CARD TỔNG QUAN (TUẦN / THÁNG / NĂM)
  // ==========================================
  const [overviewPeriod, setOverviewPeriod] = useState<"week" | "month" | "year">("month");
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>("all");

  const handlePeriodTabChange = (p: "week" | "month" | "year") => {
    setOverviewPeriod(p);
    setSelectedPeriodKey("all");
  };

  // Danh sách các tùy chọn dropdown cho chu kỳ đã chọn
  const periodOptions = useMemo(() => {

    if (overviewPeriod === "week") {
      const weeksMap = new Map<string, { label: string; timeSort: number }>();
      orders.forEach(o => {
        const dStr = (o.created_at || "").toString().replace(" ", "T");
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return;
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(d);
        mon.setDate(diff);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        const monStr = `${String(mon.getDate()).padStart(2, "0")}/${String(mon.getMonth() + 1).padStart(2, "0")}`;
        const sunStr = `${String(sun.getDate()).padStart(2, "0")}/${String(sun.getMonth() + 1).padStart(2, "0")}/${sun.getFullYear()}`;
        const key = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
        weeksMap.set(key, { label: `Tuần ${monStr} - ${sunStr}`, timeSort: mon.getTime() });
      });
      const sortedWeeks = Array.from(weeksMap.entries()).sort((a, b) => b[1].timeSort - a[1].timeSort);
      return [
        { key: "all", label: "Toàn bộ các tuần" },
        ...sortedWeeks.map(([k, v]) => ({ key: k, label: v.label }))
      ];
    }

    if (overviewPeriod === "month") {
      const monthsSet = new Set<string>();
      orders.forEach(o => {
        const dStr = (o.created_at || "").toString().replace(" ", "T");
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          monthsSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        }
      });
      const sortedMonths = Array.from(monthsSet).sort().reverse();
      return [
        { key: "all", label: "Toàn bộ các tháng" },
        ...sortedMonths.map(ms => {
          const [y, m] = ms.split("-");
          return { key: ms, label: `Tháng ${m}/${y}` };
        })
      ];
    }

    // year
    const yearsSet = new Set<string>();
    orders.forEach(o => {
      const dStr = (o.created_at || "").toString().replace(" ", "T");
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        yearsSet.add(d.getFullYear().toString());
      }
    });
    const sortedYears = Array.from(yearsSet).sort().reverse();
    return [
      { key: "all", label: "Toàn bộ các năm" },
      ...sortedYears.map(ys => ({ key: ys, label: `Năm ${ys}` }))
    ];
  }, [overviewPeriod, orders]);

  // Lọc các đơn hàng theo chu kỳ được chọn
  const activePeriodOrders = useMemo(() => {
    if (selectedPeriodKey === "all") {
      return orders;
    }

    return orders.filter(o => {
      const dStr = (o.created_at || "").toString().replace(" ", "T");
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return false;

      if (overviewPeriod === "week") {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(d);
        mon.setDate(diff);
        const key = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
        return key === selectedPeriodKey;
      }

      if (overviewPeriod === "month") {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return key === selectedPeriodKey;
      }

      if (overviewPeriod === "year") {
        return d.getFullYear().toString() === selectedPeriodKey;
      }

      return true;
    });
  }, [orders, overviewPeriod, selectedPeriodKey]);

  const activeCompletedOrders = useMemo(() => {
    return activePeriodOrders.filter(o => o.status === "completed");
  }, [activePeriodOrders]);

  const activeTotalRevenue = useMemo(() => {
    return activeCompletedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [activeCompletedOrders]);

  const activeCategoryRev = useMemo(() => {
    return calculateCategoryRevenue(activePeriodOrders);
  }, [activePeriodOrders]);

  const activeAverageSales = useMemo(() => {
    if (overviewPeriod === "week") {
      return Math.round(activeTotalRevenue / (selectedPeriodKey === "all" ? Math.max(1, (periodOptions.length - 1) * 7) : 7));
    }
    if (overviewPeriod === "month") {
      return Math.round(activeTotalRevenue / (selectedPeriodKey === "all" ? Math.max(1, (periodOptions.length - 1) * 30) : 30));
    }
    return Math.round(activeTotalRevenue / (selectedPeriodKey === "all" ? Math.max(1, (periodOptions.length - 1) * 12) : 12));
  }, [activeTotalRevenue, overviewPeriod, selectedPeriodKey, periodOptions]);

  const activePeriodLabel = useMemo(() => {
    const found = periodOptions.find(p => p.key === selectedPeriodKey);
    if (found && selectedPeriodKey !== "all") return found.label;
    if (overviewPeriod === "week") return "Theo Tuần";
    if (overviewPeriod === "month") return "Theo Tháng";
    return "Theo Năm";
  }, [periodOptions, selectedPeriodKey, overviewPeriod]);

  const activeAccSold = useMemo(() => {
    return activeCompletedOrders.reduce((sum, o) => sum + (o.items || []).filter(i => (i.purchasable_type || "").toLowerCase().includes("account")).length, 0);
  }, [activeCompletedOrders]);

  const activeCardSold = useMemo(() => {
    return activeCompletedOrders.reduce((sum, o) => sum + (o.items || []).filter(i => (i.purchasable_type || "").toLowerCase().includes("card")).length, 0);
  }, [activeCompletedOrders]);

  const statsAvailableAccountsCount = useMemo(() => {
    return accounts.filter(a => a.status === "available").length;
  }, [accounts]);

  const statsAvailableCardsCount = useMemo(() => {
    return cards.filter(c => c.status === "available").length;
  }, [cards]);

  const activeAccPercentage = useMemo(() => {
    const total = activeAccSold + statsAvailableAccountsCount;
    return total > 0 ? Math.round((activeAccSold / total) * 100) : 0;
  }, [activeAccSold, statsAvailableAccountsCount]);

  const activeCardPercentage = useMemo(() => {
    const total = activeCardSold + statsAvailableCardsCount;
    return total > 0 ? Math.round((activeCardSold / total) * 100) : 0;
  }, [activeCardSold, statsAvailableCardsCount]);

  // ==========================================
  // PHÂN LOẠI THỐNG KÊ THEO TUẦN, THÁNG, NĂM
  // ==========================================

  // 1. Dữ liệu theo tuần
  const weeklyStatsData = useMemo(() => {
    const weeksMap: { [key: string]: { label: string; orders: AdminOrder[]; timeSort: number } } = {};

    orders.forEach(o => {
      const rawDate = (o.created_at || "").toString().replace(" ", "T");
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;

      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const mStr = `${monday.getDate().toString().padStart(2, '0')}/${(monday.getMonth() + 1).toString().padStart(2, '0')}`;
      const sStr = `${sunday.getDate().toString().padStart(2, '0')}/${(sunday.getMonth() + 1).toString().padStart(2, '0')}/${sunday.getFullYear()}`;

      const firstDayOfYear = new Date(monday.getFullYear(), 0, 1);
      const pastDaysOfYear = (monday.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

      const key = `${monday.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
      const label = `Tuần ${weekNum} (${mStr} - ${sStr})`;

      if (!weeksMap[key]) {
        weeksMap[key] = { label, orders: [], timeSort: monday.getTime() };
      }
      weeksMap[key].orders.push(o);
    });

    return Object.keys(weeksMap).map(key => {
      const { label, orders: oList, timeSort } = weeksMap[key];
      const totalOrders = oList.length;
      const completedOrders = oList.filter(o => o.status === "completed").length;
      const pendingOrders = oList.filter(o => o.status === "pending").length;
      const failedOrders = oList.filter(o => o.status === "failed").length;
      const totalRev = oList.filter(o => o.status === "completed").reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const { accRev, cardRev, gcRev } = calculateCategoryRevenue(oList);
      const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
      const avgOrder = completedOrders > 0 ? Math.round(totalRev / completedOrders) : 0;

      return {
        key,
        timeSort,
        period: label,
        totalOrders,
        completedOrders,
        pendingOrders,
        failedOrders,
        accRev,
        cardRev,
        gcRev,
        totalRev,
        avgOrder,
        successRate,
        statusBadge: successRate >= 60 ? "Tăng trưởng tốt" : successRate >= 30 ? "Đang xử lý" : "Cần theo dõi"
      };
    }).sort((a, b) => b.timeSort - a.timeSort);
  }, [orders]);

  // 2. Dữ liệu theo tháng
  const monthlyStatsData = useMemo(() => {
    const monthsMap: { [key: string]: { label: string; orders: AdminOrder[]; year: number; month: number } } = {};

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const curKey = `${curYear}-${curMonth.toString().padStart(2, '0')}`;
    monthsMap[curKey] = { label: `Tháng ${curMonth.toString().padStart(2, '0')}/${curYear}`, orders: [], year: curYear, month: curMonth };

    orders.forEach(o => {
      const rawDate = (o.created_at || "").toString().replace(" ", "T");
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;
      const yr = d.getFullYear();
      const mo = d.getMonth() + 1;
      const key = `${yr}-${mo.toString().padStart(2, '0')}`;
      if (!monthsMap[key]) {
        monthsMap[key] = { label: `Tháng ${mo.toString().padStart(2, '0')}/${yr}`, orders: [], year: yr, month: mo };
      }
      monthsMap[key].orders.push(o);
    });

    const sortedKeys = Object.keys(monthsMap).sort((a, b) => b.localeCompare(a));

    return sortedKeys.map(key => {
      const { label, orders: oList } = monthsMap[key];
      const totalOrders = oList.length;
      const completedOrders = oList.filter(o => o.status === "completed").length;
      const pendingOrders = oList.filter(o => o.status === "pending").length;
      const failedOrders = oList.filter(o => o.status === "failed").length;
      const totalRev = oList.filter(o => o.status === "completed").reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const { accRev, cardRev, gcRev } = calculateCategoryRevenue(oList);
      const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
      const avgOrder = completedOrders > 0 ? Math.round(totalRev / completedOrders) : 0;

      return {
        key,
        period: label,
        totalOrders,
        completedOrders,
        pendingOrders,
        failedOrders,
        accRev,
        cardRev,
        gcRev,
        totalRev,
        avgOrder,
        successRate,
        statusBadge: completedOrders > 3 ? "Doanh số cao" : completedOrders > 0 ? "Ổn định" : "Chưa phát sinh"
      };
    });
  }, [orders]);

  // 3. Dữ liệu theo năm
  const yearlyStatsData = useMemo(() => {
    const yearsMap: { [key: string]: { label: string; orders: AdminOrder[]; yr: number } } = {};

    const now = new Date();
    const curYr = now.getFullYear();
    yearsMap[curYr.toString()] = { label: `Năm ${curYr}`, orders: [], yr: curYr };

    orders.forEach(o => {
      const rawDate = (o.created_at || "").toString().replace(" ", "T");
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;
      const yr = d.getFullYear();
      const yrStr = yr.toString();
      if (!yearsMap[yrStr]) {
        yearsMap[yrStr] = { label: `Năm ${yr}`, orders: [], yr };
      }
      yearsMap[yrStr].orders.push(o);
    });

    return Object.keys(yearsMap).sort((a, b) => b.localeCompare(a)).map(key => {
      const { label, orders: oList } = yearsMap[key];
      const totalOrders = oList.length;
      const completedOrders = oList.filter(o => o.status === "completed").length;
      const pendingOrders = oList.filter(o => o.status === "pending").length;
      const failedOrders = oList.filter(o => o.status === "failed").length;
      const totalRev = oList.filter(o => o.status === "completed").reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const { accRev, cardRev, gcRev } = calculateCategoryRevenue(oList);
      const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
      const avgOrder = completedOrders > 0 ? Math.round(totalRev / completedOrders) : 0;

      return {
        key,
        period: label,
        totalOrders,
        completedOrders,
        pendingOrders,
        failedOrders,
        accRev,
        cardRev,
        gcRev,
        totalRev,
        avgOrder,
        successRate,
        statusBadge: completedOrders > 0 ? "Vượt chỉ tiêu kế hoạch" : "Dự toán tài chính"
      };
    });
  }, [orders]);

  // Dữ liệu bảng hiện tại và tổng cộng
  const currentPeriodData = useMemo(() => {
    if (overviewPeriod === "week") return weeklyStatsData;
    if (overviewPeriod === "year") return yearlyStatsData;
    return monthlyStatsData;
  }, [overviewPeriod, weeklyStatsData, monthlyStatsData, yearlyStatsData]);

  const currentPeriodTotals = useMemo(() => {
    const totalOrders = currentPeriodData.reduce((s, r) => s + r.totalOrders, 0);
    const completedOrders = currentPeriodData.reduce((s, r) => s + r.completedOrders, 0);
    const accRev = currentPeriodData.reduce((s, r) => s + r.accRev, 0);
    const cardRev = currentPeriodData.reduce((s, r) => s + r.cardRev, 0);
    const gcRev = currentPeriodData.reduce((s, r) => s + r.gcRev, 0);
    const totalRev = currentPeriodData.reduce((s, r) => s + r.totalRev, 0);
    const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const avgOrder = completedOrders > 0 ? Math.round(totalRev / completedOrders) : 0;

    return { totalOrders, completedOrders, accRev, cardRev, gcRev, totalRev, successRate, avgOrder };
  }, [currentPeriodData]);

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
        .dash { display: flex; height: 100vh; min-height: 640px; background: #0f1117; color: #e2e8f0; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; }
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
        .card { background: #1a1d27; border: 0.5px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; flex-shrink: 0; }
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
        .tbl th { font-size: 11px; color: #94a3b8; text-align: left; padding: 0 8px 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .tbl td { font-size: 12px; padding: 10px 8px; border-top: 0.5px solid rgba(255,255,255,0.05); vertical-align: middle; color: #718096; }
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
        .cc-sel { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;border:none;appearance:none; }
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
          <i className="ti ti-layout-dashboard"></i> Thống kê
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
              <div className="page-title">Thống kê tổng quan</div>
              <div className="page-sub">Trang chủ - Thống kê</div>
            </div>
          ) : (
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
              Quản lý &rsaquo; <span style={{ color: theme === "dark" ? "#f1f5f9" : "#0f172a" }}>{activeTab === "users" ? "Người dùng" : activeTab === "products" ? (productSubTab === "accounts" ? "Tài khoản Game" : productSubTab === "cards" ? "Thẻ cào Game" : "Gift Code") : "Đơn hàng"}</span>
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
            {/* Bộ điều khiển chọn chu kỳ thống kê cho 6 Card tổng quan */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              padding: "10px 16px",
              background: theme === "dark" ? "#1a1d27" : "#ffffff",
              border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              borderRadius: "12px",
              marginBottom: "2px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{
                  fontSize: "12px",
                  fontWeight: 750,
                  color: theme === "dark" ? "#94a3b8" : "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <i className="ti ti-calendar-time" style={{ fontSize: "16px", color: "var(--primary)" }}></i>
                  Chu kỳ xem:
                </span>

                <div style={{
                  display: "inline-flex",
                  background: theme === "dark" ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                  padding: "3px",
                  borderRadius: "9px",
                  border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0"
                }}>
                  <button
                    onClick={() => handlePeriodTabChange("week")}
                    style={{
                      padding: "6px 14px", borderRadius: "7px", border: "none",
                      background: overviewPeriod === "week" ? "#6366f1" : "transparent",
                      color: overviewPeriod === "week" ? "#fff" : theme === "dark" ? "#94a3b8" : "#64748b",
                      fontSize: "12px", fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                      transition: "all 0.15s",
                      boxShadow: overviewPeriod === "week" ? "0 2px 8px rgba(99, 102, 241, 0.4)" : "none"
                    }}
                  >
                    <Calendar size={14} /> Theo Tuần
                  </button>
                  <button
                    onClick={() => handlePeriodTabChange("month")}
                    style={{
                      padding: "6px 14px", borderRadius: "7px", border: "none",
                      background: overviewPeriod === "month" ? "#6366f1" : "transparent",
                      color: overviewPeriod === "month" ? "#fff" : theme === "dark" ? "#94a3b8" : "#64748b",
                      fontSize: "12px", fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                      transition: "all 0.15s",
                      boxShadow: overviewPeriod === "month" ? "0 2px 8px rgba(99, 102, 241, 0.4)" : "none"
                    }}
                  >
                    <BarChart3 size={14} /> Theo Tháng
                  </button>
                  <button
                    onClick={() => handlePeriodTabChange("year")}
                    style={{
                      padding: "6px 14px", borderRadius: "7px", border: "none",
                      background: overviewPeriod === "year" ? "#6366f1" : "transparent",
                      color: overviewPeriod === "year" ? "#fff" : theme === "dark" ? "#94a3b8" : "#64748b",
                      fontSize: "12px", fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                      transition: "all 0.15s",
                      boxShadow: overviewPeriod === "year" ? "0 2px 8px rgba(99, 102, 241, 0.4)" : "none"
                    }}
                  >
                    <LayoutDashboard size={14} /> Theo Năm
                  </button>
                </div>
              </div>

              {/* Chi tiết khoảng thời gian */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                  Mốc cụ thể:
                </span>
                <select
                  value={selectedPeriodKey}
                  onChange={(e) => setSelectedPeriodKey(e.target.value)}
                  style={{
                    background: theme === "dark" ? "#13151c" : "#f8fafc",
                    border: theme === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                    color: theme === "dark" ? "#e2e8f0" : "#1e293b",
                    padding: "5px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 650,
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  {periodOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4 Balanced KPI Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px",
              marginBottom: "14px"
            }}>
              {/* Card 1: Doanh thu */}
              <div className="card stat-card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="stat-label">Doanh thu ({activePeriodLabel})</div>
                    <div className="stat-val" style={{ fontSize: "22px", fontWeight: 800, color: "#818cf8", marginTop: "2px" }}>
                      <span className="curr">₫</span>
                      {(activeTotalRevenue || 0).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(99, 102, 241, 0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#818cf8"
                  }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: "6px", background: "rgba(192, 132, 252, 0.15)", color: "#c084fc", fontWeight: 650 }}>
                    TK: {Math.round((activeCategoryRev.accRev || 0) / 1000).toLocaleString("vi-VN")}k
                  </span>
                  <span style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: "6px", background: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", fontWeight: 650 }}>
                    Thẻ: {Math.round((activeCategoryRev.cardRev || 0) / 1000).toLocaleString("vi-VN")}k
                  </span>
                  <span style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: "6px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 650 }}>
                    Giftcode: {Math.round((activeCategoryRev.gcRev || 0) / 1000).toLocaleString("vi-VN")}k
                  </span>
                </div>
              </div>

              {/* Card 2: Đơn hàng & Tỷ lệ đạt */}
              <div className="card stat-card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="stat-label">Đơn hàng ({activePeriodLabel})</div>
                    <div className="stat-val" style={{ fontSize: "22px", fontWeight: 800, color: "#34d399", marginTop: "2px" }}>
                      {activePeriodOrders.length} <span style={{ fontSize: "13px", color: theme === "dark" ? "#64748b" : "#94a3b8", fontWeight: 600 }}>đơn</span>
                    </div>
                  </div>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#34d399"
                  }}>
                    <ShoppingCart size={18} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                  <span style={{ fontSize: "11.5px", color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                    Hoàn tất: <b style={{ color: "#10b981" }}>{activeCompletedOrders.length}</b> đơn
                  </span>
                  <span className="badge-up" style={{ margin: 0 }}>
                    {activePeriodOrders.length > 0 ? `${Math.round((activeCompletedOrders.length / activePeriodOrders.length) * 100)}% đạt` : "0%"}
                  </span>
                </div>
              </div>

              {/* Card Kho hàng & Bán ra */}
              <div className="card stat-card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="stat-label">Sản phẩm tồn kho</div>
                    <div className="stat-val" style={{ fontSize: "22px", fontWeight: 800, color: "#38bdf8", marginTop: "2px" }}>
                      {statsAvailableAccountsCount + statsAvailableCardsCount} <span style={{ fontSize: "13px", color: theme === "dark" ? "#64748b" : "#94a3b8", fontWeight: 600 }}>sản phẩm</span>
                    </div>
                  </div>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(56, 189, 248, 0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#38bdf8"
                  }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                  <span style={{ fontSize: "11.5px", color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                    Đã bán ({activePeriodLabel}):
                  </span>
                  <span style={{ fontSize: "11.5px", fontWeight: 750, color: "#818cf8" }}>
                    {activeAccSold} TK • {activeCardSold} Thẻ
                  </span>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* BẢNG PHÂN LOẠI THỐNG KÊ DOANH THU & ĐƠN HÀNG (TUẦN / THÁNG / NĂM) */}
            {/* ============================================================== */}
            <div className="card" style={{ marginBottom: "24px", padding: "20px" }}>
              {/* Header: Title + Period Tabs + Export */}
              <div className="card-hdr" style={{ marginBottom: "16px", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.25))",
                      border: "1px solid rgba(99, 102, 241, 0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#818cf8"
                    }}>
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <div className="card-title" style={{ fontSize: "16px", fontWeight: 800 }}>
                          Bảng Thống Kê Phân Loại Theo Chu Kỳ
                        </div>
                        <span style={{
                          fontSize: "11.5px",
                          padding: "2px 8px",
                          borderRadius: "14px",
                          background: "rgba(99, 102, 241, 0.15)",
                          color: "#818cf8",
                          fontWeight: 700,
                          border: "1px solid rgba(99, 102, 241, 0.25)"
                        }}>
                          {overviewPeriod === "week" ? "Theo Tuần" : overviewPeriod === "month" ? "Theo Tháng" : "Theo Năm"}
                        </span>
                      </div>
                      <div className="card-sub" style={{ marginTop: "2px" }}>
                        Báo cáo chi tiết số lượng đơn hàng và doanh thu theo Tài khoản, Thẻ cào, Giftcode
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table: Hero Periodic Report */}
              <div
                id="periodic-table-wrapper"
                style={{
                  width: "100%",
                  overflowX: "auto",
                  border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: theme === "dark" ? "#151823" : "#ffffff",
                  display: "block"
                }}
              >
                <table id="periodic-stats-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "820px" }}>
                  <thead>
                    <tr style={{
                      background: theme === "dark" ? "#1c1f2e" : "#f1f5f9",
                      borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0"
                    }}>
                      <th style={{ padding: "12px 14px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", width: "23%" }}>
                        {overviewPeriod === "week" ? "Tuần / Khoảng Ngày" : overviewPeriod === "month" ? "Tháng / Năm" : "Năm Tài Chính"}
                      </th>
                      <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", width: "9%" }}>
                        Tổng Đơn
                      </th>
                      <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", width: "10%" }}>
                        Hoàn Tất
                      </th>
                      <th style={{ padding: "12px 12px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right", width: "14%" }}>
                        DT Tài Khoản
                      </th>
                      <th style={{ padding: "12px 12px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right", width: "14%" }}>
                        DT Thẻ Cào
                      </th>
                      <th style={{ padding: "12px 12px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right", width: "13%" }}>
                        DT Giftcode
                      </th>
                      <th style={{ padding: "12px 14px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right", width: "17%" }}>
                        Tổng Doanh Thu
                      </th>
                      <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", width: "10%" }}>
                        Tỷ Lệ Đạt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPeriodData.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "36px 20px", color: "#94a3b8", fontSize: "13px" }}>
                          Không có dữ liệu giao dịch trong chu kỳ này.
                        </td>
                      </tr>
                    ) : (
                      currentPeriodData.map((row) => (
                        <tr
                          key={row.key}
                          style={{
                            borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.04)" : "1px solid #f1f5f9",
                            transition: "background 0.12s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = theme === "dark" ? "rgba(255,255,255,0.03)" : "#f8fafc"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: "13px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{
                                width: "8px", height: "8px", borderRadius: "50%",
                                background: row.totalRev > 0 ? "#10b981" : "#94a3b8",
                                flexShrink: 0
                              }} />
                              <span style={{ color: theme === "dark" ? "#e2e8f0" : "#1e293b" }}>{row.period}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "center", fontWeight: 650, color: theme === "dark" ? "#cbd5e1" : "#334155", fontSize: "13px" }}>
                            {row.totalOrders}
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "center" }}>
                            <span style={{
                              padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700,
                              background: row.completedOrders > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.15)",
                              color: row.completedOrders > 0 ? "#10b981" : "#94a3b8"
                            }}>
                              {row.completedOrders}
                            </span>
                          </td>
                          <td style={{ padding: "12px 12px", textAlign: "right", color: theme === "dark" ? "#c084fc" : "#7c3aed", fontWeight: 600, fontSize: "13px" }}>
                            {(row.accRev || 0).toLocaleString("vi-VN")}₫
                          </td>
                          <td style={{ padding: "12px 12px", textAlign: "right", color: theme === "dark" ? "#fbbf24" : "#d97706", fontWeight: 600, fontSize: "13px" }}>
                            {(row.cardRev || 0).toLocaleString("vi-VN")}₫
                          </td>
                          <td style={{ padding: "12px 12px", textAlign: "right", color: theme === "dark" ? "#38bdf8" : "#0284c7", fontWeight: 600, fontSize: "13px" }}>
                            {(row.gcRev || 0).toLocaleString("vi-VN")}₫
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 850, color: "#818cf8", fontSize: "14px" }}>
                            {(row.totalRev || 0).toLocaleString("vi-VN")}₫
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "center" }}>
                            <span className={`ltbs ${row.successRate >= 50 ? "ltbs-done" : row.totalOrders === 0 ? "ltbs-hidden" : "ltbs-pending"}`} style={{ fontSize: "11px", padding: "3px 8px" }}>
                              {row.successRate}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{
                      fontWeight: 800,
                      background: theme === "dark" ? "rgba(99, 102, 241, 0.08)" : "#f8fafc",
                      borderTop: "2px solid rgba(99, 102, 241, 0.35)"
                    }}>
                      <td style={{ padding: "13px 14px", color: "var(--primary)", fontWeight: 900, fontSize: "13px" }}>
                        TỔNG CỘNG ({currentPeriodData.length} chu kỳ)
                      </td>
                      <td style={{ textAlign: "center", padding: "13px 10px", color: theme === "dark" ? "#e2e8f0" : "#1e293b", fontSize: "13.5px" }}>
                        {currentPeriodTotals.totalOrders || 0}
                      </td>
                      <td style={{ textAlign: "center", padding: "13px 10px", color: "#10b981", fontSize: "13.5px" }}>
                        {currentPeriodTotals.completedOrders || 0}
                      </td>
                      <td style={{ textAlign: "right", padding: "13px 12px", color: theme === "dark" ? "#c084fc" : "#7c3aed", fontSize: "13.5px" }}>
                        {(currentPeriodTotals.accRev || 0).toLocaleString("vi-VN")}₫
                      </td>
                      <td style={{ textAlign: "right", padding: "13px 12px", color: theme === "dark" ? "#fbbf24" : "#d97706", fontSize: "13.5px" }}>
                        {(currentPeriodTotals.cardRev || 0).toLocaleString("vi-VN")}₫
                      </td>
                      <td style={{ textAlign: "right", padding: "13px 12px", color: theme === "dark" ? "#38bdf8" : "#0284c7", fontSize: "13.5px" }}>
                        {(currentPeriodTotals.gcRev || 0).toLocaleString("vi-VN")}₫
                      </td>
                      <td style={{ textAlign: "right", padding: "13px 14px", color: "var(--primary)", fontSize: "15px", fontWeight: 900 }}>
                        {(currentPeriodTotals.totalRev || 0).toLocaleString("vi-VN")}₫
                      </td>
                      <td style={{ textAlign: "center", padding: "13px 10px" }}>
                        <span className="ltbs ltbs-done" style={{ fontWeight: 800, fontSize: "11px", padding: "3px 8px" }}>
                          {currentPeriodTotals.successRate || 0}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* BẢNG ĐƠN HÀNG GẦN ĐÂY */}
            {/* BẢNG ĐƠN HÀNG ĐÃ BÁN GẦN ĐÂY */}
            <div className="card">
              <div className="card-hdr" style={{ marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div className="card-title" style={{ fontSize: "15px", fontWeight: 700 }}>
                    Đơn hàng đã bán gần đây
                  </div>
                  <div className="card-sub" style={{ marginTop: "2px" }}>
                    Danh sách các sản phẩm và đơn hàng đã bán thành công trên hệ thống
                  </div>
                </div>
                <div className="more-btn" onClick={() => showToast("Đang tải danh sách đơn hàng đã bán mới nhất...", "info")}>
                  <i className="ti ti-dots"></i>
                </div>
              </div>
              
              <div className="tabs">
                <div 
                  onClick={() => setRecentProductTab("accounts")}
                  className={`tab ${recentProductTab === "accounts" ? "active" : ""}`}
                >
                  <i className="ti ti-user-circle"></i> Tài khoản
                  <span style={{
                    fontSize: "10px", padding: "1px 6px", borderRadius: "10px",
                    background: recentProductTab === "accounts" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                    fontWeight: 700, marginLeft: "2px"
                  }}>
                    {accounts.filter(a => a.status === "sold").length}
                  </span>
                </div>
                <div 
                  onClick={() => setRecentProductTab("cards")}
                  className={`tab ${recentProductTab === "cards" ? "active" : ""}`}
                >
                  <i className="ti ti-cards"></i> Thẻ cào
                  <span style={{
                    fontSize: "10px", padding: "1px 6px", borderRadius: "10px",
                    background: recentProductTab === "cards" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                    fontWeight: 700, marginLeft: "2px"
                  }}>
                    {cards.filter(c => c.status === "sold").length}
                  </span>
                </div>
                <div 
                  onClick={() => setRecentProductTab("giftcodes")}
                  className={`tab ${recentProductTab === "giftcodes" ? "active" : ""}`}
                >
                  <i className="ti ti-gift"></i> Gift code
                  <span style={{
                    fontSize: "10px", padding: "1px 6px", borderRadius: "10px",
                    background: recentProductTab === "giftcodes" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                    fontWeight: 700, marginLeft: "2px"
                  }}>
                    {giftcodes.filter(g => g.status === "sold").length}
                  </span>
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
                    {recentProductTab === "accounts" && (() => {
                      const soldAccounts = accounts.filter(acc => acc.status === "sold");
                      return soldAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "28px 16px", color: "#94a3b8" }}>
                            Chưa có đơn hàng tài khoản game nào đã bán gần đây.
                          </td>
                        </tr>
                      ) : (
                        soldAccounts.slice(0, 8).map(acc => (
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
                            <td style={{ fontWeight: 650, color: "#818cf8" }}>{acc.price.toLocaleString("vi-VN")}₫</td>
                            <td style={{ textAlign: "right" }}>
                              <span className="status-pill s-sold">
                                Đã bán
                              </span>
                            </td>
                          </tr>
                        ))
                      );
                    })()}

                    {recentProductTab === "cards" && (() => {
                      const soldCards = cards.filter(card => card.status === "sold");
                      return soldCards.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "28px 16px", color: "#94a3b8" }}>
                            Chưa có đơn hàng thẻ game nào đã bán gần đây.
                          </td>
                        </tr>
                      ) : (
                        soldCards.slice(0, 8).map(card => (
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
                            <td style={{ fontWeight: 650, color: "#fbbf24" }}>{card.price.toLocaleString("vi-VN")}₫</td>
                            <td style={{ textAlign: "right" }}>
                              <span className="status-pill s-sold">
                                Đã bán
                              </span>
                            </td>
                          </tr>
                        ))
                      );
                    })()}

                    {recentProductTab === "giftcodes" && (() => {
                      const soldGiftcodes = giftcodes.filter(gc => gc.status === "sold");
                      return soldGiftcodes.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "28px 16px", color: "#94a3b8" }}>
                            Chưa có đơn hàng giftcode nào đã bán gần đây.
                          </td>
                        </tr>
                      ) : (
                        soldGiftcodes.slice(0, 8).map(gc => (
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
                            <td style={{ fontWeight: 650, color: "#38bdf8" }}>{gc.price.toLocaleString("vi-VN")}₫</td>
                            <td style={{ textAlign: "right" }}>
                              <span className="status-pill s-sold">
                                Đã bán
                              </span>
                            </td>
                          </tr>
                        ))
                      );
                    })()}
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
                  <b>Vai trò:</b>&nbsp;<em>{userRoleFilter === "all" ? "Tất cả" : userRoleFilter === "admin" ? "Admin" : "Buyer"}</em>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                  <select className="cc-sel" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="buyer">Buyer</option>
                  </select>
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
                              <div className="lt-av" style={{ background: user.role === "admin" ? "#fee2e2" : "#dcfce7", color: user.role === "admin" ? "#dc2626" : "#16a34a" }}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                                <div style={{ fontSize: 11, color: "#9ca3af" }}>{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`ltrb ${user.role === "admin" ? "ltrb-admin" : "ltrb-buyer"}`}>
                              {user.role === "admin" ? "Admin" : "Buyer"}
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
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "4px"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))",
                      border: "1px solid rgba(99, 102, 241, 0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#818cf8"
                    }}>
                      {productSubTab === "accounts" ? <Gamepad2 size={22} /> : productSubTab === "cards" ? <CreditCard size={22} /> : <Package size={22} />}
                    </div>
                    <div>
                      <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>
                        {productSubTab === "accounts" ? "Quản Lý Tài Khoản Game" : productSubTab === "cards" ? "Quản Lý Thẻ Cào Game" : "Quản Lý Gift Code"}
                      </h1>
                      <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                        {productSubTab === "accounts" ? "Đăng bán, kiểm duyệt thông tin và quản lý kho tài khoản game trên hệ thống" : productSubTab === "cards" ? "Quản lý danh sách mã thẻ cào nạp game đang bán" : "Quản lý và kiểm duyệt các mã Giftcode nạp thưởng"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  {productSubTab === "accounts" && (
                    <button
                      onClick={handleOpenAddAccount}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <Plus size={16} /> Đăng tài khoản mới
                    </button>
                  )}
                  {productSubTab === "cards" && (
                    <button
                      onClick={handleOpenAddCard}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)"
                      }}
                    >
                      <Plus size={16} /> Đăng thẻ game mới
                    </button>
                  )}
                  {productSubTab === "giftcodes" && (
                    <button
                      onClick={handleOpenAddGiftcode}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(168, 85, 247, 0.35)"
                      }}
                    >
                      <Plus size={16} /> Đăng giftcode mới
                    </button>
                  )}
                </div>
              </div>

              {/* SUB-TAB 1: GAME ACCOUNTS */}
              {productSubTab === "accounts" && (
                <>
                  {/* Main Table Card */}
                  <div className="card" style={{ padding: "18px 20px" }}>
                    {/* Search & Filter Toolbar */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "16px"
                    }}>
                      {/* Left: Search box */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: theme === "dark" ? "rgba(255,255,255,0.06)" : "#f8fafc",
                        border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                        borderRadius: "10px",
                        padding: "7px 12px",
                        minWidth: "320px",
                        flex: "1 1 320px",
                        maxWidth: "460px"
                      }}>
                        <Search size={16} style={{ color: theme === "dark" ? "#94a3b8" : "#64748b", flexShrink: 0 }} />
                        <input
                          type="text"
                          value={accountSearch}
                          onChange={e => setAccountSearch(e.target.value)}
                          placeholder="Tìm theo tên game, mã #ID, người bán..."
                          style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: theme === "dark" ? "#e2e8f0" : "#1e293b",
                            fontSize: "13px",
                            width: "100%"
                          }}
                        />
                        {accountSearch && (
                          <button
                            onClick={() => setAccountSearch("")}
                            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Right: Filters & Count */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        {/* Filter Status */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "12px", color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                            Trạng thái:
                          </span>
                          <select
                            value={accountStatusFilter}
                            onChange={e => setAccountStatusFilter(e.target.value)}
                            style={{
                              background: theme === "dark" ? "#1a1d2d" : "#ffffff",
                              border: theme === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                              color: theme === "dark" ? "#e2e8f0" : "#1e293b",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              outline: "none",
                              cursor: "pointer"
                            }}
                          >
                            <option value="all">Tất cả ({accounts.length})</option>
                            <option value="available">Còn hàng ({accountKPIs.availableCount})</option>
                            <option value="sold">Đã bán ({accountKPIs.soldCount})</option>
                            <option value="hidden">Đã ẩn ({accountKPIs.hiddenCount})</option>
                          </select>
                        </div>

                        {/* Sort Order */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "12px", color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                            Sắp xếp:
                          </span>
                          <select
                            value={accountSort}
                            onChange={e => setAccountSort(e.target.value as any)}
                            style={{
                              background: theme === "dark" ? "#1a1d2d" : "#ffffff",
                              border: theme === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                              color: theme === "dark" ? "#e2e8f0" : "#1e293b",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              outline: "none",
                              cursor: "pointer"
                            }}
                          >
                            <option value="newest">Mới nhất trước</option>
                            <option value="oldest">Cũ nhất trước</option>
                            <option value="price_desc">Giá cao đến thấp</option>
                            <option value="price_asc">Giá thấp đến cao</option>
                          </select>
                        </div>

                        {/* Result Count Badge */}
                        <span style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: "5px 12px",
                          borderRadius: "20px",
                          background: theme === "dark" ? "rgba(99, 102, 241, 0.12)" : "#e0e7ff",
                          color: "#818cf8",
                          border: "1px solid rgba(99, 102, 241, 0.25)"
                        }}>
                          {sortedAccounts.length} tài khoản
                        </span>
                      </div>
                    </div>

                    {/* Modern Accounts Table */}
                    <div style={{
                      width: "100%",
                      overflowX: "auto",
                      border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                      borderRadius: "10px",
                      background: theme === "dark" ? "#151823" : "#ffffff"
                    }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "850px" }}>
                        <thead>
                          <tr style={{
                            background: theme === "dark" ? "#1c1f2e" : "#f1f5f9",
                            borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0"
                          }}>
                            <th style={{ padding: "12px 14px", width: "40px" }}>
                              <input type="checkbox" style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#6366f1" }} />
                            </th>
                            <th style={{ padding: "12px 14px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", width: "36%" }}>
                              Thông tin Tài khoản & Game
                            </th>
                            <th style={{ padding: "12px 14px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", width: "22%" }}>
                              Mô tả tóm tắt
                            </th>
                            <th style={{ padding: "12px 14px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", width: "12%" }}>
                              Người bán
                            </th>
                            <th style={{ padding: "12px 14px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right", width: "14%" }}>
                              Giá tiền
                            </th>
                            <th style={{ padding: "12px 14px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", width: "12%" }}>
                              Trạng thái
                            </th>
                            <th style={{ padding: "12px 14px", fontSize: "11.5px", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", width: "10%" }}>
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedAccounts.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                  <Package size={36} style={{ color: "#64748b" }} />
                                  <span style={{ fontSize: "14px", fontWeight: 600 }}>Không tìm thấy tài khoản game nào phù hợp.</span>
                                  <span style={{ fontSize: "12px", color: "#64748b" }}>Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</span>
                                </div>
                              </td>
                            </tr>
                          ) : pagedAccounts.map(acc => {
                            const imgs = normalizeImages(acc.images);
                            return (
                              <tr
                                key={acc.id}
                                style={{
                                  borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.05)" : "1px solid #f1f5f9",
                                  transition: "background 0.15s"
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = theme === "dark" ? "rgba(255,255,255,0.03)" : "#f8fafc")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              >
                                <td style={{ padding: "14px" }}>
                                  <input type="checkbox" style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#6366f1" }} />
                                </td>
                                <td style={{ padding: "14px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    {imgs.length > 0 ? (
                                      <img
                                        src={imgs[0]}
                                        alt={acc.title}
                                        style={{
                                          width: "44px",
                                          height: "44px",
                                          borderRadius: "10px",
                                          objectFit: "cover",
                                          flexShrink: 0,
                                          border: "1px solid rgba(255,255,255,0.12)",
                                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                                        }}
                                      />
                                    ) : (
                                      <div style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "10px",
                                        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px",
                                        flexShrink: 0,
                                        border: "1px solid rgba(99,102,241,0.3)"
                                      }}>
                                        🎮
                                      </div>
                                    )}
                                    <div style={{ overflow: "hidden" }}>
                                      <div style={{
                                        fontWeight: 700,
                                        fontSize: "13.5px",
                                        color: theme === "dark" ? "#f1f5f9" : "#0f172a",
                                        maxWidth: "280px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                      }} title={acc.title}>
                                        {acc.title}
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                                        <span style={{
                                          fontSize: "10.5px",
                                          fontWeight: 700,
                                          padding: "1px 6px",
                                          borderRadius: "4px",
                                          background: theme === "dark" ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                                          color: theme === "dark" ? "#94a3b8" : "#475569"
                                        }}>
                                          #{acc.id}
                                        </span>
                                        {acc.created_at && (
                                          <span style={{ fontSize: "11px", color: theme === "dark" ? "#64748b" : "#94a3b8" }}>
                                            {acc.created_at.split("T")[0] || acc.created_at.split(" ")[0]}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: "14px" }}>
                                  <div style={{
                                    fontSize: "12px",
                                    color: theme === "dark" ? "#94a3b8" : "#64748b",
                                    maxWidth: "220px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }} title={acc.description}>
                                    {acc.description || "Không có mô tả chi tiết"}
                                  </div>
                                </td>
                                <td style={{ padding: "14px" }}>
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: theme === "dark" ? "#cbd5e1" : "#334155"
                                  }}>
                                    <Users size={13} style={{ color: "#818cf8" }} />
                                    {acc.seller_name || "Admin"}
                                  </span>
                                </td>
                                <td style={{ padding: "14px", textAlign: "right" }}>
                                  <div style={{
                                    fontWeight: 800,
                                    fontSize: "14px",
                                    color: "#818cf8"
                                  }}>
                                    {(acc.price || 0).toLocaleString("vi-VN")}₫
                                  </div>
                                </td>
                                <td style={{ padding: "14px", textAlign: "center" }}>
                                  <span style={{
                                    display: "inline-block",
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: "11.5px",
                                    fontWeight: 700,
                                    background: acc.status === "available"
                                      ? "rgba(16, 185, 129, 0.15)"
                                      : acc.status === "sold"
                                      ? "rgba(99, 102, 241, 0.15)"
                                      : "rgba(148, 163, 184, 0.15)",
                                    color: acc.status === "available"
                                      ? "#34d399"
                                      : acc.status === "sold"
                                      ? "#818cf8"
                                      : "#94a3b8",
                                    border: acc.status === "available"
                                      ? "1px solid rgba(16, 185, 129, 0.3)"
                                      : acc.status === "sold"
                                      ? "1px solid rgba(99, 102, 241, 0.3)"
                                      : "1px solid rgba(148, 163, 184, 0.3)"
                                  }}>
                                    {acc.status === "available" ? "✓ Còn hàng" : acc.status === "sold" ? "● Đã bán" : "○ Đã ẩn"}
                                  </span>
                                </td>
                                <td style={{ padding: "14px", textAlign: "center" }}>
                                  <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                    <button
                                      onClick={() => handleOpenEditAccount(acc)}
                                      title="Chỉnh sửa tài khoản"
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "7px",
                                        border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                                        background: theme === "dark" ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                                        color: theme === "dark" ? "#cbd5e1" : "#334155",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.15s"
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.background = "#6366f1";
                                        e.currentTarget.style.color = "#fff";
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.background = theme === "dark" ? "rgba(255,255,255,0.06)" : "#f1f5f9";
                                        e.currentTarget.style.color = theme === "dark" ? "#cbd5e1" : "#334155";
                                      }}
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAccount(acc.id, acc.title)}
                                      title="Xóa tài khoản"
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "7px",
                                        border: theme === "dark" ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid #fca5a5",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        color: "#f87171",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.15s"
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.background = "#ef4444";
                                        e.currentTarget.style.color = "#fff";
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                                        e.currentTarget.style.color = "#f87171";
                                      }}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {accountTotalPages > 1 && (
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginTop: "16px",
                        paddingTop: "14px",
                        borderTop: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0"
                      }}>
                        <span style={{ fontSize: "12.5px", color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                          Hiển thị <b>{(accountPage - 1) * ACCOUNTS_PER_PAGE + 1} - {Math.min(accountPage * ACCOUNTS_PER_PAGE, sortedAccounts.length)}</b> trong số <b>{sortedAccounts.length}</b> tài khoản
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setAccountPage(p => Math.max(1, p - 1))}
                            disabled={accountPage === 1}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 12px",
                              borderRadius: "7px",
                              border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                              background: theme === "dark" ? "rgba(255,255,255,0.06)" : "#f8fafc",
                              color: accountPage === 1 ? "#64748b" : theme === "dark" ? "#e2e8f0" : "#1e293b",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: accountPage === 1 ? "not-allowed" : "pointer",
                              opacity: accountPage === 1 ? 0.5 : 1
                            }}
                          >
                            <ChevronLeft size={14} /> Trước
                          </button>

                          {Array.from({ length: accountTotalPages }, (_, i) => i + 1).map(p => (
                            <button
                              key={p}
                              onClick={() => setAccountPage(p)}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "7px",
                                border: "none",
                                background: accountPage === p ? "#6366f1" : "transparent",
                                color: accountPage === p ? "#ffffff" : theme === "dark" ? "#94a3b8" : "#64748b",
                                fontSize: "12.5px",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.15s",
                                boxShadow: accountPage === p ? "0 2px 8px rgba(99, 102, 241, 0.35)" : "none"
                              }}
                            >
                              {p}
                            </button>
                          ))}

                          <button
                            onClick={() => setAccountPage(p => Math.min(accountTotalPages, p + 1))}
                            disabled={accountPage === accountTotalPages}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 12px",
                              borderRadius: "7px",
                              border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                              background: theme === "dark" ? "rgba(255,255,255,0.06)" : "#f8fafc",
                              color: accountPage === accountTotalPages ? "#64748b" : theme === "dark" ? "#e2e8f0" : "#1e293b",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: accountPage === accountTotalPages ? "not-allowed" : "pointer",
                              opacity: accountPage === accountTotalPages ? 0.5 : 1
                            }}
                          >
                            Tiếp <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
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
                                {normalizeImages(card.images)[0] ? (
                                  <img
                                    src={normalizeImages(card.images)[0]}
                                    alt={card.title}
                                    style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.12)" }}
                                  />
                                ) : (
                                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎫</div>
                                )}
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
                                {normalizeImages(gc.images)[0] ? (
                                  <img
                                    src={normalizeImages(gc.images)[0]}
                                    alt={gc.title}
                                    style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.12)" }}
                                  />
                                ) : (
                                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎁</div>
                                )}
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
                  <div className="lt-sub">Quản lý thanh toán, hóa đơn mua hàng và bàn giao dữ liệu bí mật</div>
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
                    : "linear-gradient(135deg, #059669, #047857)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 800, color: "#fff",
                  boxShadow: userForm.role === "admin"
                    ? "0 8px 20px rgba(220,38,38,0.35)"
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
                      background: userForm.role === "admin" ? "rgba(220,38,38,0.15)" : "rgba(5,150,105,0.15)",
                      color: userForm.role === "admin" ? "#f87171" : "#34d399",
                      textTransform: "uppercase", letterSpacing: "0.05em"
                    }}>
                      {userForm.role === "admin" ? "⚡ Admin" : "🛒 Buyer"}
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
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as "admin" | "buyer" })}
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
                  background: userForm.role === "admin" ? "rgba(220,38,38,0.07)" : "rgba(5,150,105,0.07)",
                  border: `1px solid ${userForm.role === "admin" ? "rgba(220,38,38,0.2)" : "rgba(5,150,105,0.2)"}`,
                  fontSize: 11, color: userForm.role === "admin" ? "#f87171" : "#34d399",
                  display: "flex", alignItems: "flex-start", gap: 8
                }}>
                  <span style={{ fontSize: 14, marginTop: 1 }}>
                    {userForm.role === "admin" ? "⚡" : "🛒"}
                  </span>
                  <span>
                    {userForm.role === "admin"
                      ? "Admin có toàn quyền quản lý hệ thống, duyệt sản phẩm và quản lý người dùng."
                      : "Buyer chỉ có thể xem và mua sản phẩm."}
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
                  {editingAccount && (
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
                  )}

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
                  🔐 Thông tin đăng nhập
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
                  letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 16, height: 1.5, background: "#06b6d4", borderRadius: 1 }} />
                    <span>🖼️ Ảnh sản phẩm ({normalizeImages(accountForm.images).length})</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>Hỗ trợ JPG, PNG, WEBP, GIF (Tối đa 25MB)</span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                  onChange={handleUploadImages}
                  style={{ display: "none" }}
                />

                {/* Action Bar: Upload File & URL Input */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  {/* Upload from Computer button */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: isUploading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      border: "1px solid rgba(59,130,246,0.4)", color: "#fff",
                      cursor: isUploading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                      transition: "all 0.2s"
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                        <span>Đang tải ảnh...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud style={{ width: 15, height: 15 }} />
                        <span>Tải ảnh từ máy tính</span>
                      </>
                    )}
                  </button>

                  {/* URL Input */}
                  <div style={{ display: "flex", flex: 1, minWidth: 240, gap: 6 }}>
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Hoặc dán URL ảnh (https://...)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (imageUrlInput.trim()) {
                            const cur = normalizeImages(accountForm.images);
                            setAccountForm({ ...accountForm, images: [...cur, imageUrlInput.trim()] });
                            setImageUrlInput("");
                          }
                        }
                      }}
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
                          const cur = normalizeImages(accountForm.images);
                          setAccountForm({ ...accountForm, images: [...cur, imageUrlInput.trim()] });
                          setImageUrlInput("");
                        }
                      }}
                      style={{
                        padding: "9px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                        color: "#e2e8f0", cursor: "pointer", whiteSpace: "nowrap",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    >
                      + Thêm URL
                    </button>
                  </div>
                </div>
                {normalizeImages(accountForm.images).length > 0 && (
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: 8, padding: 10, borderRadius: 10,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)"
                  }}>
                    {normalizeImages(accountForm.images).map((img, i) => (
                      <div key={i} style={{ position: "relative", width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}
                        className="group"
                      >
                        <img src={img} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = normalizeImages(accountForm.images);
                            setAccountForm({ ...accountForm, images: cur.filter((_, idx) => idx !== i) });
                          }}
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

                  <div style={{ display: "grid", gridTemplateColumns: editingCard ? "1fr 1fr" : "1fr", gap: 12 }}>
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
                    {editingCard && (
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
                    )}
                  </div>
                </div>
              </div>

              {/* Ảnh thẻ cào */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#06b6d4", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 16, height: 1.5, background: "#06b6d4", borderRadius: 1 }} />
                    <span>🖼️ Ảnh thẻ cào ({normalizeImages(cardForm.images).length})</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>Hỗ trợ JPG, PNG, WEBP, JFIF (Tối đa 25MB)</span>
                </div>

                <input
                  ref={cardFileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                  onChange={handleUploadCardImages}
                  style={{ display: "none" }}
                />

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <button
                    type="button"
                    disabled={isCardUploading}
                    onClick={() => cardFileInputRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: isCardUploading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #10b981, #059669)",
                      border: "1px solid rgba(16,185,129,0.4)", color: "#fff",
                      cursor: isCardUploading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                      transition: "all 0.2s"
                    }}
                  >
                    {isCardUploading ? (
                      <>
                        <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                        <span>Đang tải ảnh...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud style={{ width: 15, height: 15 }} />
                        <span>Tải ảnh từ máy tính</span>
                      </>
                    )}
                  </button>

                  <div style={{ display: "flex", flex: 1, minWidth: 240, gap: 6 }}>
                    <input
                      type="text"
                      value={cardImageUrlInput}
                      onChange={(e) => setCardImageUrlInput(e.target.value)}
                      placeholder="Hoặc dán URL ảnh (https://... hoặc /images/...)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (cardImageUrlInput.trim()) {
                            const cur = normalizeImages(cardForm.images);
                            setCardForm({ ...cardForm, images: [...cur, cardImageUrlInput.trim()] });
                            setCardImageUrlInput("");
                          }
                        }
                      }}
                      style={{
                        flex: 1, padding: "9px 14px", borderRadius: 10, fontSize: 12,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", boxSizing: "border-box"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (cardImageUrlInput.trim()) {
                          const cur = normalizeImages(cardForm.images);
                          setCardForm({ ...cardForm, images: [...cur, cardImageUrlInput.trim()] });
                          setCardImageUrlInput("");
                        }
                      }}
                      style={{
                        padding: "9px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                        color: "#e2e8f0", cursor: "pointer", whiteSpace: "nowrap",
                        transition: "all 0.15s"
                      }}
                    >
                      + Thêm URL
                    </button>
                  </div>
                </div>

                {normalizeImages(cardForm.images).length > 0 && (
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: 8, padding: 10, borderRadius: 10,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)"
                  }}>
                    {normalizeImages(cardForm.images).map((img, i) => (
                      <div key={i} style={{ position: "relative", width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                        <img src={img} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = normalizeImages(cardForm.images);
                            setCardForm({ ...cardForm, images: cur.filter((_, idx) => idx !== i) });
                          }}
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

              {/* Thông tin bảo mật */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 1.5, background: "#f59e0b", borderRadius: 1 }} />
                  🔐 Mã thẻ
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

                  <div style={{ display: "grid", gridTemplateColumns: editingGiftcode ? "1fr 1fr" : "1fr", gap: 12 }}>
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
                    {editingGiftcode && (
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
                    )}
                  </div>
                </div>
              </div>

              {/* Ảnh Giftcode */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 16, height: 1.5, background: "#8b5cf6", borderRadius: 1 }} />
                    <span>🖼️ Ảnh Giftcode / Vật phẩm ({normalizeImages(giftcodeForm.images).length})</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>Hỗ trợ JPG, PNG, WEBP, GIF (Tối đa 25MB)</span>
                </div>

                <input
                  ref={giftcodeFileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                  onChange={handleUploadGiftcodeImages}
                  style={{ display: "none" }}
                />

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <button
                    type="button"
                    disabled={isGiftcodeUploading}
                    onClick={() => giftcodeFileInputRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: isGiftcodeUploading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                      border: "1px solid rgba(139,92,246,0.4)", color: "#fff",
                      cursor: isGiftcodeUploading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
                      transition: "all 0.2s"
                    }}
                  >
                    {isGiftcodeUploading ? (
                      <>
                        <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                        <span>Đang tải ảnh...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud style={{ width: 15, height: 15 }} />
                        <span>Tải ảnh từ máy tính</span>
                      </>
                    )}
                  </button>

                  <div style={{ display: "flex", flex: 1, minWidth: 240, gap: 6 }}>
                    <input
                      type="text"
                      value={giftcodeImageUrlInput}
                      onChange={(e) => setGiftcodeImageUrlInput(e.target.value)}
                      placeholder="Hoặc dán URL ảnh (https://... hoặc /images/...)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (giftcodeImageUrlInput.trim()) {
                            const cur = normalizeImages(giftcodeForm.images);
                            setGiftcodeForm({ ...giftcodeForm, images: [...cur, giftcodeImageUrlInput.trim()] });
                            setGiftcodeImageUrlInput("");
                          }
                        }
                      }}
                      style={{
                        flex: 1, padding: "9px 14px", borderRadius: 10, fontSize: 12,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0", outline: "none", boxSizing: "border-box"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (giftcodeImageUrlInput.trim()) {
                          const cur = normalizeImages(giftcodeForm.images);
                          setGiftcodeForm({ ...giftcodeForm, images: [...cur, giftcodeImageUrlInput.trim()] });
                          setGiftcodeImageUrlInput("");
                        }
                      }}
                      style={{
                        padding: "9px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                        color: "#e2e8f0", cursor: "pointer", whiteSpace: "nowrap",
                        transition: "all 0.15s"
                      }}
                    >
                      + Thêm URL
                    </button>
                  </div>
                </div>

                {normalizeImages(giftcodeForm.images).length > 0 && (
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: 8, padding: 10, borderRadius: 10,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)"
                  }}>
                    {normalizeImages(giftcodeForm.images).map((img, i) => (
                      <div key={i} style={{ position: "relative", width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                        <img src={img} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = normalizeImages(giftcodeForm.images);
                            setGiftcodeForm({ ...giftcodeForm, images: cur.filter((_, idx) => idx !== i) });
                          }}
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

              {/* Thông tin bảo mật */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 1.5, background: "#f59e0b", borderRadius: 1 }} />
                  🔐 Mã Giftcode
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
         ORDER DETAIL & SECURE DELIVERED DATA MODAL (PREMIUM REPLICATED INVOICE DIALOG)
      ========================================== */}
      {orderModalOpen && selectedOrder && (
        <div 
          onClick={() => setOrderModalOpen(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#05070f]/80 backdrop-blur-xl animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              borderRadius: 20,
              background: "linear-gradient(145deg, #13151f 0%, #0e1018 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15) inset",
              position: "relative",
              overflow: "hidden"
            }}
            className="max-h-[92vh] flex flex-col overflow-hidden animate-scale-in"
          >
            {/* Radial Glowing Ambient Accent on top-left */}
            <div
              style={{
                position: "absolute",
                top: -30,
                left: -30,
                width: 120,
                height: 120,
                background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none"
              }}
            />

            {/* Premium Header Bar matching Add Product Modal */}
            <div
              style={{
                padding: "22px 24px 18px",
                background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)",
                borderBottom: "1px solid rgba(99,102,241,0.15)",
                position: "relative"
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setOrderModalOpen(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#8b9ab5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                  e.currentTarget.style.color = "#f87171";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "#8b9ab5";
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px rgba(99,102,241,0.35)"
                  }}
                >
                  <ShoppingBag style={{ width: 20, height: 20, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
                    Chi tiết Đơn hàng & Bàn giao
                  </div>
                  <div style={{ fontSize: 11, color: "#8b9ab5", marginTop: 1 }}>
                    Mã đơn: <span style={{ color: "#6366f1", fontWeight: 700 }}>#{selectedOrder.id}</span> &bull; Khách: <span style={{ color: "#a5b4fc" }}>{selectedOrder.buyer_name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Form Area with standard padding */}
            <div className="flex-1 overflow-y-auto scrollbar-thin" style={{ padding: "20px 24px 24px" }}>
              
              {/* Section 1: THÔNG TIN ĐƠN HÀNG */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <div style={{ width: 16, height: 1.5, background: "#6366f1", borderRadius: 1 }} />
                  Thông tin đơn hàng
                  <div style={{ flex: 1, height: 1.5, background: "rgba(99,102,241,0.15)", borderRadius: 1 }} />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <div style={{ flex: 1, minWidth: 100 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#8b9ab5", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mã GD VNPAY</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginTop: 4, fontFamily: "monospace" }}>
                      {selectedOrder.payment_transaction_id || `GAMEACC-${selectedOrder.id}`}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 100 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#8b9ab5", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ngày mua</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginTop: 4 }}>
                      {new Date(selectedOrder.created_at).toLocaleString("vi-VN", {
                        year: "numeric", month: "2-digit", day: "2-digit",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 100 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#8b9ab5", textTransform: "uppercase", letterSpacing: "0.05em" }}>Thanh toán</div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#8b5cf6", marginTop: 4 }}>
                      {Number(selectedOrder.total_amount).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#8b9ab5", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trạng thái</div>
                    <div style={{ marginTop: 4 }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: selectedOrder.status === "completed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                          color: selectedOrder.status === "completed" ? "#34d399" : "#fbbf24",
                          border: selectedOrder.status === "completed" ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(245,158,11,0.25)"
                        }}
                      >
                        {selectedOrder.status === "completed" ? "Thành công" : selectedOrder.status === "pending" ? "Đang xử lý" : "Thất bại"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: SẢN PHẨM ĐÃ MUA */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#10b981",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <div style={{ width: 16, height: 1.5, background: "#10b981", borderRadius: 1 }} />
                  Sản phẩm đã mua ({selectedOrder.items.length})
                  <div style={{ flex: 1, height: 1.5, background: "rgba(16,185,129,0.15)", borderRadius: 1 }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)"
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>
                        {item.purchasable_title}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#34d399", fontFamily: "monospace" }}>
                        {Number(item.price).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Banner Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  fontSize: 11,
                  color: "#8b9ab5",
                  marginBottom: 20
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CreditCard style={{ width: 14, height: 14, color: "#6b7280" }} />
                  <span>Phương thức: <strong style={{ color: "#e2e8f0" }}>{selectedOrder.payment_method === "vnpay" ? "VNPay" : "MoMo"}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck style={{ width: 14, height: 14, color: "#10b981" }} />
                  <span style={{ color: "#34d399", fontWeight: 700 }}>Đơn hàng đã xác thực</span>
                </div>
              </div>

              {/* Section 3: THÔNG TIN BÀN GIAO & BẢO MẬT */}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#f59e0b",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <div style={{ width: 16, height: 1.5, background: "#f59e0b", borderRadius: 1 }} />
                  Thông tin bàn giao & bảo mật
                  <div style={{ flex: 1, height: 1.5, background: "rgba(245,158,11,0.15)", borderRadius: 1 }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {selectedOrder.items.length === 0 ? (
                    <div style={{ padding: 12, textAlign: "center", borderRadius: 10, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171", fontSize: 12, fontWeight: 700 }}>
                      ⚠️ Chưa có sản phẩm nào thuộc đơn hàng này.
                    </div>
                  ) : (
                    selectedOrder.items.map((item) => {
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

                      const isAccount = item.purchasable_type.includes("GameAccount");
                      const isCard = item.purchasable_type.includes("GameCard");
                      const isGiftcode = item.purchasable_type.includes("GameGiftcode");

                      return (
                        <div
                          key={item.id}
                          style={{
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(12,13,22,0.9)",
                            overflow: "hidden"
                          }}
                        >
                          {/* Card Header Title */}
                          <div
                            style={{
                              padding: "10px 14px",
                              background: "rgba(255,255,255,0.03)",
                              borderBottom: "1px solid rgba(255,255,255,0.08)",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#e2e8f0"
                            }}
                          >
                            {item.purchasable_title}
                          </div>

                          {/* Fields inside the Secure card */}
                          <div style={{ padding: 14 }}>
                            {!delivered ? (
                              <div style={{ fontSize: 11, color: "#8b9ab5", fontStyle: "italic" }}>
                                ❌ Chưa có thông tin bàn giao bí mật cho sản phẩm này.
                              </div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {isAccount && (() => {
                                  const username = delivered.username || delivered.account_username || "";
                                  const password = delivered.password || delivered.account_password || "";
                                  const displayFields = [
                                    { label: "Tên đăng nhập (Username)", val: username, key: "username", isSensitive: false },
                                    { label: "Mật khẩu (Password)", val: password, key: "password", isSensitive: true }
                                  ].filter(f => f.val);

                                  return displayFields.map((field, fIdx) => {
                                    const uniqueKey = `order-${selectedOrder.id}-item-${item.id}-${field.key}`;
                                    const isBlur = field.isSensitive && !showModalPassword[uniqueKey];

                                    return (
                                      <div
                                        key={field.key}
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          paddingBottom: 10,
                                          borderBottom: fIdx < displayFields.length - 1 ? "1px dashed rgba(255,255,255,0.06)" : "none"
                                        }}
                                      >
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                          <div style={{ fontSize: 10, fontWeight: 700, color: "#8b9ab5", marginBottom: 4 }}>{field.label}</div>
                                          <p
                                            style={{
                                              fontFamily: "monospace",
                                              fontSize: 12,
                                              fontWeight: 700,
                                              color: "#f3f4f6",
                                              margin: 0,
                                              filter: isBlur ? "blur(5px)" : "none",
                                              transition: "filter 0.2s",
                                              userSelect: isBlur ? "none" : "all"
                                            }}
                                          >
                                            {field.val}
                                          </p>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 16 }}>
                                          {field.isSensitive && (
                                            <button
                                              type="button"
                                              onClick={() => setShowModalPassword(prev => ({ ...prev, [uniqueKey]: !prev[uniqueKey] }))}
                                              style={{
                                                padding: 5,
                                                borderRadius: 6,
                                                background: "rgba(255,255,255,0.05)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                color: "#8b9ab5",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                              }}
                                            >
                                              {showModalPassword[uniqueKey] ? <EyeOff style={{ width: 13, height: 13 }} /> : <Eye style={{ width: 13, height: 13 }} />}
                                            </button>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(field.val);
                                              setCopiedModalField(uniqueKey);
                                              setTimeout(() => setCopiedModalField(null), 2000);
                                            }}
                                            style={{
                                              padding: "4px 8px",
                                              borderRadius: 6,
                                              background: "rgba(255,255,255,0.05)",
                                              border: "1px solid rgba(255,255,255,0.08)",
                                              color: "#8b9ab5",
                                              cursor: "pointer",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 4,
                                              transition: "all 0.15s"
                                            }}
                                          >
                                            {copiedModalField === uniqueKey ? (
                                              <>
                                                <Check style={{ width: 12, height: 12, color: "#10b981" }} />
                                                <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>Đã chép</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy style={{ width: 12, height: 12 }} />
                                                <span style={{ fontSize: 10, fontWeight: 600 }}>Copy</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}

                                {isCard && (() => {
                                  const serial = delivered.serial || delivered.card_serial || "";
                                  const code = delivered.code || delivered.card_code || "";

                                  const displayFields = [
                                    { label: "Số Serial Thẻ", val: serial, key: "serial", isSensitive: false },
                                    { label: "Mã PIN / Code nạp ẩn", val: code, key: "code", isSensitive: true },
                                  ].filter(f => f.val);

                                  return displayFields.map((field, fIdx) => {
                                    const uniqueKey = `order-${selectedOrder.id}-item-${item.id}-${field.key}`;
                                    const isBlur = field.isSensitive && !showModalPassword[uniqueKey];

                                    return (
                                      <div
                                        key={field.key}
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          paddingBottom: 10,
                                          borderBottom: fIdx < displayFields.length - 1 ? "1px dashed rgba(255,255,255,0.06)" : "none"
                                        }}
                                      >
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                          <div style={{ fontSize: 10, fontWeight: 700, color: "#8b9ab5", marginBottom: 4 }}>{field.label}</div>
                                          <p
                                            style={{
                                              fontFamily: "monospace",
                                              fontSize: 12,
                                              fontWeight: 700,
                                              color: "#f3f4f6",
                                              margin: 0,
                                              filter: isBlur ? "blur(5px)" : "none",
                                              transition: "filter 0.2s",
                                              userSelect: isBlur ? "none" : "all"
                                            }}
                                          >
                                            {field.val}
                                          </p>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 16 }}>
                                          {field.isSensitive && (
                                            <button
                                              type="button"
                                              onClick={() => setShowModalPassword(prev => ({ ...prev, [uniqueKey]: !prev[uniqueKey] }))}
                                              style={{
                                                padding: 5,
                                                borderRadius: 6,
                                                background: "rgba(255,255,255,0.05)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                color: "#8b9ab5",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                              }}
                                            >
                                              {showModalPassword[uniqueKey] ? <EyeOff style={{ width: 13, height: 13 }} /> : <Eye style={{ width: 13, height: 13 }} />}
                                            </button>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(field.val);
                                              setCopiedModalField(uniqueKey);
                                              setTimeout(() => setCopiedModalField(null), 2000);
                                            }}
                                            style={{
                                              padding: "4px 8px",
                                              borderRadius: 6,
                                              background: "rgba(255,255,255,0.05)",
                                              border: "1px solid rgba(255,255,255,0.08)",
                                              color: "#8b9ab5",
                                              cursor: "pointer",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 4,
                                              transition: "all 0.15s"
                                            }}
                                          >
                                            {copiedModalField === uniqueKey ? (
                                              <>
                                                <Check style={{ width: 12, height: 12, color: "#10b981" }} />
                                                <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>Đã chép</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy style={{ width: 12, height: 12 }} />
                                                <span style={{ fontSize: 10, fontWeight: 600 }}>Copy</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}

                                {isGiftcode && (() => {
                                  const code = delivered.code || delivered.giftcode_string || "";
                                  const uniqueKey = `order-${selectedOrder.id}-item-${item.id}-giftcode`;

                                  return (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: "#8b9ab5", marginBottom: 4 }}>Mã Giftcode nhận thưởng</div>
                                        <p style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#f3f4f6", margin: 0, userSelect: "all" }}>
                                          {code}
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(code);
                                          setCopiedModalField(uniqueKey);
                                          setTimeout(() => setCopiedModalField(null), 2000);
                                        }}
                                        style={{
                                          padding: "4px 8px",
                                          borderRadius: 6,
                                          background: "rgba(255,255,255,0.05)",
                                          border: "1px solid rgba(255,255,255,0.08)",
                                          color: "#8b9ab5",
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                          marginLeft: 16,
                                          transition: "all 0.15s"
                                        }}
                                      >
                                        {copiedModalField === uniqueKey ? (
                                          <>
                                            <Check style={{ width: 12, height: 12, color: "#10b981" }} />
                                            <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>Đã chép</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy style={{ width: 12, height: 12 }} />
                                            <span style={{ fontSize: 10, fontWeight: 600 }}>Copy</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  );
                                })()}

                                {!delivered.username && !delivered.account_username && !delivered.serial && !delivered.card_serial && !delivered.code && !delivered.giftcode_string && delivered.raw && (
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <div style={{ fontSize: 10, fontWeight: 700, color: "#8b9ab5", marginBottom: 4 }}>Payload raw data</div>
                                      <p style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#f3f4f6", margin: 0, wordBreak: "break-all", userSelect: "all" }}>
                                        {delivered.raw}
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(delivered.raw);
                                        setCopiedModalField(`order-${selectedOrder.id}-item-${item.id}-raw`);
                                        setTimeout(() => setCopiedModalField(null), 2000);
                                      }}
                                      style={{
                                        padding: "4px 8px",
                                        borderRadius: 6,
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        color: "#8b9ab5",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        marginLeft: 16,
                                        transition: "all 0.15s"
                                      }}
                                    >
                                      {copiedModalField === `order-${selectedOrder.id}-item-${item.id}-raw` ? (
                                        <>
                                          <Check style={{ width: 12, height: 12, color: "#10b981" }} />
                                          <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>Đã chép</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy style={{ width: 12, height: 12 }} />
                                          <span style={{ fontSize: 10, fontWeight: 600 }}>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM CONFIRM DELETE DIALOG (MODERN, SLEEK & PREMIUM)                    */}
      {/* ========================================================================= */}
      {confirmDialog.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(3, 7, 18, 0.78)",
            backdropFilter: "blur(12px)",
            padding: 16,
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !confirmDialog.isLoading) {
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            }
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 440,
              background: "linear-gradient(180deg, #161b26 0%, #0d111a 100%)",
              border: "1px solid rgba(239, 68, 68, 0.32)",
              borderRadius: 24,
              padding: "28px 24px 24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 45px rgba(239, 68, 68, 0.16)",
              overflow: "hidden",
            }}
          >
            {/* Ambient Top Glow */}
            <div
              style={{
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                width: 240,
                height: 120,
                background: "radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            {/* Close 'X' button */}
            <button
              type="button"
              disabled={confirmDialog.isLoading}
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#8b9ab5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: confirmDialog.isLoading ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                e.currentTarget.style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#8b9ab5";
              }}
            >
              <X style={{ width: 15, height: 15 }} />
            </button>

            {/* Warning Icon Badge */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 20,
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(239, 68, 68, 0.25)",
                }}
              >
                <Trash2 style={{ width: 28, height: 28, color: "#ef4444" }} />
              </div>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#f8fafc",
                textAlign: "center",
                margin: "0 0 8px",
                letterSpacing: "-0.01em",
              }}
            >
              {confirmDialog.title}
            </h3>

            {/* Message */}
            {confirmDialog.message && (
              <p
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  textAlign: "center",
                  margin: "0 0 16px",
                  lineHeight: 1.5,
                }}
              >
                {confirmDialog.message}
              </p>
            )}

            {/* Highlighted Item Box */}
            {confirmDialog.itemName && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "rgba(239, 68, 68, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle style={{ width: 16, height: 16, color: "#f87171" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Mục được chọn:
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#f1f5f9",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={confirmDialog.itemName}
                  >
                    "{confirmDialog.itemName}"
                  </div>
                </div>
              </div>
            )}

            {/* Irreversible notice */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.16)",
                marginBottom: 22,
                fontSize: 11.5,
                color: "#fca5a5",
                lineHeight: 1.4,
              }}
            >
              <span>⚠️</span>
              <span>Dữ liệu sẽ bị xóa khỏi hệ thống và không thể hoàn tác.</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                disabled={confirmDialog.isLoading}
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#cbd5e1",
                  cursor: confirmDialog.isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.color = "#cbd5e1";
                }}
              >
                {confirmDialog.cancelText || "Hủy bỏ"}
              </button>

              <button
                type="button"
                disabled={confirmDialog.isLoading}
                onClick={async () => {
                  setConfirmDialog(prev => ({ ...prev, isLoading: true }));
                  try {
                    await confirmDialog.onConfirm();
                  } finally {
                    setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
                  }
                }}
                style={{
                  flex: 1.2,
                  padding: "11px 18px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  border: "none",
                  color: "#fff",
                  cursor: confirmDialog.isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 18px rgba(239, 68, 68, 0.4)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(239, 68, 68, 0.6)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(239, 68, 68, 0.4)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {confirmDialog.isLoading ? (
                  <>
                    <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 style={{ width: 14, height: 14 }} />
                    <span>{confirmDialog.confirmText || "Xác nhận xóa"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
      )}
    </>
  );
}
