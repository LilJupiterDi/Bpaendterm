import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { ReturnRequest } from "@/app/data/mockData";
import { Smartphone, Monitor, Zap, CheckCircle2, XCircle, AlertCircle, Loader2, Calendar, Package, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ReturnRequestFormProps {
  onSubmit: (returnData: Omit<ReturnRequest, "id" | "createdAt" | "updatedAt" | "statusHistory">) => void;
}

export function ReturnRequestForm({ onSubmit }: ReturnRequestFormProps) {
  const [entryMethod, setEntryMethod] = useState<"phone" | "manual">("phone");
  const [receiptLookupValue, setReceiptLookupValue] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [receiptFound, setReceiptFound] = useState(false);
  const [validationStep, setValidationStep] = useState(0); // 0 = not started, 1 = validating, 2 = complete
  const [autoValidationResult, setAutoValidationResult] = useState<any>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; url: string; name: string }>>([]);
  
  // Form fields
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerEmail: "",
    customerName: "",
    loyaltyId: "",
    orderNumber: "",
    purchaseDate: "",
    productName: "",
    productSKU: "",
    productCategory: "",
    purchasePrice: "",
    returnReason: "",
    returnReasonDetails: "",
    requestedAction: "refund" as "refund" | "replacement"
  });

  // Mock receipt data for lookup
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

  const handleLookupReceipt = async () => {
    if (!receiptLookupValue) {
      toast.error("Please enter phone number or loyalty ID");
      return;
    }

    setIsLookingUp(true);

    // Simulate ERP lookup
    setTimeout(() => {
      setReceiptFound(true);
      setIsLookingUp(false);
      setFormData({
        customerPhone: mockReceipt.customerPhone,
        customerEmail: mockReceipt.customerEmail,
        customerName: mockReceipt.customerName,
        orderNumber: mockReceipt.orderNumber,
        purchaseDate: mockReceipt.purchaseDate,
        productName: mockReceipt.productName,
        productSKU: mockReceipt.productSKU,
        productCategory: mockReceipt.productCategory,
        purchasePrice: mockReceipt.purchasePrice.toString(),
        returnReason: "",
        returnReasonDetails: "",
        requestedAction: "refund"
      });
      toast.success("Receipt found in ERP system! Information auto-filled.");
    }, 1200);
  };

  const handleAutoValidate = async () => {
    if (!formData.orderNumber || !formData.purchaseDate) {
      toast.error("Please fill order information first");
      return;
    }

    setValidationStep(1);

    // Simulate multi-step validation process
    const steps = [
      { name: "Checking return window", delay: 500 },
      { name: "Validating product category", delay: 400 },
      { name: "Checking warranty status", delay: 600 },
      { name: "Calculating eligibility score", delay: 400 }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, steps[i].delay));
    }

    // Calculate validation
    const purchaseDate = new Date(formData.purchaseDate);
    const today = new Date();
    const daysSincePurchase = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const withinWindow = daysSincePurchase <= 30;
    const categoryAllowed = true;
    const warrantyValid = daysSincePurchase <= 365;
    
    const validation = {
      withinReturnWindow: withinWindow,
      categoryAllowed: categoryAllowed,
      warrantyValid: warrantyValid,
      conditionAcceptable: true,
      autoApproved: withinWindow && categoryAllowed && formData.returnReason !== "defective",
      eligibilityScore: withinWindow && categoryAllowed ? 92 : 25,
      daysSincePurchase: daysSincePurchase
    };

    setAutoValidationResult(validation);
    setValidationStep(2);

    if (!withinWindow) {
      toast.error(`This item is outside the 30-day return window (${daysSincePurchase} days since purchase)`);
    } else if (validation.autoApproved) {
      toast.success("✓ Pre-validation passed! Your return can be auto-approved.");
    } else {
      toast.info("Pre-validation passed. Physical inspection will be required.");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newPhoto = {
            id: `photo-${Date.now()}-${Math.random()}`,
            url: event.target?.result as string,
            name: file.name
          };
          setUploadedPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    toast.success("Photo(s) uploaded");
  };

  const handleRemovePhoto = (photoId: string) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only validate that at least some basic info is provided
    if (!formData.productName && !formData.orderNumber) {
      toast.error("Please provide at least product name or order number");
      return;
    }

    if (!autoValidationResult) {
      toast.error("Please run automatic validation first");
      return;
    }

    if (!formData.returnReason) {
      toast.error("Please select return reason");
      return;
    }

    // Determine status based on validation
    let status: ReturnRequest["status"];
    let rejectionInfo = undefined;
    
    if (!autoValidationResult.withinReturnWindow) {
      status = "rejected_auto";
      rejectionInfo = {
        rejectionReason: "Outside Return Window",
        rejectionDetails: `This item was purchased ${autoValidationResult.daysSincePurchase} days ago, which exceeds our 30-day return window. Our return policy allows returns within 30 days of purchase for most electronics.`,
        rejectedAt: new Date().toISOString(),
        canAppeal: true,
        appealDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    } else if (autoValidationResult.autoApproved) {
      status = "approved";
    } else {
      status = "inspection_required";
    }

    const returnData: Omit<ReturnRequest, "id" | "createdAt" | "updatedAt" | "statusHistory"> = {
      rmaNumber: autoValidationResult.withinReturnWindow ? `RMA-${Date.now()}` : undefined,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || "",
      loyaltyId: formData.loyaltyId,
      orderNumber: formData.orderNumber,
      purchaseDate: formData.purchaseDate,
      receiptId: receiptFound ? mockReceipt.receiptId : `RCP-${Date.now()}`,
      productName: formData.productName,
      productSKU: formData.productSKU,
      productCategory: formData.productCategory || "Electronics",
      serialNumber: receiptFound ? mockReceipt.serialNumber : undefined,
      purchasePrice: parseFloat(formData.purchasePrice),
      returnReason: formData.returnReason,
      returnReasonDetails: formData.returnReasonDetails,
      requestedAction: formData.requestedAction,
      status: status,
      eligibilityScore: autoValidationResult.eligibilityScore,
      validationResult: autoValidationResult,
      requiresInspection: !autoValidationResult.autoApproved && autoValidationResult.withinReturnWindow,
      rejectionInfo: rejectionInfo,
      erpSynced: true,
      wmsSynced: autoValidationResult.withinReturnWindow,
      posSynced: true,
      requiresManagerApproval: false,
      isException: false,
      priorityLevel: "normal"
    };

    onSubmit(returnData);

    if (status === "rejected_auto") {
      toast.error("Return request rejected - you can appeal this decision in the Track Return tab");
    } else if (status === "approved") {
      toast.success("✓ Return auto-approved! You can bring the item to any store location.");
    } else {
      toast.success("Return request submitted! Physical inspection will be required at the warehouse.");
    }

    // Reset form
    setReceiptFound(false);
    setAutoValidationResult(null);
    setValidationStep(0);
    setReceiptLookupValue("");
    setFormData({
      customerPhone: "",
      customerEmail: "",
      customerName: "",
      loyaltyId: "",
      orderNumber: "",
      purchaseDate: "",
      productName: "",
      productSKU: "",
      productCategory: "",
      purchasePrice: "",
      returnReason: "",
      returnReasonDetails: "",
      requestedAction: "refund"
    });
    setUploadedPhotos([]);
  };

  const canProceedToValidation = formData.orderNumber && formData.purchaseDate && formData.productName;

  return (
    <div className="space-y-4">
      {/* Entry Method Selection */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How would you like to start?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant={entryMethod === "phone" ? "default" : "outline"}
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setEntryMethod("phone")}
          >
            <Smartphone className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">Phone Lookup</div>
              <div className="text-xs opacity-80">Auto-fill from ERP</div>
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
              <div className="text-xs opacity-80">Type all details</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Receipt Lookup */}
      {entryMethod === "phone" && !receiptFound && (
        <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3 mb-4">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Automated Receipt Lookup</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter your phone number or loyalty ID to find your purchase in our ERP system
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Phone: +1-555-0111 or Loyalty ID"
                value={receiptLookupValue}
                onChange={(e) => setReceiptLookupValue(e.target.value)}
                className="flex-1"
                disabled={isLookingUp}
              />
              <Button onClick={handleLookupReceipt} disabled={isLookingUp}>
                {isLookingUp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  "Lookup"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Try: +1-555-0111 or any phone number
            </p>
          </div>
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
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    Receipt Found in ERP
                    <Badge variant="outline" className="bg-white">
                      <Zap className="w-3 h-3 mr-1 text-green-600" />
                      Auto-filled
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Information automatically retrieved from 1C ERP system</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <span className="ml-2 font-medium">{formData.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Order:</span>
                      <span className="ml-2 font-medium">{formData.orderNumber}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-600">Product:</span>
                      <span className="ml-2 font-medium">{formData.productName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="ml-2 font-medium">{formData.purchaseDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-2 font-medium">${formData.purchasePrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Manual Entry Form */}
          {entryMethod === "manual" && !canProceedToValidation && (
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Information
              </h3>
              <div className="space-y-4">
                {/* Type of Return - First */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label htmlFor="requestedAction" className="text-base font-semibold text-gray-900 mb-3 block">
                    What would you like?
                  </Label>
                  <Select 
                    value={formData.requestedAction} 
                    onValueChange={(value: "refund" | "replacement") => 
                      setFormData(prev => ({ ...prev, requestedAction: value }))
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="refund">💰 Refund - Get money back</SelectItem>
                      <SelectItem value="replacement">🔄 Replacement - Exchange for same item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="+1-555-0123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                      placeholder="ORD-2024-1234 (if you have it)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      placeholder="99.99 (approximate is ok)"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                      placeholder="Wireless Headphones XM5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productSKU">Product SKU</Label>
                    <Input
                      id="productSKU"
                      value={formData.productSKU}
                      onChange={(e) => setFormData(prev => ({ ...prev, productSKU: e.target.value }))}
                      placeholder="WH-XM5-BLK (if available)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productCategory">Category</Label>
                    <Select 
                      value={formData.productCategory}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, productCategory: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Audio">Audio</SelectItem>
                        <SelectItem value="Computers">Computers</SelectItem>
                        <SelectItem value="Television">Television</SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                        <SelectItem value="Smartphones">Smartphones</SelectItem>
                        <SelectItem value="Camera">Camera</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Photo Upload at the bottom */}
                <div className="pt-4 border-t">
                  <Label htmlFor="photos" className="mb-2 block">Product Photos (Optional)</Label>
                  <p className="text-sm text-gray-600 mb-3">Upload photos to help us process your return faster</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <Input
                      id="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Label htmlFor="photos" className="cursor-pointer">
                      <span className="text-sm text-blue-600 font-medium hover:underline">
                        Click to upload
                      </span>
                      <span className="text-sm text-gray-500"> or drag and drop</span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>

                  {/* Uploaded Photos Preview */}
                  {uploadedPhotos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Uploaded Photos ({uploadedPhotos.length})</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {uploadedPhotos.map(photo => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={() => handleRemovePhoto(photo.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Automatic Validation Section */}
          {canProceedToValidation && validationStep === 0 && (
            <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3 mb-3">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    Step 1: Automatic Eligibility Validation
                    <Badge variant="outline" className="bg-white">
                      <Zap className="w-3 h-3 mr-1 text-blue-600" />
                      Automated
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    The system will automatically validate your return against our policies
                  </p>
                </div>
              </div>
              <Button type="button" onClick={handleAutoValidate} className="w-full" size="lg">
                <Zap className="w-4 h-4 mr-2" />
                Run Automatic Validation
              </Button>
            </Card>
          )}

          {/* Validation Process Animation */}
          {validationStep === 1 && (
            <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Running Automated Validation...
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-gray-700">Checking 30-day return window policy...</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-gray-700">Validating product category eligibility...</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-gray-700">Verifying warranty status...</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-gray-700">Calculating eligibility score...</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Validation Results with Decision Process */}
          {autoValidationResult && validationStep === 2 && (
            <>
              <Card className={`p-4 sm:p-6 ${
                !autoValidationResult.withinReturnWindow 
                  ? "bg-red-50 border-red-200"
                  : autoValidationResult.autoApproved
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <div className="flex items-start gap-3 mb-3">
                  {!autoValidationResult.withinReturnWindow ? (
                    <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  ) : autoValidationResult.autoApproved ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                      {!autoValidationResult.withinReturnWindow 
                        ? "❌ Automatic Rejection"
                        : autoValidationResult.autoApproved
                        ? "✓ Fast-Track Approval Path"
                        : "⚠️ Manual Inspection Required"}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {!autoValidationResult.withinReturnWindow 
                        ? "Return does not meet automatic approval criteria"
                        : autoValidationResult.autoApproved
                        ? "All criteria met - can be processed immediately"
                        : "Meets basic criteria but requires warehouse inspection"}
                    </p>

                    {/* Validation Details */}
                    <div className="bg-white rounded-lg p-4 space-y-2 mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">System Decision Logic:</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          {autoValidationResult.withinReturnWindow ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <span className="font-medium">Return Window Check:</span>
                            <span className={`ml-2 ${autoValidationResult.withinReturnWindow ? 'text-green-700' : 'text-red-700'}`}>
                              {autoValidationResult.daysSincePurchase} days since purchase 
                              {autoValidationResult.withinReturnWindow ? ' (within 30-day limit)' : ' (exceeds 30-day limit)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          {autoValidationResult.categoryAllowed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <span className="font-medium">Category Policy:</span>
                            <span className="ml-2 text-gray-700">
                              {formData.productCategory || 'Electronics'} is eligible for returns
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          {autoValidationResult.warrantyValid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <span className="font-medium">Warranty Status:</span>
                            <span className="ml-2 text-gray-700">
                              {autoValidationResult.warrantyValid ? 'Active (within 1 year)' : 'Expired'}
                            </span>
                          </div>
                        </div>

                        {autoValidationResult.withinReturnWindow && (
                          <div className="flex items-start gap-2 text-sm pt-2 border-t">
                            {autoValidationResult.autoApproved ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <span className="font-medium">Final Decision:</span>
                              <span className="ml-2 text-gray-700">
                                {autoValidationResult.autoApproved 
                                  ? 'Auto-approve (no defect claim - fast track)'
                                  : 'Route to warehouse inspection (defective item needs verification)'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Eligibility Score */}
                    <div className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="text-sm font-medium text-gray-900">Overall Eligibility Score:</span>
                      <Badge 
                        variant={autoValidationResult.eligibilityScore >= 70 ? "default" : "destructive"}
                        className="text-base px-3 py-1"
                      >
                        {autoValidationResult.eligibilityScore}%
                      </Badge>
                    </div>

                    {/* Next Steps */}
                    {!autoValidationResult.withinReturnWindow && (
                      <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">⚠️ What happens next?</p>
                        <p className="text-sm text-gray-700">
                          You can still submit this request, but it will be automatically rejected. 
                          You'll have the option to appeal this decision or provide feedback.
                        </p>
                      </div>
                    )}

                    {autoValidationResult.autoApproved && autoValidationResult.withinReturnWindow && (
                      <div className="mt-3 p-3 bg-green-100 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">✓ What happens next?</p>
                        <p className="text-sm text-gray-700">
                          After submission, you'll receive an RMA number immediately. Bring the item to any store location for instant refund processing.
                        </p>
                      </div>
                    )}

                    {!autoValidationResult.autoApproved && autoValidationResult.withinReturnWindow && (
                      <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">ℹ️ What happens next?</p>
                        <p className="text-sm text-gray-700">
                          Your return will be routed to our warehouse for physical inspection. You'll be notified of the decision within 24-48 hours.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Return Details Form - Only show if validation passed or user wants to submit anyway */}
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Step 2: Return Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="returnReason">Reason for Return</Label>
                    <Select 
                      value={formData.returnReason} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, returnReason: value }));
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

                  {/* Only show if not already selected in manual entry */}
                  {receiptFound && (
                    <div className="space-y-2">
                      <Label htmlFor="requestedActionAfterValidation">Preferred Resolution</Label>
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
                          <SelectItem value="refund">💰 Refund - Get money back</SelectItem>
                          <SelectItem value="replacement">🔄 Replacement - Exchange for same item</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Photo upload for receipt found path */}
                  {receiptFound && uploadedPhotos.length === 0 && (
                    <div className="pt-4 border-t">
                      <Label htmlFor="photosAfterValidation" className="mb-2 block">Product Photos (Optional)</Label>
                      <p className="text-sm text-gray-600 mb-3">Upload photos to help us process your return faster</p>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <Input
                          id="photosAfterValidation"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <Label htmlFor="photosAfterValidation" className="cursor-pointer">
                          <span className="text-sm text-blue-600 font-medium hover:underline">
                            Click to upload
                          </span>
                          <span className="text-sm text-gray-500"> or drag and drop</span>
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}

                  {/* Show uploaded photos for both paths */}
                  {uploadedPhotos.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-gray-900 mb-2">Uploaded Photos ({uploadedPhotos.length})</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {uploadedPhotos.map(photo => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={() => handleRemovePhoto(photo.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* Submit Button */}
          {autoValidationResult && validationStep === 2 && (
            <Button type="submit" size="lg" className="w-full">
              {!autoValidationResult.withinReturnWindow 
                ? "Submit Request (Will Be Rejected - Can Appeal)"
                : "Submit Return Request"}
            </Button>
          )}
        </form>
      )}
    </div>
  );
}