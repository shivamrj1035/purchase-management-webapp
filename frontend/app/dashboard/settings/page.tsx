"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
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
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Database,
  Home,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    homeAddress: user?.homeAddress || "",
  });

  const [propertyData, setPropertyData] = useState({
    purchasePrice: "",
    propertyAddress: "",
    propertyType: "apartment",
    registrationAmount: "",
    stampDuty: "",
    legalFees: "",
  });

  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!user) return;
      try {
        const propertyRef = doc(
          db,
          "users",
          user.userId,
          "settings",
          "property"
        );
        const propertyDoc = await getDoc(propertyRef);
        if (propertyDoc.exists()) {
          const data = propertyDoc.data();
          setPropertyData({
            purchasePrice: data.purchasePrice?.toString() || "",
            propertyAddress: data.propertyAddress || "",
            propertyType: data.propertyType || "apartment",
            registrationAmount: data.registrationAmount?.toString() || "",
            stampDuty: data.stampDuty?.toString() || "",
            legalFees: data.legalFees?.toString() || "",
          });
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
      }
    };
    fetchPropertyDetails();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      updateUser(profileData);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const propertyRef = doc(db, "users", user.userId, "settings", "property");
      await setDoc(propertyRef, {
        purchasePrice: parseFloat(propertyData.purchasePrice) || 0,
        propertyAddress: propertyData.propertyAddress,
        propertyType: propertyData.propertyType,
        registrationAmount: parseFloat(propertyData.registrationAmount) || 0,
        stampDuty: parseFloat(propertyData.stampDuty) || 0,
        legalFees: parseFloat(propertyData.legalFees) || 0,
        updatedAt: new Date(),
      });
      toast.success("Property details saved successfully");
    } catch (error) {
      console.error("Error saving property details:", error);
      toast.error("Failed to save property details");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Property Purchase Details */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Property Purchase Details
          </CardTitle>
          <CardDescription className="text-slate-400">
            Set your property purchase price and related costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProperty} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">
                  Purchase Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={propertyData.purchasePrice}
                  onChange={(e) =>
                    setPropertyData({
                      ...propertyData,
                      purchasePrice: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="e.g., 5000000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <select
                  id="propertyType"
                  value={propertyData.propertyType}
                  onChange={(e) =>
                    setPropertyData({
                      ...propertyData,
                      propertyType: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800 border-slate-700 text-white rounded-md px-3 py-2"
                >
                  <option value="apartment">Apartment</option>
                  <option value="flat">Flat</option>
                  <option value="independent_house">Independent House</option>
                  <option value="plot">Plot/Land</option>
                  <option value="shop">Shop</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input
                  id="propertyAddress"
                  value={propertyData.propertyAddress}
                  onChange={(e) =>
                    setPropertyData({
                      ...propertyData,
                      propertyAddress: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Enter property address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationAmount">
                  Registration Amount (₹)
                </Label>
                <Input
                  id="registrationAmount"
                  type="number"
                  value={propertyData.registrationAmount}
                  onChange={(e) =>
                    setPropertyData({
                      ...propertyData,
                      registrationAmount: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="e.g., 100000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stampDuty">Stamp Duty (₹)</Label>
                <Input
                  id="stampDuty"
                  type="number"
                  value={propertyData.stampDuty}
                  onChange={(e) =>
                    setPropertyData({
                      ...propertyData,
                      stampDuty: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="e.g., 250000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalFees">Legal Fees (₹)</Label>
                <Input
                  id="legalFees"
                  type="number"
                  value={propertyData.legalFees}
                  onChange={(e) =>
                    setPropertyData({
                      ...propertyData,
                      legalFees: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="e.g., 50000"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Save Property Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Save Changes
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
    </div>
  );
}
