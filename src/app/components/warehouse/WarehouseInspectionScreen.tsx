import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { ReturnRequest } from "@/app/data/mockData";
import { Package, CheckCircle2, XCircle, AlertCircle, Search, Zap } from "lucide-react";
import { toast } from "sonner";

interface WarehouseInspectionScreenProps {
  returns: ReturnRequest[];
  onUpdateReturn: (id: string, updates: Partial<ReturnRequest>) => void;
}

export function WarehouseInspectionScreen({ returns, onUpdateReturn }: WarehouseInspectionScreenProps) {
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [inspectionData, setInspectionData] = useState({
    componentsComplete: true,
    physicalCondition: "good" as "excellent" | "good" | "fair" | "poor",
    functionalStatus: "working" as "working" | "defective" | "damaged",
    disposition: "approve_refund" as "approve_refund" | "approve_replacement" | "reject" | "pending",
    notes: ""
  });

  // Only show returns that require inspection
  const inspectionQueue = returns.filter(r => 
    r.status === "inspection_required" || r.status === "approved"
  );

  const stats = {
    pending: inspectionQueue.filter(r => r.status === "inspection_required").length,
    completed: returns.filter(r => r.inspectionResult).length,
    approved: returns.filter(r => r.inspectionResult?.disposition === "approve_refund" || r.inspectionResult?.disposition === "approve_replacement").length
  };

  const handleStartInspection = (returnReq: ReturnRequest) => {
    setSelectedReturn(returnReq);
    setInspectionData({
      componentsComplete: true,
      physicalCondition: "good",
      functionalStatus: "working",
      disposition: "approve_refund",
      notes: ""
    });
  };

  const handleCompleteInspection = () => {
    if (!selectedReturn) return;

    if (!inspectionData.notes.trim()) {
      toast.error("Please add inspection notes");
      return;
    }

    // Determine next status based on disposition
    let nextStatus: ReturnRequest["status"];
    let approvedAction: "refund" | "replacement" | undefined;
    
    switch (inspectionData.disposition) {
      case "approve_refund":
        nextStatus = "approved";
        approvedAction = "refund";
        break;
      case "approve_replacement":
        nextStatus = "approved";
        approvedAction = "replacement";
        break;
      case "reject":
        nextStatus = "rejected";
        break;
      default:
        nextStatus = "inspection_required";
    }

    onUpdateReturn(selectedReturn.id, {
      status: nextStatus,
      inspectionResult: {
        ...inspectionData,
        inspectedBy: "Warehouse Tech #12",
        inspectedAt: new Date().toISOString()
      },
      approvedAction: approvedAction,
      refundAmount: approvedAction === "refund" ? selectedReturn.purchasePrice : undefined,
      statusNote: `Inspection completed - ${inspectionData.disposition}`,
      updatedBy: "Warehouse Tech #12",
      automated: false
    });

    toast.success("Inspection completed successfully");
    setSelectedReturn(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Warehouse Inspection</h2>
        <p className="text-sm text-gray-600 mt-1">Physical inspection and condition assessment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Inspection</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Inspection Queue */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-900">Inspection Queue</h3>
          <p className="text-sm text-gray-600 mt-1">
            Items requiring physical inspection and condition assessment
          </p>
        </div>
        
        <div className="divide-y">
          {inspectionQueue.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">No Items in Queue</h3>
              <p className="text-sm text-gray-600">All inspections are complete</p>
            </div>
          ) : (
            inspectionQueue.map((returnReq) => (
              <div key={returnReq.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{returnReq.productName}</h4>
                            <p className="text-sm text-gray-600 mt-1">SKU: {returnReq.productSKU}</p>
                            {returnReq.serialNumber && (
                              <p className="text-sm text-gray-600">Serial: {returnReq.serialNumber}</p>
                            )}
                          </div>
                          <Badge 
                            variant={returnReq.status === "inspection_required" ? "outline" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            {returnReq.status === "inspection_required" ? (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                Awaiting Inspection
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Ready for Pickup
                              </>
                            )}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">RMA Number</p>
                            <p className="font-medium">{returnReq.rmaNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Customer</p>
                            <p className="font-medium">{returnReq.customerName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Return Reason</p>
                            <p className="font-medium capitalize">{returnReq.returnReason.replace(/_/g, " ")}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Value</p>
                            <p className="font-medium">${returnReq.purchasePrice.toFixed(2)}</p>
                          </div>
                        </div>

                        {returnReq.returnReasonDetails && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-600 mb-1">Customer Notes:</p>
                            <p className="text-sm text-gray-900">{returnReq.returnReasonDetails}</p>
                          </div>
                        )}

                        {returnReq.validationResult && (
                          <div className="flex items-center gap-4 text-sm mb-4">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-green-600" />
                              Pre-validated
                            </Badge>
                            <span className="text-gray-600">
                              Eligibility: {returnReq.eligibilityScore}%
                            </span>
                          </div>
                        )}

                        {returnReq.inspectionResult ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 mb-2">Inspection Completed</h5>
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                  <div>
                                    <span className="text-gray-600">Condition:</span>
                                    <span className="ml-2 font-medium capitalize">{returnReq.inspectionResult.physicalCondition}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Status:</span>
                                    <span className="ml-2 font-medium capitalize">{returnReq.inspectionResult.functionalStatus}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">{returnReq.inspectionResult.notes}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  By {returnReq.inspectionResult.inspectedBy} on {new Date(returnReq.inspectionResult.inspectedAt!).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleStartInspection(returnReq)}
                            className="w-full sm:w-auto"
                          >
                            <Search className="w-4 h-4 mr-2" />
                            Start Inspection
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Inspection Dialog */}
      {selectedReturn && (
        <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Physical Inspection - {selectedReturn.rmaNumber}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{selectedReturn.productName}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">SKU:</span>
                    <span className="ml-2 font-medium">{selectedReturn.productSKU}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Serial:</span>
                    <span className="ml-2 font-medium">{selectedReturn.serialNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <span className="ml-2 font-medium">{selectedReturn.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Return Reason:</span>
                    <span className="ml-2 font-medium capitalize">{selectedReturn.returnReason.replace(/_/g, " ")}</span>
                  </div>
                </div>
                {selectedReturn.returnReasonDetails && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600 mb-1">Customer Notes:</p>
                    <p className="text-sm text-gray-900">{selectedReturn.returnReasonDetails}</p>
                  </div>
                )}
              </div>

              {/* Inspection Checklist */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Inspection Checklist</h3>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={inspectionData.componentsComplete}
                      onCheckedChange={(checked) => 
                        setInspectionData(prev => ({ ...prev, componentsComplete: checked as boolean }))
                      }
                    />
                    <span>All components and accessories present</span>
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Physical Condition</Label>
                  <Select 
                    value={inspectionData.physicalCondition} 
                    onValueChange={(value: any) => 
                      setInspectionData(prev => ({ ...prev, physicalCondition: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent - Like new</SelectItem>
                      <SelectItem value="good">Good - Minor wear</SelectItem>
                      <SelectItem value="fair">Fair - Visible wear</SelectItem>
                      <SelectItem value="poor">Poor - Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Functional Status</Label>
                  <Select 
                    value={inspectionData.functionalStatus} 
                    onValueChange={(value: any) => 
                      setInspectionData(prev => ({ ...prev, functionalStatus: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="working">Working - No issues found</SelectItem>
                      <SelectItem value="defective">Defective - Issue confirmed</SelectItem>
                      <SelectItem value="damaged">Damaged - Physical damage affecting function</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Disposition</Label>
                  <Select 
                    value={inspectionData.disposition} 
                    onValueChange={(value: any) => 
                      setInspectionData(prev => ({ ...prev, disposition: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve_refund">Approve - Full Refund</SelectItem>
                      <SelectItem value="approve_replacement">Approve - Replacement</SelectItem>
                      <SelectItem value="reject">Reject - Not eligible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Inspection Notes (Required)</Label>
                  <Textarea
                    value={inspectionData.notes}
                    onChange={(e) => setInspectionData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Document condition, defects found, component status, etc..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className={`rounded-lg p-4 ${
                inspectionData.disposition === "approve_refund" ? "bg-green-50 border border-green-200" :
                inspectionData.disposition === "approve_replacement" ? "bg-blue-50 border border-blue-200" :
                inspectionData.disposition === "reject" ? "bg-red-50 border border-red-200" :
                "bg-gray-50 border border-gray-200"
              }`}>
                <h4 className="font-semibold text-gray-900 mb-2">Inspection Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Components:</span>
                    <span className="font-medium">
                      {inspectionData.componentsComplete ? "Complete" : "Incomplete"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Condition:</span>
                    <span className="font-medium capitalize">{inspectionData.physicalCondition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Functional:</span>
                    <span className="font-medium capitalize">{inspectionData.functionalStatus}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Decision:</span>
                    <span className="font-bold capitalize">
                      {inspectionData.disposition.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedReturn(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCompleteInspection}
                  disabled={!inspectionData.notes.trim()}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Inspection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
