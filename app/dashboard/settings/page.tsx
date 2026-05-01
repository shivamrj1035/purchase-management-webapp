"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/authStore";
import { Settings as SettingsIcon, User, Bell, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    homeAddress: user?.homeAddress || "",
  });
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load additional profile info from Details sheet
  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const res = await fetch("/api/sheets/details");
        if (res.ok) {
          const data = await res.json();
          const details = data.details || {};
          const newProfileData = {
            ...profileData,
            phoneNumber: details.phoneNumber || profileData.phoneNumber,
            homeAddress: details.homeAddress || profileData.homeAddress,
            username: details.username || profileData.username,
          };
          setProfileData(newProfileData);
          updateUser(newProfileData);
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
      }
    };

    if (user?.userId) {
      fetchProfileDetails();
    }
  }, [user?.userId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to Google Sheets Details
      const res = await fetch("/api/sheets/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: {
            phoneNumber: profileData.phoneNumber,
            homeAddress: profileData.homeAddress,
            username: profileData.username,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save to backend");

      // Update local store
      updateUser(profileData);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-slate-400">
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeAddress">Home Address</Label>
                <Input
                  id="homeAddress"
                  value={profileData.homeAddress}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      homeAddress: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Enter your home address"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure payment reminders and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <p className="text-white font-medium">EMI Payment Reminders</p>
                <p className="text-sm text-slate-400">
                  Get notified 3 days before EMI due date
                </p>
              </div>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                Coming Soon
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-slate-400">
                  Receive email summaries of your payments
                </p>
              </div>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                Coming Soon
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Monthly Reports</p>
                <p className="text-sm text-slate-400">
                  Auto-generate monthly financial reports
                </p>
              </div>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Data Management
          </CardTitle>
          <CardDescription className="text-slate-400">
            Export or delete your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Export Data</p>
                <p className="text-sm text-slate-400">
                  Download all your data as CSV or Excel
                </p>
              </div>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                Coming Soon
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-500/30">
              <div>
                <p className="text-red-400 font-medium">Delete Account</p>
                <p className="text-sm text-red-300/70">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-slate-400">
            <p>Property Purchase Management System v1.0.0</p>
            <p className="mt-1">© 2025 All Rights Reserved</p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
