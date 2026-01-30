import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { ReturnRequest } from "@/app/data/mockData";
import { RejectionNotification } from "./RejectionNotification";
import { Search, Package, CheckCircle2, XCircle, Clock, AlertCircle, Zap, ArrowRight } from "lucide-react";

interface ReturnStatusTrackingProps {
  returns: ReturnRequest[];
  onUpdateReturn?: (id: string, updates: Partial<ReturnRequest>) => void;
}

export function ReturnStatusTracking({ returns, onUpdateReturn }: ReturnStatusTrackingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  const handleSearch = () => {
    const found = returns.find(r => 
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rmaNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSelectedReturn(found || null);
  };

  const getStatusInfo = (status: ReturnRequest["status"]) => {
    const statusMap = {
      new: { label: "New Request", color: "bg-gray-100 text-gray-800", icon: Package },
      pre_validated: { label: "Pre-Validated", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
      rejected_auto: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
      appeal_requested: { label: "Appeal Requested", color: "bg-amber-100 text-amber-800", icon: AlertCircle },
      under_review: { label: "Under Review", color: "bg-blue-100 text-blue-800", icon: Clock },
      approved_after_review: { label: "Approved After Review", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      final_rejection: { label: "Final Rejection", color: "bg-red-100 text-red-800", icon: XCircle },
      inspection_required: { label: "Inspection Required", color: "bg-amber-100 text-amber-800", icon: AlertCircle },
      approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
      refund_processing: { label: "Refund Processing", color: "bg-purple-100 text-purple-800", icon: Clock },
      replacement_processing: { label: "Replacement Processing", color: "bg-purple-100 text-purple-800", icon: Clock },
      completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle2 }
    };
    return statusMap[status];
  };

  const handleAppealSubmit = (appealData: { appealReason: string; appealDetails: string }) => {
    if (!selectedReturn || !onUpdateReturn) return;

    onUpdateReturn(selectedReturn.id, {
      status: "appeal_requested",
      appealRequest: {
        appealReason: appealData.appealReason,
        appealDetails: appealData.appealDetails,
        requestedAt: new Date().toISOString()
      },
      requiresManagerApproval: true,
      isException: true,
      statusNote: `Customer requested appeal review - ${appealData.appealReason}`,
      automated: false
    });
  };

  const handleFeedbackSubmit = (feedbackData: { rating: number; comments: string }) => {
    if (!selectedReturn || !onUpdateReturn) return;

    onUpdateReturn(selectedReturn.id, {
      customerFeedback: {
        rating: feedbackData.rating,
        comments: feedbackData.comments,
        submittedAt: new Date().toISOString()
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Track Your Return</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter Order #, RMA #, or Return ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Return Details */}
      {selectedReturn && (
        <div className="space-y-4">
          {/* Header */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedReturn.productName}</h3>
                <p className="text-sm text-gray-600 mt-1">SKU: {selectedReturn.productSKU}</p>
                {selectedReturn.rmaNumber && (
                  <p className="text-sm font-medium text-blue-600 mt-1">RMA: {selectedReturn.rmaNumber}</p>
                )}
              </div>
              <Badge className={`${getStatusInfo(selectedReturn.status).color} w-fit`}>
                {getStatusInfo(selectedReturn.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-600">Order Number</p>
                <p className="text-sm font-medium mt-1">{selectedReturn.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Purchase Date</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(selectedReturn.purchaseDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Purchase Price</p>
                <p className="text-sm font-medium mt-1">${selectedReturn.purchasePrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Requested Action</p>
                <p className="text-sm font-medium mt-1 capitalize">{selectedReturn.requestedAction}</p>
              </div>
            </div>

            {selectedReturn.refundAmount && (
              <div className="mt-4 pt-4 border-t bg-green-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Refund Amount</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  ${selectedReturn.refundAmount.toFixed(2)}
                </p>
              </div>
            )}
          </Card>

          {/* Rejection Notification */}
          {(selectedReturn.status === "rejected_auto" || 
            selectedReturn.status === "appeal_requested" || 
            selectedReturn.status === "under_review" ||
            selectedReturn.status === "final_rejection") && selectedReturn.rejectionInfo && (
            <RejectionNotification
              returnRequest={selectedReturn}
              onSubmitAppeal={handleAppealSubmit}
              onSubmitFeedback={handleFeedbackSubmit}
            />
          )}

          {/* Status Timeline */}
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Return Timeline</h3>
            <div className="space-y-4">
              {selectedReturn.statusHistory.map((history, index) => {
                const StatusIcon = getStatusInfo(history.status).icon;
                const isLast = index === selectedReturn.statusHistory.length - 1;
                
                return (
                  <div key={index} className="relative">
                    {!isLast && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getStatusInfo(history.status).color} flex items-center justify-center`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-medium text-gray-900">{getStatusInfo(history.status).label}</p>
                            <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                            {history.user && (
                              <p className="text-xs text-gray-500 mt-1">By: {history.user}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {history.automated && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Zap className="w-3 h-3 text-green-600" />
                                Auto
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(history.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Validation Details */}
          {selectedReturn.validationResult && (
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Validation Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  {selectedReturn.validationResult.withinReturnWindow ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">Within Return Window</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedReturn.validationResult.categoryAllowed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">Category Allowed</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedReturn.validationResult.warrantyValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">Warranty Valid</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedReturn.validationResult.autoApproved ? (
                    <Zap className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="text-sm">
                    {selectedReturn.validationResult.autoApproved ? "Auto-Approved" : "Manual Review Required"}
                  </span>
                </div>
              </div>
              {selectedReturn.eligibilityScore && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-sm font-medium">Eligibility Score:</span>
                  <Badge variant={selectedReturn.eligibilityScore >= 70 ? "default" : "destructive"}>
                    {selectedReturn.eligibilityScore}%
                  </Badge>
                </div>
              )}
            </Card>
          )}

          {/* Next Steps */}
          {selectedReturn.status === "approved" && !selectedReturn.approvedAction && (
            <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
              <p className="text-sm text-gray-700 mb-3">
                Your return has been approved! Please bring the item to any store location with your RMA number.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Bring original packaging if available</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Include all accessories and components</span>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* No Results */}
      {searchQuery && !selectedReturn && (
        <Card className="p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No return found with that information</p>
          <p className="text-sm text-gray-500 mt-1">Please check your order number, RMA number, or return ID</p>
        </Card>
      )}
    </div>
  );
}