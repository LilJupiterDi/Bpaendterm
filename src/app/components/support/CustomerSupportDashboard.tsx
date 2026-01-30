import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { ReturnRequest } from "@/app/data/mockData";
import { Search, Eye, Clock, CheckCircle2, XCircle, AlertTriangle, Zap, Package, TrendingUp } from "lucide-react";

interface CustomerSupportDashboardProps {
  returns: ReturnRequest[];
  onUpdateReturn: (id: string, updates: Partial<ReturnRequest>) => void;
}

export function CustomerSupportDashboard({ returns, onUpdateReturn }: CustomerSupportDashboardProps) {
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = {
    pending: returns.filter(r => r.status === "new" || r.status === "pre_validated").length,
    inspection: returns.filter(r => r.status === "inspection_required").length,
    approved: returns.filter(r => r.status === "approved").length,
    automated: returns.filter(r => r.validationResult?.autoApproved).length
  };

  const filteredReturns = returns.filter(r => {
    const matchesFilter = filterStatus === "all" || r.status === filterStatus;
    const matchesSearch = !searchQuery || 
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rmaNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ReturnRequest["status"]) => {
    const statusMap = {
      new: { label: "New", variant: "outline" as const, icon: Package },
      pre_validated: { label: "Pre-Validated", variant: "secondary" as const, icon: CheckCircle2 },
      rejected_auto: { label: "Auto-Rejected", variant: "destructive" as const, icon: XCircle },
      appeal_requested: { label: "Appeal Requested", variant: "outline" as const, icon: AlertTriangle },
      under_review: { label: "Under Review", variant: "secondary" as const, icon: Clock },
      approved_after_review: { label: "Approved After Review", variant: "default" as const, icon: CheckCircle2 },
      final_rejection: { label: "Final Rejection", variant: "destructive" as const, icon: XCircle },
      inspection_required: { label: "Inspection Required", variant: "outline" as const, icon: AlertTriangle },
      approved: { label: "Approved", variant: "default" as const, icon: CheckCircle2 },
      rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
      refund_processing: { label: "Refund Processing", variant: "secondary" as const, icon: Clock },
      replacement_processing: { label: "Replacement Processing", variant: "secondary" as const, icon: Clock },
      completed: { label: "Completed", variant: "default" as const, icon: CheckCircle2 }
    };
    const config = statusMap[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Support Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Monitor and manage return requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Needs Inspection</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inspection}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Auto-Processed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.automated}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Automated
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by order #, customer, or RMA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Returns</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="pre_validated">Pre-Validated</SelectItem>
              <SelectItem value="inspection_required">Needs Inspection</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected_auto">Auto-Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Returns Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.map((returnReq) => (
                <TableRow key={returnReq.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="text-sm">{returnReq.id}</p>
                      {returnReq.rmaNumber && (
                        <p className="text-xs text-blue-600">{returnReq.rmaNumber}</p>
                      )}
                      {returnReq.validationResult?.autoApproved && (
                        <Badge variant="outline" className="text-xs mt-1 flex items-center gap-1 w-fit">
                          <Zap className="w-3 h-3 text-green-600" />
                          Auto
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{returnReq.customerName}</p>
                      <p className="text-xs text-gray-500">{returnReq.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{returnReq.productName}</p>
                      <p className="text-xs text-gray-500">{returnReq.productSKU}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{returnReq.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(returnReq.purchaseDate).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>{getStatusBadge(returnReq.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(returnReq.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReturn(returnReq)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Return Details Dialog */}
      {selectedReturn && (
        <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Return Details - {selectedReturn.id}</DialogTitle>
            </DialogHeader>
            <ReturnDetailsView returnRequest={selectedReturn} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ReturnDetailsView({ returnRequest }: { returnRequest: ReturnRequest }) {
  return (
    <div className="space-y-6">
      {/* System Integration Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">System Integration Status</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            {returnRequest.erpSynced ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600" />
            )}
            <span className="text-sm">ERP (1C)</span>
          </div>
          <div className="flex items-center gap-2">
            {returnRequest.wmsSynced ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600" />
            )}
            <span className="text-sm">WMS</span>
          </div>
          <div className="flex items-center gap-2">
            {returnRequest.posSynced ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600" />
            )}
            <span className="text-sm">POS</span>
          </div>
        </div>
      </div>

      {/* Customer & Order Info */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{returnRequest.customerName}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium">{returnRequest.customerPhone}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{returnRequest.customerEmail}</span>
            </div>
            {returnRequest.loyaltyId && (
              <div>
                <span className="text-gray-600">Loyalty ID:</span>
                <span className="ml-2 font-medium">{returnRequest.loyaltyId}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Order #:</span>
              <span className="ml-2 font-medium">{returnRequest.orderNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">Purchase Date:</span>
              <span className="ml-2 font-medium">{new Date(returnRequest.purchaseDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Receipt ID:</span>
              <span className="ml-2 font-medium">{returnRequest.receiptId}</span>
            </div>
            <div>
              <span className="text-gray-600">Purchase Price:</span>
              <span className="ml-2 font-medium">${returnRequest.purchasePrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Information</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Product:</span>
            <span className="font-medium">{returnRequest.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SKU:</span>
            <span className="font-medium">{returnRequest.productSKU}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{returnRequest.productCategory}</span>
          </div>
          {returnRequest.serialNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Serial #:</span>
              <span className="font-medium">{returnRequest.serialNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Return Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Return Details</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">Reason:</span>
            <span className="ml-2 font-medium capitalize">{returnRequest.returnReason.replace(/_/g, " ")}</span>
          </div>
          <div>
            <span className="text-gray-600">Requested Action:</span>
            <span className="ml-2 font-medium capitalize">{returnRequest.requestedAction}</span>
          </div>
          {returnRequest.returnReasonDetails && (
            <div>
              <span className="text-gray-600 block mb-1">Details:</span>
              <p className="bg-gray-50 rounded p-3 text-gray-900">{returnRequest.returnReasonDetails}</p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {returnRequest.validationResult && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Validation Results
            {returnRequest.validationResult.autoApproved && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Zap className="w-3 h-3 text-green-600" />
                Auto-Approved
              </Badge>
            )}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Within Return Window</span>
              {returnRequest.validationResult.withinReturnWindow ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Category Allowed</span>
              {returnRequest.validationResult.categoryAllowed ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Warranty Valid</span>
              {returnRequest.validationResult.warrantyValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            {returnRequest.eligibilityScore && (
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="font-medium">Eligibility Score</span>
                <Badge variant={returnRequest.eligibilityScore >= 70 ? "default" : "destructive"}>
                  {returnRequest.eligibilityScore}%
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status History */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Status History</h3>
        <div className="space-y-3">
          {returnRequest.statusHistory.map((history, index) => (
            <div key={index} className="flex gap-3 text-sm">
              <div className="flex-shrink-0 w-1 bg-blue-200 rounded" />
              <div className="flex-1 pb-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{history.note}</p>
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
          ))}
        </div>
      </div>
    </div>
  );
}