"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  UserIcon,
  CreditCardIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import GeneralTab from "./components/GeneralTab";
import PaymentsTab from "./components/PaymentsTab";
import EventCategoriesTab from "./components/EventCategoriesTab";
import CouponsTab from "./components/CouponsTab";
import SystemUsersTab from "./components/SystemUsersTab";
import { AdminSettings } from "@/types/database";
import { EventCategory, Coupon } from "@/types/database";

type TabId = "general" | "payments" | "categories" | "coupons" | "users";

interface Tab {
  id: TabId;
  label: string;
  icon: typeof UserIcon;
}

const tabs: Tab[] = [
  { id: "general", label: "General", icon: UserIcon },
  { id: "payments", label: "Payments", icon: CreditCardIcon },
  { id: "categories", label: "Event Categories", icon: TagIcon },
  { id: "coupons", label: "Coupons", icon: TicketIcon },
  { id: "users", label: "System Users", icon: UsersIcon },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [loading, setLoading] = useState(true);

  // General tab data
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: null as string | null,
    contactNumber: null as string | null,
  });

  const [paymentSettings, setPaymentSettings] = useState<AdminSettings>({
    id: "",
    bankName: null,
    accountNumber: null,
    accountName: null,
    qrCodeUrl: null,
    qrCodeNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Categories and coupons
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [admins, setAdmins] = useState<
    Array<{ id: string; name: string; email: string; createdAt: Date }>
  >([]);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, categoriesRes, couponsRes, adminsRes, paymentRes] =
        await Promise.all([
          fetch("/api/admin/settings/profile"),
          fetch("/api/admin/settings/categories"),
          fetch("/api/admin/settings/coupons"),
          fetch("/api/admin/settings/admins"),
          fetch("/api/admin/settings/payments"),
        ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.success && data.data) {
          setProfile({
            name: data.data.name,
            email: data.data.email,
            company: data.data.company,
            contactNumber: data.data.contactNumber,
          });
        }
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        if (data.success && data.data) {
          setCategories(data.data);
        }
      }

      if (couponsRes.ok) {
        const data = await couponsRes.json();
        if (data.success && data.data) {
          setCoupons(data.data);
        }
      }

      if (adminsRes.ok) {
        const data = await adminsRes.json();
        if (data.success && data.data) {
          setAdmins(data.data);
        }
      }
      if (paymentRes.ok) {
        const data = await paymentRes.json();
        if (data.success && data.data) {
          setPaymentSettings(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadData();
    }
  }, [status, session, loadData]);

  // Handlers for General Tab
  const handleUpdateProfile = async (data: Partial<typeof profile>) => {
    const response = await fetch("/api/admin/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to update profile");

    const result = await response.json();
    if (result.success && result.data) {
      setProfile({
        name: result.data.name,
        email: result.data.email,
        company: result.data.company,
        contactNumber: result.data.contactNumber,
      });
    }
  };

  const handleUpdatePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await fetch("/api/admin/settings/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to update password");
    }
  };

  // Add new handlers for payments
  const handleUpdateBankInfo = async (data: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    try {
      const response = await fetch("/api/admin/settings/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update bank info");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setPaymentSettings(result.data);
        alert("Bank information updated successfully!");
      }
    } catch (error) {
      console.error("Error updating bank info:", error);
      throw error;
    }
  };

  const handleUpdateQRInfo = async (qrCodeNumber: string) => {
    try {
      const response = await fetch("/api/admin/settings/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeNumber }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update QR info");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setPaymentSettings(result.data);
        alert("QR code number updated successfully!");
      }
    } catch (error) {
      console.error("Error updating QR info:", error);
      throw error;
    }
  };

  const handleUploadQR = async (url: string): Promise<void> => {
    try {
      const response = await fetch("/api/admin/settings/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeUrl: url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save QR URL");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setPaymentSettings(result.data);
        // Don't show alert here, let the component handle success feedback
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error saving QR URL:", error);
      throw error;
    }
  };

  const handleDeleteQR = async () => {
    try {
      const response = await fetch("/api/admin/settings/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeUrl: null }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete QR");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setPaymentSettings(result.data);
        alert("QR code deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting QR:", error);
      throw error;
    }
  };

  // Handlers for Categories Tab
  const handleAddCategory = async (data: {
    name: string;
    color: string;
    icon: string;
  }) => {
    const response = await fetch("/api/admin/settings/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to add category");

    const result = await response.json();
    if (result.success && result.data) {
      setCategories([...categories, result.data]);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const response = await fetch(`/api/admin/settings/categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete category");

    setCategories(categories.filter((c) => c.id !== id));
  };

  // Handlers for Coupons Tab
  const handleAddCoupon = async (data: {
    code: string;
    discountType: string;
    discountValue: number;
    maxUses: number | null;
    expiresAt: Date | null;
  }) => {
    const response = await fetch("/api/admin/settings/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to add coupon");

    const result = await response.json();
    if (result.success && result.data) {
      setCoupons([...coupons, result.data]);
    }
  };

  const handleToggleCoupon = async (id: string, isActive: boolean) => {
    const response = await fetch(`/api/admin/settings/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) throw new Error("Failed to toggle coupon");

    const result = await response.json();
    if (result.success && result.data) {
      setCoupons(coupons.map((c) => (c.id === id ? result.data : c)));
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    const response = await fetch(`/api/admin/settings/coupons/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete coupon");

    setCoupons(coupons.filter((c) => c.id !== id));
  };

  // Handlers for System Users Tab
  const handleAddAdmin = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await fetch("/api/admin/settings/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to add admin");
    }

    const result = await response.json();
    if (result.success && result.data) {
      setAdmins([...admins, result.data]);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-foreground/60">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-foreground/60 mt-1">
              Manage your system settings and preferences
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-1 flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "general" && (
              <GeneralTab
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onUpdatePassword={handleUpdatePassword}
              />
            )}

            {activeTab === "payments" && (
              <PaymentsTab
                bankInfo={{
                  bankName: paymentSettings.bankName || "",
                  accountNumber: paymentSettings.accountNumber || "",
                  accountName: paymentSettings.accountName || "",
                }}
                qrCodeUrl={paymentSettings.qrCodeUrl}
                qrCodeNumber={paymentSettings.qrCodeNumber || ""}
                onUpdateBankInfo={handleUpdateBankInfo}
                onUpdateQRInfo={handleUpdateQRInfo}
                onUploadQR={handleUploadQR}
                onDeleteQR={handleDeleteQR}
              />
            )}

            {activeTab === "categories" && (
              <EventCategoriesTab
                categories={categories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === "coupons" && (
              <CouponsTab
                coupons={coupons}
                onAddCoupon={handleAddCoupon}
                onToggleCoupon={handleToggleCoupon}
                onDeleteCoupon={handleDeleteCoupon}
              />
            )}

            {activeTab === "users" && (
              <SystemUsersTab admins={admins} onAddAdmin={handleAddAdmin} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
