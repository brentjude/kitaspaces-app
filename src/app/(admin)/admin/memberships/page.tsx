"use client";

import { useEffect, useState } from "react";
import { PlusIcon, UserGroupIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import MembershipPlanCard from "./components/MembershipPlanCard";
import CreateMembershipPlanModal from "./components/CreateMembershipPlanModal";
import MembersList from "./components/MembersList";
import type {
  MembershipPlanFormData,
  MembershipPlanWithPerks,
} from "@/types/membership";
import type { User, Membership, MembershipPlan } from "@/generated/prisma";

type TabType = "members" | "plans";

interface MemberWithDetails extends User {
  memberships: Array<
    Membership & {
      plan: MembershipPlan | null;
    }
  >;
}

export default function MembershipsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("members");
  const [plans, setPlans] = useState<MembershipPlanWithPerks[]>([]);
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<
    MembershipPlanWithPerks | undefined
  >(undefined);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch plans
      const plansResponse = await fetch("/api/admin/memberships");
      const plansData = await plansResponse.json();

      if (plansData.success) {
        setPlans(plansData.data);
      }

      // Fetch members (users with isMember=true)
      const membersResponse = await fetch("/api/admin/memberships/members");
      const membersData = await membersResponse.json();

      if (membersData.success) {
        setMembers(membersData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch membership data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: MembershipPlanWithPerks) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: MembershipPlanFormData) => {
    try {
      const url = data.id
        ? `/api/admin/memberships/${data.id}`
        : "/api/admin/memberships";
      const method = data.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        await fetchData();
        setIsModalOpen(false);
      } else {
        alert(result.error || "Failed to save membership plan");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save membership plan");
    }
  };

  const handleToggleActive = async (plan: MembershipPlanWithPerks) => {
    try {
      const response = await fetch(`/api/admin/memberships/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...plan,
          isActive: !plan.isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchData();
      } else {
        alert(result.error || "Failed to update membership plan");
      }
    } catch (error) {
      console.error("Error toggling plan status:", error);
      alert("Failed to update membership plan");
    }
  };

  const handleViewMember = (memberId: string) => {
    router.push(`/admin/customers/${memberId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    {
      id: "members" as TabType,
      label: "Members",
      icon: <UserGroupIcon className="w-5 h-5" />,
      count: members.length,
    },
    {
      id: "plans" as TabType,
      label: "Plans",
      icon: <RectangleStackIcon className="w-5 h-5" />,
      count: plans.length,
    },
  ];

  return (
    <div className="space-y-6 p-8">
      {/* 🔧 REMOVED: Page Title */}
      
      {/* Header with Create Button */}
      <div className="flex justify-end">
        {activeTab === "plans" && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" /> Create Plan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-foreground/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              <span>
                {tab.label} ({tab.count})
              </span>
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "members" && (
        <MembersList members={members} onViewMember={handleViewMember} />
      )}

      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <MembershipPlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
            />
          ))}
          {plans.length === 0 && (
            <div className="col-span-full py-12 text-center text-foreground/40 bg-white rounded-xl border border-dashed border-foreground/20">
              No membership plans found. Create one to get started.
            </div>
          )}
        </div>
      )}

      <CreateMembershipPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingPlan}
      />
    </div>
  );
}