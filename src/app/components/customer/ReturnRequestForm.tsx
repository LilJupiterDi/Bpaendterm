import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { ReturnRequest } from "@/app/data/mockData";
import { QrCode, Smartphone, Monitor, Zap, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ReturnRequestFormProps {
  onSubmit: (returnData: Omit<ReturnRequest, "id" | "createdAt" | "updatedAt" | "statusHistory">) => void;
}

export function ReturnRequestForm({ onSubmit }: ReturnRequestFormProps) {
  const [entryMethod, setEntryMethod] = useState<"qr" | "phone" | "manual">("qr");
  const [receiptLookupValue, setReceiptLookupValue] = useState("");
  const [receiptFound, setReceiptFound] = useState(false);
  const [autoValidationResult, setAutoValidationResult] = useState<any>(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerEmail: "",
    customerName: "",
    loyaltyId: "",
    orderNumber: "",
    productSKU: "",
    returnReason: "",
    returnReasonDetails: "",
    requestedAction: "refund" as "refund" | "replacement"
  });

  // Mock receipt data
  const mockReceipt = {
    orderNumber: "ORD-2024-1650",
    purchaseDate: "2024-01-25",
    receiptId: "RCP-1650-2024",
    productName: "Bluetooth Speaker Pro",
    productSKU: "SPKR-PRO-BLK",
    productCategory: "Audio",
    serialNumber: "SP-2024-556677",
    purchasePrice: 129.99,
    customerName: "Alex Thompson",
    customerPhone: "+1-555-0111",
    customerEmail: "alex.t@email.com"
  };

  const handleLookupReceipt = () => {
    if (!receiptLookupValue) {
      toast.error("Please enter phone number or loyalty ID");
      return;
    }

    // Simulate receipt lookup
    setTimeout(() => {
      setReceiptFound(true);
      setFormData(prev => ({
        ...prev,
        customerPhone: mockReceipt.customerPhone,
        customerEmail: mockReceipt.customerEmail,
        customerName: mockReceipt.customerName,
        orderNumber: mockReceipt.orderNumber,
        productSKU: mockReceipt.productSKU
      }));
      toast.success("Receipt found! Information auto-filled.");
    }, 800);
  };

  const handleAutoValidate = () => {
    // Simulate automatic validation
    const daysSincePurchase = 3; // Mock
    const withinWindow = daysSincePurchase <= 30;
    const categoryAllowed = true;
    const warrantyValid = true;
    
    const validation = {
      withinReturnWindow: withinWindow,
      categoryAllowed: categoryAllowed,
      warrantyValid: warrantyValid,
      conditionAcceptable: true,
      autoApproved: withinWindow && categoryAllowed && formData.returnReason !== "defective",
      eligibilityScore: withinWindow && categoryAllowed ? 92 : 45
    };

    setAutoValidationResult(validation);

    if (!withinWindow) {
      toast.error("This item is outside the 30-day return window");
    } else if (validation.autoApproved) {
      toast.success("Pre-validation passed! Your return can be processed immediately.");
    } else {
      toast.info("Pre-validation passed. Physical inspection will be required.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiptFound) {
      toast.error("Please lookup receipt first");
      return;
    }

    if (!autoValidationResult) {
      toast.error("Please run validation check");
      return;
    }

    if (!formData.returnReason || !formData.requestedAction) {
      toast.error("Please fill all required fields");
      return;
    }

    // Determine status based on validation
    let status: ReturnRequest["status"];
    if (!autoValidationResult.withinReturnWindow) {
      status = "rejected_auto";
    } else if (autoValidationResult.autoApproved) {
      status = "approved";
    } else {
      status = "inspection_required";
    }

    const returnData: Omit<ReturnRequest, "id" | "createdAt" | "updatedAt" | "statusHistory"> = {
      rmaNumber: autoValidationResult.withinReturnWindow ? `RMA-${Date.now()}` : undefined,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      loyaltyId: formData.loyaltyId,
      orderNumber: formData.orderNumber,
      purchaseDate: mockReceipt.purchaseDate,
      receiptId: mockReceipt.receiptId,
      productName: mockReceipt.productName,
      productSKU: formData.productSKU,
      productCategory: mockReceipt.productCategory,
      serialNumber: mockReceipt.serialNumber,
      purchasePrice: mockReceipt.purchasePrice,
      returnReason: formData.returnReason,
      returnReasonDetails: formData.returnReasonDetails,
      requestedAction: formData.requestedAction,
      status: status,
      eligibilityScore: autoValidationResult.eligibilityScore,
      validationResult: autoValidationResult,
      requiresInspection: !autoValidationResult.autoApproved && autoValidationResult.withinReturnWindow,
      erpSynced: true,
      wmsSynced: autoValidationResult.withinReturnWindow,
      posSynced: true,
      requiresManagerApproval: false,
      isException: false,
      priorityLevel: "normal"
    };

    onSubmit(returnData);

    if (status === "rejected_auto") {
      toast.error("Return request rejected automatically - outside return window");
    } else if (status === "approved") {
      toast.success("Return approved! You can bring the item to any store location.");
    } else {
      toast.success("Return request submitted! Physical inspection will be required.");
    }

    // Reset form
    setReceiptFound(false);
    setAutoValidationResult(null);
    setReceiptLookupValue("");
    setFormData({
      customerPhone: "",
      customerEmail: "",
      customerName: "",
      loyaltyId: "",
      orderNumber: "",
      productSKU: "",
      returnReason: "",
      returnReasonDetails: "",
      requestedAction: "refund"
    });
  };

  return (
    <div className="space-y-4">
      {/* Entry Method Selection */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How would you like to start?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant={entryMethod === "qr" ? "default" : "outline"}
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setEntryMethod("qr")}
          >
            <QrCode className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">Scan QR Code</div>
              <div className="text-xs opacity-80">From receipt</div>
            </div>
          </Button>

          <Button
            variant={entryMethod === "phone" ? "default" : "outline"}
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setEntryMethod("phone")}
          >
            <Smartphone className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">Phone Lookup</div>
              <div className="text-xs opacity-80">Auto-fill details</div>
            </div>
          </Button>

          <Button
            variant={entryMethod === "manual" ? "default" : "outline"}
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setEntryMethod("manual")}
          >
            <Monitor className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">Manual Entry</div>
              <div className="text-xs opacity-80">Type details</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Receipt Lookup */}
      {(entryMethod === "phone" || entryMethod === "qr") && !receiptFound && (
        <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3 mb-4">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Automated Receipt Lookup</h3>
              <p className="text-sm text-gray-600 mt-1">
                {entryMethod === "qr" 
                  ? "Scan the QR code on your receipt to auto-fill all details"
                  : "Enter your phone number or loyalty ID to find your purchase"}
              </p>
            </div>
          </div>

          {entryMethod === "phone" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Phone: +1-555-0111 or Loyalty ID"
                  value={receiptLookupValue}
                  onChange={(e) => setReceiptLookupValue(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleLookupReceipt}>
                  Lookup
                </Button>
              </div>
            </div>
          )}

          {entryMethod === "qr" && (
            <div className="bg-white rounded-lg p-8 border-2 border-dashed border-gray-300 text-center">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-3">Position QR code within frame</p>
              <Button size="sm" onClick={handleLookupReceipt}>
                Simulate Scan
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Main Form */}
      {(receiptFound || entryMethod === "manual") && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auto-filled Receipt Info */}
          {receiptFound && (
            <Card className="p-4 sm:p-6 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-3">Receipt Found</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Order:</span>
                      <span className="ml-2 font-medium">{mockReceipt.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">{mockReceipt.purchaseDate}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-600">Product:</span>
                      <span className="ml-2 font-medium">{mockReceipt.productName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">SKU:</span>
                      <span className="ml-2 font-medium">{mockReceipt.productSKU}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-2 font-medium">${mockReceipt.purchasePrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Validation Check */}
          {receiptFound && !autoValidationResult && (
            <Card className="p-4 sm:p-6 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3 mb-3">
                <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Automatic Eligibility Check</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Run validation to check if return is eligible before proceeding
                  </p>
                </div>
              </div>
              <Button type="button" onClick={handleAutoValidate} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Run Validation
              </Button>
            </Card>
          )}

          {/* Validation Results */}
          {autoValidationResult && (
            <Card className={`p-4 sm:p-6 ${
              !autoValidationResult.withinReturnWindow 
                ? "bg-red-50 border-red-200"
                : autoValidationResult.autoApproved
                ? "bg-green-50 border-green-200"
                : "bg-blue-50 border-blue-200"
            }`}>
              <div className="flex items-start gap-3 mb-3">
                {!autoValidationResult.withinReturnWindow ? (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                ) : autoValidationResult.autoApproved ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {!autoValidationResult.withinReturnWindow 
                      ? "Return Not Eligible"
                      : autoValidationResult.autoApproved
                      ? "Pre-Approved - Fast Track"
                      : "Eligible - Inspection Required"}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {autoValidationResult.withinReturnWindow ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Within 30-day return window</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {autoValidationResult.categoryAllowed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Category allowed for returns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {autoValidationResult.warrantyValid ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Warranty status valid</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Eligibility Score:</span>
                      <Badge variant={autoValidationResult.eligibilityScore >= 70 ? "default" : "destructive"}>
                        {autoValidationResult.eligibilityScore}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Return Details Form */}
          {autoValidationResult && autoValidationResult.withinReturnWindow && (
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Return Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="returnReason">Reason for Return *</Label>
                  <Select 
                    value={formData.returnReason} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, returnReason: value }));
                      // Re-run validation when reason changes
                      if (value === "defective") {
                        setAutoValidationResult((prev: any) => ({
                          ...prev,
                          autoApproved: false
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defective">Defective/Not Working</SelectItem>
                      <SelectItem value="wrong_item">Wrong Item Received</SelectItem>
                      <SelectItem value="not_as_expected">Not As Expected</SelectItem>
                      <SelectItem value="changed_mind">Changed Mind</SelectItem>
                      <SelectItem value="found_better_price">Found Better Price</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonDetails">Additional Details</Label>
                  <Textarea
                    id="reasonDetails"
                    value={formData.returnReasonDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnReasonDetails: e.target.value }))}
                    placeholder="Please provide more details about your return..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedAction">Preferred Resolution *</Label>
                  <Select 
                    value={formData.requestedAction} 
                    onValueChange={(value: "refund" | "replacement") => 
                      setFormData(prev => ({ ...prev, requestedAction: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="replacement">Replacement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          {autoValidationResult && autoValidationResult.withinReturnWindow && (
            <Button type="submit" size="lg" className="w-full">
              Submit Return Request
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
