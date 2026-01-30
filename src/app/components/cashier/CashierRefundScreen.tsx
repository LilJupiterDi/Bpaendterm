import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { ReturnRequest } from "@/app/data/mockData";
import { DollarSign, Package, CheckCircle2, Search, CreditCard, Banknote, Zap } from "lucide-react";
import { toast } from "sonner";

interface CashierRefundScreenProps {
  returns: ReturnRequest[];
  onUpdateReturn: (id: string, updates: Partial<ReturnRequest>) => void;
}

export function CashierRefundScreen({ returns, onUpdateReturn }: CashierRefundScreenProps) {
  const [searchRMA, setSearchRMA] = useState("");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("original");
  const [processing, setProcessing] = useState(false);

  // Only show approved returns ready for refund/replacement
  const readyForProcessing = returns.filter(r => 
    r.status === "approved" && r.approvedAction && !r.refundAmount
  );

  const stats = {
    pending: readyForProcessing.length,
    processedToday: returns.filter(r => r.status === "completed").length,
    totalRefunded: returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0)
  };

  const handleSearchRMA = () => {
    const found = returns.find(r => 
      r.rmaNumber?.toLowerCase() === searchRMA.toLowerCase() ||
      r.orderNumber.toLowerCase() === searchRMA.toLowerCase()
    );
    
    if (found && found.status === "approved" && found.approvedAction) {
      setSelectedReturn(found);
    } else if (found) {
      toast.error("This return is not ready for processing yet");
    } else {
      toast.error("RMA number not found");
    }
  };

  const handleProcessRefund = () => {
    if (!selectedReturn) return;

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      onUpdateReturn(selectedReturn.id, {
        status: "completed",
        refundAmount: selectedReturn.purchasePrice,
        statusNote: `Refund processed via ${paymentMethod}`,
        updatedBy: "Cashier",
        automated: false,
        posSynced: true
      });

      toast.success(`Refund of $${selectedReturn.purchasePrice.toFixed(2)} processed successfully`);
      setSelectedReturn(null);
      setSearchRMA("");
      setPaymentMethod("original");
      setProcessing(false);
    }, 1500);
  };

  const handleProcessReplacement = () => {
    if (!selectedReturn) return;

    setProcessing(true);

    // Simulate replacement processing
    setTimeout(() => {
      onUpdateReturn(selectedReturn.id, {
        status: "completed",
        replacementSKU: selectedReturn.productSKU,
        statusNote: "Replacement item provided to customer",
        updatedBy: "Cashier",
        automated: false,
        wmsSynced: true
      });

      toast.success("Replacement processed successfully");
      setSelectedReturn(null);
      setSearchRMA("");
      setProcessing(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cashier - Refund & Replacement</h2>
        <p className="text-sm text-gray-600 mt-1">Process approved returns and issue refunds</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Ready to Process</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Processed Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processedToday}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Refunded</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${stats.totalRefunded.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* RMA Lookup */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Lookup Return by RMA</h3>
        <div className="flex gap-3">
          <Input
            placeholder="Enter RMA number or Order number"
            value={searchRMA}
            onChange={(e) => setSearchRMA(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchRMA()}
            className="flex-1"
          />
          <Button onClick={handleSearchRMA}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Ready for Processing Queue */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-900">Ready for Processing</h3>
          <p className="text-sm text-gray-600 mt-1">
            Approved returns awaiting refund or replacement
          </p>
        </div>
        
        <div className="divide-y">
          {readyForProcessing.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">All Caught Up!</h3>
              <p className="text-sm text-gray-600">No returns waiting to be processed</p>
            </div>
          ) : (
            readyForProcessing.map((returnReq) => (
              <div key={returnReq.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-lg ${
                        returnReq.approvedAction === "refund" ? "bg-green-100" : "bg-blue-100"
                      }`}>
                        {returnReq.approvedAction === "refund" ? (
                          <DollarSign className={`w-6 h-6 ${
                            returnReq.approvedAction === "refund" ? "text-green-600" : "text-blue-600"
                          }`} />
                        ) : (
                          <Package className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{returnReq.productName}</h4>
                            <p className="text-sm text-gray-600">RMA: {returnReq.rmaNumber}</p>
                          </div>
                          <Badge 
                            variant={returnReq.approvedAction === "refund" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {returnReq.approvedAction}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Customer</p>
                            <p className="font-medium">{returnReq.customerName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Order Number</p>
                            <p className="font-medium">{returnReq.orderNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-medium text-green-600">${returnReq.purchasePrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Method</p>
                            <p className="font-medium capitalize">{returnReq.approvedAction}</p>
                          </div>
                        </div>

                        {returnReq.validationResult?.autoApproved && (
                          <Badge variant="outline" className="mb-4 flex items-center gap-1 w-fit">
                            <Zap className="w-3 h-3 text-green-600" />
                            Auto-approved
                          </Badge>
                        )}

                        {returnReq.inspectionResult && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm">
                            <p className="text-gray-600">Inspection Notes:</p>
                            <p className="text-gray-900 mt-1">{returnReq.inspectionResult.notes}</p>
                          </div>
                        )}

                        <Button 
                          onClick={() => setSelectedReturn(returnReq)}
                          className="w-full sm:w-auto"
                        >
                          {returnReq.approvedAction === "refund" ? (
                            <>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Process Refund
                            </>
                          ) : (
                            <>
                              <Package className="w-4 h-4 mr-2" />
                              Process Replacement
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Processing Dialog */}
      {selectedReturn && (
        <Dialog open={!!selectedReturn} onOpenChange={() => !processing && setSelectedReturn(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedReturn.approvedAction === "refund" ? "Process Refund" : "Process Replacement"} - {selectedReturn.rmaNumber}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Return Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Return Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedReturn.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{selectedReturn.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{selectedReturn.productSKU}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{selectedReturn.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-medium">
                      {new Date(selectedReturn.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${selectedReturn.purchasePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Integration */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  System Integration
                </h4>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>ERP Synced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>WMS Updated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>POS Ready</span>
                  </div>
                </div>
              </div>

              {selectedReturn.approvedAction === "refund" ? (
                <>
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label>Refund Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Original Payment Method (Recommended)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="store_credit">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>Store Credit (+10% bonus)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4" />
                            <span>Cash</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Refund Amount Display */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Refund Amount</p>
                    <p className="text-4xl font-bold text-green-700">
                      ${selectedReturn.purchasePrice.toFixed(2)}
                    </p>
                    {paymentMethod === "store_credit" && (
                      <p className="text-sm text-green-600 mt-2">
                        +${(selectedReturn.purchasePrice * 0.1).toFixed(2)} bonus = ${(selectedReturn.purchasePrice * 1.1).toFixed(2)} store credit
                      </p>
                    )}
                  </div>

                  {/* Process Button */}
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={handleProcessRefund}
                    disabled={processing}
                  >
                    {processing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5 mr-2" />
                        Process Refund ${selectedReturn.purchasePrice.toFixed(2)}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {/* Replacement Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Replacement Product</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product:</span>
                        <span className="font-medium">{selectedReturn.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-medium">{selectedReturn.productSKU}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                      ✓ Verify replacement item is the same or equivalent model
                      <br />
                      ✓ Check item is in new/like-new condition
                      <br />
                      ✓ Include all original accessories
                    </div>
                  </div>

                  {/* Process Button */}
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={handleProcessReplacement}
                    disabled={processing}
                  >
                    {processing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Package className="w-5 h-5 mr-2" />
                        Provide Replacement Item
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
