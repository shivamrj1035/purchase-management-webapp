"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { usePropertyStore } from "@/lib/store/propertyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Settings } from "lucide-react";

export function ConfigurationAlert() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { propertyDetails, loadPropertyDetails } = usePropertyStore();

  useEffect(() => {
    if (user?.userId) {
      loadPropertyDetails(user.userId);
    }
  }, [user?.userId, loadPropertyDetails]);

  // Don't show alert if configuration is already set
  if (propertyDetails) {
    return null;
  }

  return (
    <Card className="bg-amber-900/20 border-amber-800 mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-200 mb-1 flex items-center gap-2">
              <span>Configuration Required</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500 text-amber-950">
                Action Needed
              </span>
            </h3>
            <p className="text-sm text-amber-300/90 mb-3">
              Set up your property purchase details to enable accurate financial
              tracking across all sections. This includes purchase price,
              registration fees, stamp duty, and other costs.
            </p>
            <Button
              onClick={() => router.push("/dashboard/purchase-config")}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
