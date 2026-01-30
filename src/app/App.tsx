import { useState } from "react";
import { CustomerPortal } from "@/app/components/customer/CustomerPortal";
import { CustomerSupportDashboard } from "@/app/components/support/CustomerSupportDashboard";
import { OperationalManagerDashboard } from "@/app/components/manager/OperationalManagerDashboard";
import { WarehouseInspectionScreen } from "@/app/components/warehouse/WarehouseInspectionScreen";
import { CashierRefundScreen } from "@/app/components/cashier/CashierRefundScreen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { ReturnRequest, mockReturns } from "@/app/data/mockData";
import { Toaster } from "@/app/components/ui/sonner";
import { Users, Zap } from "lucide-react";

export default function App() {
  const [currentRole, setCurrentRole] = useState<string>("customer");
  const [returns, setReturns] = useState<ReturnRequest[]>(mockReturns);

  const handleCreateReturn = (returnData: Omit<ReturnRequest, "id" | "createdAt" | "updatedAt" | "statusHistory">) => {
    const newReturn: ReturnRequest = {
      ...returnData,
      id: `RET-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: returnData.status,
          timestamp: new Date().toISOString(),
          note: "Return request created",
          automated: true
        }
      ]
    };
    setReturns([newReturn, ...returns]);
  };

  const handleUpdateReturn = (id: string, updates: Partial<ReturnRequest>) => {
    setReturns(returns.map(ret => {
      if (ret.id === id) {
        const updatedReturn = { ...ret, ...updates, updatedAt: new Date().toISOString() };
        
        // Add to status history if status changed
        if (updates.status && updates.status !== ret.status) {
          updatedReturn.statusHistory = [
            ...ret.statusHistory,
            {
              status: updates.status,
              timestamp: new Date().toISOString(),
              note: updates.statusNote || `Status changed to ${updates.status}`,
              automated: updates.automated || false,
              user: updates.updatedBy
            }
          ];
        }
        
        return updatedReturn;
      }
      return ret;
    }));
  };

  const renderRoleView = () => {
    switch (currentRole) {
      case "customer":
        return <CustomerPortal returns={returns} onCreateReturn={handleCreateReturn} onUpdateReturn={handleUpdateReturn} />;
      case "support":
        return <CustomerSupportDashboard returns={returns} onUpdateReturn={handleUpdateReturn} />;
      case "manager":
        return <OperationalManagerDashboard returns={returns} onUpdateReturn={handleUpdateReturn} />;
      case "warehouse":
        return <WarehouseInspectionScreen returns={returns} onUpdateReturn={handleUpdateReturn} />;
      case "cashier":
        return <CashierRefundScreen returns={returns} onUpdateReturn={handleUpdateReturn} />;
      default:
        return <CustomerPortal returns={returns} onCreateReturn={handleCreateReturn} onUpdateReturn={handleUpdateReturn} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-lg">RMS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Return Management System
                </h1>
                <p className="text-xs text-gray-600">Automated End-to-End Return Processing</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-green-600" />
                <span className="text-xs">Automation Active</span>
              </Badge>
              
              {/* Role Switcher - Demo Only */}
              <div className="flex items-center gap-2 border-l pl-4">
                <Users className="w-4 h-4 text-gray-500" />
                <Select value={currentRole} onValueChange={setCurrentRole}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="support">Customer Support</SelectItem>
                    <SelectItem value="manager">Operational Manager</SelectItem>
                    <SelectItem value="warehouse">Warehouse Employee</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderRoleView()}
      </main>
    </div>
  );
}