import { useState } from "react";
import { ReturnRequestForm } from "./ReturnRequestForm";
import { ReturnStatusTracking } from "./ReturnStatusTracking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { ReturnRequest } from "@/app/data/mockData";
import { PackagePlus, Search } from "lucide-react";

interface CustomerPortalProps {
  returns: ReturnRequest[];
  onCreateReturn: (returnData: Omit<ReturnRequest, "id" | "createdAt" | "updatedAt" | "statusHistory">) => void;
  onUpdateReturn: (id: string, updates: Partial<ReturnRequest>) => void;
}

export function CustomerPortal({ returns, onCreateReturn, onUpdateReturn }: CustomerPortalProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <Tabs defaultValue="new-return" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="new-return" className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4" />
            <span>New Return</span>
          </TabsTrigger>
          <TabsTrigger value="track" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Track Return</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-return">
          <ReturnRequestForm onSubmit={onCreateReturn} />
        </TabsContent>

        <TabsContent value="track">
          <ReturnStatusTracking returns={returns} onUpdateReturn={onUpdateReturn} />
        </TabsContent>
      </Tabs>
    </div>
  );
}