import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { ReturnRequest } from "@/app/data/mockData";
import { AlertTriangle, CheckCircle2, XCircle, Eye, TrendingUp, Zap, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface OperationalManagerDashboardProps {
  returns: ReturnRequest[];
  onUpdateReturn: (id: string, updates: Partial<ReturnRequest>) => void;
}

export function OperationalManagerDashboard({ returns, onUpdateReturn }: OperationalManagerDashboardProps) {
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [approvalNote, setApprovalNote] = useState("");

  // Only show appeals and exception cases that require manager approval
  const appealCases = returns.filter(r => 
    r.status === "appeal_requested" || 
    r.status === "under_review" ||
    (r.requiresManagerApproval && r.isException)
  );
  
  const stats = {
    appeals: appealCases.filter(r => r.status === "appeal_requested" || r.status === "under_review").length,
    automationRate: ((returns.filter(r => r.validationResult?.autoApproved).length / returns.length) * 100).toFixed(1),
    avgCycleTime: "2.3 days",
    totalValue: returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0)
  };

  const handleApprove = () => {
    if (!selectedReturn) return;
    
    // Check if this is an appeal case
    const isAppeal = selectedReturn.status === "appeal_requested" || selectedReturn.status === "under_review";
    
    if (isAppeal && selectedReturn.appealRequest) {
      // Approve the appeal
      onUpdateReturn(selectedReturn.id, {
        status: "approved_after_review",
        requiresManagerApproval: false,
        appealRequest: {
          ...selectedReturn.appealRequest,
          reviewedAt: new Date().toISOString(),
          reviewedBy: "Operations Manager",
          reviewDecision: "approved",
          reviewNotes: approvalNote
        },
        statusNote: `Appeal approved by manager: ${approvalNote}`,
        updatedBy: "Operations Manager",
        automated: false
      });
      toast.success("Appeal approved - customer will be notified");
    } else {
      onUpdateReturn(selectedReturn.id, {
        status: "approved",
        requiresManagerApproval: false,
        statusNote: `Manager approved: ${approvalNote}`,
        updatedBy: "Operations Manager",
        automated: false
      });
      toast.success("Return approved by manager");
    }
    
    setSelectedReturn(null);
    setApprovalNote("");
  };

  const handleReject = () => {
    if (!selectedReturn) return;
    
    // Check if this is an appeal case
    const isAppeal = selectedReturn.status === "appeal_requested" || selectedReturn.status === "under_review";
    
    if (isAppeal && selectedReturn.appealRequest) {
      // Reject the appeal - final rejection
      onUpdateReturn(selectedReturn.id, {
        status: "final_rejection",
        requiresManagerApproval: false,
        appealRequest: {
          ...selectedReturn.appealRequest,
          reviewedAt: new Date().toISOString(),
          reviewedBy: "Operations Manager",
          reviewDecision: "rejected",
          reviewNotes: approvalNote
        },
        statusNote: `Appeal rejected by manager: ${approvalNote}`,
        updatedBy: "Operations Manager",
        automated: false
      });
      toast.error("Appeal rejected - final decision sent to customer");
    } else {
      onUpdateReturn(selectedReturn.id, {
        status: "rejected",
        requiresManagerApproval: false,
        statusNote: `Manager rejected: ${approvalNote}`,
        updatedBy: "Operations Manager",
        automated: false
      });
      toast.error("Return rejected by manager");
    }
    
    setSelectedReturn(null);
    setApprovalNote("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Operational Manager Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Exception-based oversight - only review cases requiring approval</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Exception Cases</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.appeals}</p>
              <p className="text-xs text-amber-600 mt-1">Require approval</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Automation Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.automationRate}%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Auto-processed
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Cycle Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgCycleTime}</p>
              <p className="text-xs text-blue-600 mt-1">Target: &lt;3 days</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Refund Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${stats.totalValue.toFixed(0)}</p>
              <p className="text-xs text-gray-600 mt-1">This period</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Exception Cases Table */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-900">Exception Cases Requiring Approval</h3>
          <p className="text-sm text-gray-600 mt-1">
            Only returns that fall outside automated rules are shown here
          </p>
        </div>
        
        {appealCases.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">All Clear!</h3>
            <p className="text-sm text-gray-600">
              No exception cases requiring manager approval at this time.
            </p>
            <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              Automation is handling all standard returns
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Exception Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appealCases.map((returnReq) => (
                  <TableRow key={returnReq.id}>
                    <TableCell className="font-medium">
                      {returnReq.id}
                      {returnReq.rmaNumber && (
                        <p className="text-xs text-blue-600">{returnReq.rmaNumber}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{returnReq.customerName}</p>
                        <p className="text-xs text-gray-500">{returnReq.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{returnReq.productName}</p>
                        <p className="text-xs text-gray-500">${returnReq.purchasePrice.toFixed(2)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${returnReq.refundAmount?.toFixed(2) || returnReq.purchasePrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {(returnReq.status === "appeal_requested" || returnReq.status === "under_review") ? (
                        <Badge variant="outline" className="bg-blue-50">Customer Appeal</Badge>
                      ) : (
                        <Badge variant="outline">High Value</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          returnReq.priorityLevel === "urgent" ? "destructive" : 
                          returnReq.priorityLevel === "high" ? "default" : 
                          "secondary"
                        }
                      >
                        {returnReq.priorityLevel.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReturn(returnReq)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Approval Dialog */}
      {selectedReturn && (
        <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manager Approval Required - {selectedReturn.id}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Appeal Information (if appeal case) */}
              {(selectedReturn.status === "appeal_requested" || selectedReturn.status === "under_review") && selectedReturn.appealRequest && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    Customer Appeal Request
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Appeal Reason:</span>
                      <p className="text-gray-900 mt-1">{selectedReturn.appealRequest.appealReason}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Customer Statement:</span>
                      <p className="text-gray-900 mt-1 bg-white p-3 rounded border border-blue-200 italic">
                        "{selectedReturn.appealRequest.appealDetails}"
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Appeal submitted: {new Date(selectedReturn.appealRequest.requestedAt).toLocaleString()}
                    </div>
                  </div>
                </Card>
              )}

              {/* Original Rejection Info (if appeal case) */}
              {selectedReturn.rejectionInfo && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Original Rejection</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Reason:</span>
                      <p className="text-gray-900 mt-1">{selectedReturn.rejectionInfo.rejectionReason}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Details:</span>
                      <p className="text-gray-900 mt-1">{selectedReturn.rejectionInfo.rejectionDetails}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Exception Details (non-appeal cases) */}
              {!selectedReturn.appealRequest && (
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Exception Reason
                  </h3>
                  <p className="text-sm text-gray-700">
                    This return exceeds the standard refund threshold of $500 and requires manager approval.
                  </p>
                </Card>
              )}

              {/* Return Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedReturn.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">{selectedReturn.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="font-medium">{selectedReturn.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchase Price</p>
                  <p className="font-medium">${selectedReturn.purchasePrice.toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Return Reason</p>
                  <p className="font-medium capitalize">{selectedReturn.returnReason.replace(/_/g, " ")}</p>
                  {selectedReturn.returnReasonDetails && (
                    <p className="text-sm text-gray-700 mt-1">{selectedReturn.returnReasonDetails}</p>
                  )}
                </div>
              </div>

              {/* Validation Info */}
              {selectedReturn.validationResult && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2">Automated Validation Results</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Within Return Window</span>
                      {selectedReturn.validationResult.withinReturnWindow ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Category Allowed</span>
                      {selectedReturn.validationResult.categoryAllowed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Inspection Results if available */}
              {selectedReturn.inspectionResult && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2">Warehouse Inspection</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Physical Condition:</span>
                      <span className="font-medium capitalize">{selectedReturn.inspectionResult.physicalCondition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Functional Status:</span>
                      <span className="font-medium capitalize">{selectedReturn.inspectionResult.functionalStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Components Complete:</span>
                      {selectedReturn.inspectionResult.componentsComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    {selectedReturn.inspectionResult.notes && (
                      <p className="mt-2 pt-2 border-t text-gray-700">{selectedReturn.inspectionResult.notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Manager Note */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  Manager Note (Required)
                </label>
                <Textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Enter your approval or rejection reason..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={handleApprove}
                  disabled={!approvalNote.trim()}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Return
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={!approvalNote.trim()}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Return
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}