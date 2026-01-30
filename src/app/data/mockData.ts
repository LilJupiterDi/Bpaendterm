export type ReturnStatus = 
  | "new" 
  | "pre_validated" 
  | "rejected_auto"
  | "appeal_requested"
  | "under_review"
  | "approved_after_review"
  | "final_rejection"
  | "inspection_required" 
  | "approved" 
  | "rejected" 
  | "completed"
  | "refund_processing"
  | "replacement_processing";

export interface StatusHistoryItem {
  status: ReturnStatus;
  timestamp: string;
  note: string;
  automated: boolean;
  user?: string;
}

export interface AppealRequest {
  appealReason: string;
  appealDetails: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewDecision?: "approved" | "rejected";
  reviewNotes?: string;
}

export interface CustomerFeedback {
  rating?: number; // 1-5 stars
  comments?: string;
  submittedAt?: string;
}

export interface RejectionInfo {
  rejectionReason: string;
  rejectionDetails: string;
  rejectedAt: string;
  canAppeal: boolean;
  appealDeadline?: string;
}

export interface ReturnRequest {
  id: string;
  rmaNumber?: string;
  
  // Customer Info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  loyaltyId?: string;
  
  // Order Info
  orderNumber: string;
  purchaseDate: string;
  receiptId: string;
  
  // Product Info
  productName: string;
  productSKU: string;
  productCategory: string;
  serialNumber?: string;
  purchasePrice: number;
  
  // Return Info
  returnReason: string;
  returnReasonDetails: string;
  requestedAction: "refund" | "replacement";
  
  // Validation
  status: ReturnStatus;
  eligibilityScore?: number;
  validationResult?: {
    withinReturnWindow: boolean;
    categoryAllowed: boolean;
    warrantyValid: boolean;
    conditionAcceptable: boolean;
    autoApproved: boolean;
  };
  
  // Inspection (if required)
  requiresInspection: boolean;
  inspectionResult?: {
    componentsComplete: boolean;
    physicalCondition: "excellent" | "good" | "fair" | "poor";
    functionalStatus: "working" | "defective" | "damaged";
    disposition: "approve_refund" | "approve_replacement" | "reject" | "pending";
    notes: string;
    inspectedBy?: string;
    inspectedAt?: string;
  };
  
  // Resolution
  approvedAction?: "refund" | "replacement";
  refundAmount?: number;
  replacementSKU?: string;
  
  // System Integration
  erpSynced: boolean;
  wmsSynced: boolean;
  posSynced: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  statusHistory: StatusHistoryItem[];
  
  // Flags
  requiresManagerApproval: boolean;
  isException: boolean;
  priorityLevel: "normal" | "high" | "urgent";
  
  // Rejection & Appeal
  rejectionInfo?: RejectionInfo;
  appealRequest?: AppealRequest;
  customerFeedback?: CustomerFeedback;
  
  statusNote?: string;
  automated?: boolean;
}

export const mockReturns: ReturnRequest[] = [
  {
    id: "RET-2024-0001",
    rmaNumber: "RMA-2024-0001",
    customerName: "Sarah Johnson",
    customerPhone: "+1-555-0123",
    customerEmail: "sarah.j@email.com",
    loyaltyId: "LOY-892345",
    orderNumber: "ORD-2024-1523",
    purchaseDate: "2024-01-15",
    receiptId: "RCP-1523-2024",
    productName: "Wireless Noise-Canceling Headphones XM5",
    productSKU: "WH-XM5-BLK",
    productCategory: "Audio",
    serialNumber: "WH5-2024-892345",
    purchasePrice: 349.99,
    returnReason: "defective",
    returnReasonDetails: "Left speaker produces crackling sound",
    requestedAction: "refund",
    status: "inspection_required",
    eligibilityScore: 95,
    validationResult: {
      withinReturnWindow: true,
      categoryAllowed: true,
      warrantyValid: true,
      conditionAcceptable: true,
      autoApproved: false
    },
    requiresInspection: true,
    erpSynced: true,
    wmsSynced: true,
    posSynced: true,
    createdAt: "2024-01-28T09:15:00Z",
    updatedAt: "2024-01-28T09:20:00Z",
    requiresManagerApproval: false,
    isException: false,
    priorityLevel: "normal",
    statusHistory: [
      {
        status: "new",
        timestamp: "2024-01-28T09:15:00Z",
        note: "Return request created via QR code",
        automated: true
      },
      {
        status: "pre_validated",
        timestamp: "2024-01-28T09:15:30Z",
        note: "Automatic validation passed - inspection required due to defective claim",
        automated: true
      },
      {
        status: "inspection_required",
        timestamp: "2024-01-28T09:20:00Z",
        note: "Routed to warehouse for physical inspection",
        automated: true
      }
    ]
  },
  {
    id: "RET-2024-0002",
    rmaNumber: "RMA-2024-0002",
    customerName: "Michael Chen",
    customerPhone: "+1-555-0456",
    customerEmail: "m.chen@email.com",
    orderNumber: "ORD-2024-1498",
    purchaseDate: "2024-01-20",
    receiptId: "RCP-1498-2024",
    productName: "4K Smart TV 55 inch",
    productSKU: "TV-55-4K-SMART",
    productCategory: "Television",
    serialNumber: "TV4K-2024-445678",
    purchasePrice: 799.99,
    returnReason: "changed_mind",
    returnReasonDetails: "Found better deal elsewhere",
    requestedAction: "refund",
    status: "approved",
    eligibilityScore: 88,
    validationResult: {
      withinReturnWindow: true,
      categoryAllowed: true,
      warrantyValid: true,
      conditionAcceptable: true,
      autoApproved: true
    },
    requiresInspection: false,
    approvedAction: "refund",
    refundAmount: 799.99,
    erpSynced: true,
    wmsSynced: true,
    posSynced: true,
    createdAt: "2024-01-27T14:30:00Z",
    updatedAt: "2024-01-27T14:35:00Z",
    requiresManagerApproval: false,
    isException: false,
    priorityLevel: "normal",
    statusHistory: [
      {
        status: "new",
        timestamp: "2024-01-27T14:30:00Z",
        note: "Return request created via website",
        automated: true
      },
      {
        status: "pre_validated",
        timestamp: "2024-01-27T14:30:45Z",
        note: "Automatic validation passed",
        automated: true
      },
      {
        status: "approved",
        timestamp: "2024-01-27T14:35:00Z",
        note: "Auto-approved - fast track path (unopened, within window)",
        automated: true
      }
    ]
  },
  {
    id: "RET-2024-0003",
    customerName: "Emma Rodriguez",
    customerPhone: "+1-555-0789",
    customerEmail: "emma.r@email.com",
    orderNumber: "ORD-2024-1234",
    purchaseDate: "2023-11-10",
    receiptId: "RCP-1234-2023",
    productName: "Laptop Pro 15 inch",
    productSKU: "LAPTOP-PRO-15",
    productCategory: "Computers",
    purchasePrice: 1299.99,
    returnReason: "not_as_expected",
    returnReasonDetails: "Performance not as advertised",
    requestedAction: "refund",
    status: "rejected_auto",
    eligibilityScore: 25,
    validationResult: {
      withinReturnWindow: false,
      categoryAllowed: true,
      warrantyValid: false,
      conditionAcceptable: false,
      autoApproved: false
    },
    requiresInspection: false,
    rejectionInfo: {
      rejectionReason: "Outside Return Window",
      rejectionDetails: "This item was purchased 79 days ago, which exceeds our 30-day return window. Our return policy allows returns within 30 days of purchase for most electronics.",
      rejectedAt: "2024-01-28T11:20:15Z",
      canAppeal: true,
      appealDeadline: "2024-02-04T11:20:15Z"
    },
    erpSynced: true,
    wmsSynced: false,
    posSynced: true,
    createdAt: "2024-01-28T11:20:00Z",
    updatedAt: "2024-01-28T11:20:15Z",
    requiresManagerApproval: false,
    isException: false,
    priorityLevel: "normal",
    statusHistory: [
      {
        status: "new",
        timestamp: "2024-01-28T11:20:00Z",
        note: "Return request created via in-store terminal",
        automated: true
      },
      {
        status: "rejected_auto",
        timestamp: "2024-01-28T11:20:15Z",
        note: "Auto-rejected: Outside 30-day return window (79 days since purchase)",
        automated: true
      }
    ]
  },
  {
    id: "RET-2024-0004",
    rmaNumber: "RMA-2024-0004",
    customerName: "James Wilson",
    customerPhone: "+1-555-0321",
    customerEmail: "j.wilson@email.com",
    loyaltyId: "LOY-445566",
    orderNumber: "ORD-2024-1605",
    purchaseDate: "2024-01-22",
    receiptId: "RCP-1605-2024",
    productName: "Gaming Console NextGen",
    productSKU: "CONSOLE-NEXTGEN",
    productCategory: "Gaming",
    serialNumber: "GC-2024-778899",
    purchasePrice: 499.99,
    returnReason: "wrong_item",
    returnReasonDetails: "Ordered digital edition, received disc version",
    requestedAction: "replacement",
    status: "completed",
    eligibilityScore: 100,
    validationResult: {
      withinReturnWindow: true,
      categoryAllowed: true,
      warrantyValid: true,
      conditionAcceptable: true,
      autoApproved: true
    },
    requiresInspection: false,
    approvedAction: "replacement",
    replacementSKU: "CONSOLE-NEXTGEN-DIGITAL",
    erpSynced: true,
    wmsSynced: true,
    posSynced: true,
    createdAt: "2024-01-26T10:00:00Z",
    updatedAt: "2024-01-26T15:30:00Z",
    requiresManagerApproval: false,
    isException: false,
    priorityLevel: "high",
    statusHistory: [
      {
        status: "new",
        timestamp: "2024-01-26T10:00:00Z",
        note: "Return request created via customer support call",
        automated: false,
        user: "Support Agent #23"
      },
      {
        status: "pre_validated",
        timestamp: "2024-01-26T10:01:00Z",
        note: "Automatic validation passed",
        automated: true
      },
      {
        status: "approved",
        timestamp: "2024-01-26T10:05:00Z",
        note: "Auto-approved for replacement - wrong item shipped",
        automated: true
      },
      {
        status: "replacement_processing",
        timestamp: "2024-01-26T14:00:00Z",
        note: "Replacement order created in WMS",
        automated: true
      },
      {
        status: "completed",
        timestamp: "2024-01-26T15:30:00Z",
        note: "Replacement shipped to customer",
        automated: true
      }
    ]
  },
  {
    id: "RET-2024-0005",
    rmaNumber: "RMA-2024-0005",
    customerName: "Lisa Anderson",
    customerPhone: "+1-555-0654",
    customerEmail: "lisa.a@email.com",
    orderNumber: "ORD-2024-1450",
    purchaseDate: "2024-01-10",
    receiptId: "RCP-1450-2024",
    productName: "Smart Watch Pro",
    productSKU: "WATCH-PRO-BLK",
    productCategory: "Wearables",
    serialNumber: "SW-2024-334455",
    purchasePrice: 399.99,
    returnReason: "defective",
    returnReasonDetails: "Battery drains within 4 hours",
    requestedAction: "refund",
    status: "approved",
    eligibilityScore: 92,
    validationResult: {
      withinReturnWindow: true,
      categoryAllowed: true,
      warrantyValid: true,
      conditionAcceptable: true,
      autoApproved: false
    },
    requiresInspection: true,
    inspectionResult: {
      componentsComplete: true,
      physicalCondition: "good",
      functionalStatus: "defective",
      disposition: "approve_refund",
      notes: "Confirmed battery issue - drains to 0% in 3.5 hours. All accessories included.",
      inspectedBy: "Warehouse Tech #12",
      inspectedAt: "2024-01-28T13:45:00Z"
    },
    approvedAction: "refund",
    refundAmount: 399.99,
    erpSynced: true,
    wmsSynced: true,
    posSynced: true,
    createdAt: "2024-01-28T08:00:00Z",
    updatedAt: "2024-01-28T14:00:00Z",
    requiresManagerApproval: false,
    isException: false,
    priorityLevel: "normal",
    statusHistory: [
      {
        status: "new",
        timestamp: "2024-01-28T08:00:00Z",
        note: "Return request created via mobile app",
        automated: true
      },
      {
        status: "pre_validated",
        timestamp: "2024-01-28T08:00:30Z",
        note: "Automatic validation passed",
        automated: true
      },
      {
        status: "inspection_required",
        timestamp: "2024-01-28T08:01:00Z",
        note: "Routed to warehouse for defect verification",
        automated: true
      },
      {
        status: "approved",
        timestamp: "2024-01-28T14:00:00Z",
        note: "Inspection completed - defect confirmed, refund approved",
        automated: false,
        user: "Warehouse Tech #12"
      }
    ]
  },
  {
    id: "RET-2024-0006",
    rmaNumber: "RMA-2024-0006",
    customerName: "David Martinez",
    customerPhone: "+1-555-0987",
    customerEmail: "d.martinez@email.com",
    loyaltyId: "LOY-998877",
    orderNumber: "ORD-2024-1590",
    purchaseDate: "2024-01-18",
    receiptId: "RCP-1590-2024",
    productName: "Wireless Earbuds Premium",
    productSKU: "EARBUD-PREM-WHT",
    productCategory: "Audio",
    purchasePrice: 179.99,
    returnReason: "defective",
    returnReasonDetails: "Right earbud not charging",
    requestedAction: "replacement",
    status: "refund_processing",
    eligibilityScore: 90,
    validationResult: {
      withinReturnWindow: true,
      categoryAllowed: true,
      warrantyValid: true,
      conditionAcceptable: true,
      autoApproved: false
    },
    requiresInspection: true,
    inspectionResult: {
      componentsComplete: true,
      physicalCondition: "excellent",
      functionalStatus: "defective",
      disposition: "approve_refund",
      notes: "Right earbud charging issue confirmed. Replacement SKU out of stock - issuing refund instead.",
      inspectedBy: "Warehouse Tech #8",
      inspectedAt: "2024-01-28T12:30:00Z"
    },
    approvedAction: "refund",
    refundAmount: 179.99,
    erpSynced: true,
    wmsSynced: true,
    posSynced: false,
    createdAt: "2024-01-28T10:15:00Z",
    updatedAt: "2024-01-28T13:00:00Z",
    requiresManagerApproval: false,
    isException: false,
    priorityLevel: "normal",
    statusHistory: [
      {
        status: "new",
        timestamp: "2024-01-28T10:15:00Z",
        note: "Return request created via QR code",
        automated: true
      },
      {
        status: "pre_validated",
        timestamp: "2024-01-28T10:15:45Z",
        note: "Automatic validation passed",
        automated: true
      },
      {
        status: "inspection_required",
        timestamp: "2024-01-28T10:16:00Z",
        note: "Routed to warehouse for inspection",
        automated: true
      },
      {
        status: "approved",
        timestamp: "2024-01-28T12:45:00Z",
        note: "Inspection completed - approved for refund",
        automated: false,
        user: "Warehouse Tech #8"
      },
      {
        status: "refund_processing",
        timestamp: "2024-01-28T13:00:00Z",
        note: "Refund transaction initiated in POS system",
        automated: true
      }
    ]
  },
  {
    id: "RET-2024-0007",
    customerName: "Robert Thompson",
    customerPhone: "+1-555-0244",
    customerEmail: "r.thompson@email.com",
    orderNumber: "ORD-2024-1122",
    purchaseDate: "2023-12-05",
    receiptId: "RCP-1122-2023",
    productName: "Tablet Pro 12 inch",
    productSKU: "TABLET-PRO-12",
    productCategory: "Tablets",
    purchasePrice: 899.99,
    returnReason: "defective",
    returnReasonDetails: "Screen flickering intermittently. I believe this is a manufacturing defect covered under warranty.",
    requestedAction: "refund",
    status: "appeal_requested",
    eligibilityScore: 30,
    validationResult: {
      withinReturnWindow: false,
      categoryAllowed: true,
      warrantyValid: true,
      conditionAcceptable: true,
      autoApproved: false
    },
    requiresInspection: false,
    rejectionInfo: {
      rejectionReason: "Outside Return Window",
      rejectionDetails: "This item was purchased 54 days ago, which exceeds our 30-day return window. Our return policy allows returns within 30 days of purchase for most electronics.",
      rejectedAt: "2024-01-28T15:10:15Z",
      canAppeal: true,
      appealDeadline: "2024-02-04T15:10:15Z"
    },
    appealRequest: {
      appealReason: "Warranty Coverage",
      appealDetails: "While I understand the return window has passed, this appears to be a manufacturing defect that should be covered under the 1-year warranty. The screen flickering started only 2 weeks ago, well within the warranty period. I would appreciate a review of this case as a warranty claim rather than a standard return.",
      requestedAt: "2024-01-28T16:30:00Z"
    },
    erpSynced: true,
    wmsSynced: false,
    posSynced: true,
    createdAt: "2024-01-28T15:10:00Z",
    updatedAt: "2024-01-28T16:30:00Z",
    requiresManagerApproval: true,
    isException: true,
    priorityLevel: "high",
    statusHistory: [
      {
        status: "new",
        timestamp: "2024-01-28T15:10:00Z",
        note: "Return request created via website",
        automated: true
      },
      {
        status: "rejected_auto",
        timestamp: "2024-01-28T15:10:15Z",
        note: "Auto-rejected: Outside 30-day return window (54 days since purchase)",
        automated: true
      },
      {
        status: "appeal_requested",
        timestamp: "2024-01-28T16:30:00Z",
        note: "Customer requested appeal review - Warranty claim",
        automated: false
      }
    ]
  },
  {
    id: "RET-2024-0008",
    customerName: "Patricia Lee",
    customerPhone: "+1-555-0377",
    customerEmail: "p.lee@email.com",
    loyaltyId: "LOY-556677",
    orderNumber: "ORD-2024-0988",
    purchaseDate: "2023-10-15",
    receiptId: "RCP-0988-2023",
    productName: "Camera Lens 50mm",
    productSKU: "LENS-50MM-PRO",
    productCategory: "Camera Accessories",
    purchasePrice: 649.99,
    returnReason: "changed_mind",
    returnReasonDetails: "Upgrading to a different focal length",
    requestedAction: "refund",
    status: "final_rejection",
    eligibilityScore: 15,
    validationResult: {
      withinReturnWindow: false,
      categoryAllowed: true,
      warrantyValid: false,
      conditionAcceptable: true,
      autoApproved: false
    },
    requiresInspection: false,
    rejectionInfo: {
      rejectionReason: "Outside Return Window",
      rejectionDetails: "This item was purchased 105 days ago, which exceeds our 30-day return window. Our return policy allows returns within 30 days of purchase.",
      rejectedAt: "2024-01-27T10:15:20Z",
      canAppeal: true,
      appealDeadline: "2024-02-03T10:15:20Z"
    },
    appealRequest: {
      appealReason: "Loyal Customer Exception",
      appealDetails: "I am a Gold tier loyalty member and have been shopping here for 5 years. I would appreciate an exception to the return policy given my loyalty status.",
      requestedAt: "2024-01-27T14:00:00Z",
      reviewedAt: "2024-01-27T16:45:00Z",
      reviewedBy: "Operations Manager",
      reviewDecision: "rejected",
      reviewNotes: "While we appreciate your loyalty, the item was purchased over 3 months ago and shows signs of use. Our policy exceptions are typically limited to defective items or within 45 days of purchase. We recommend selling through our trade-in program instead."
    },
    customerFeedback: {
      rating: 2,
      comments: "Disappointed with the rigid policy. I expected more flexibility as a loyal customer.",
      submittedAt: "2024-01-27T17:30:00Z"
    },
    erpSynced: true,
    wmsSynced: false,
    posSynced: true,
    createdAt: "2024-01-27T10:15:00Z",
    updatedAt: "2024-01-27T17:30:00Z",
    requiresManagerApproval: false,
    isException: true,
    priorityLevel: "normal",
    statusHistory: [
      {
        status: "new",
        timestamp: "2024-01-27T10:15:00Z",
        note: "Return request created via mobile app",
        automated: true
      },
      {
        status: "rejected_auto",
        timestamp: "2024-01-27T10:15:20Z",
        note: "Auto-rejected: Outside 30-day return window (105 days since purchase)",
        automated: true
      },
      {
        status: "appeal_requested",
        timestamp: "2024-01-27T14:00:00Z",
        note: "Customer requested appeal review - Loyalty exception",
        automated: false
      },
      {
        status: "under_review",
        timestamp: "2024-01-27T15:30:00Z",
        note: "Case assigned to Operations Manager for review",
        automated: true
      },
      {
        status: "final_rejection",
        timestamp: "2024-01-27T16:45:00Z",
        note: "Appeal rejected by Operations Manager - Policy exception not warranted",
        automated: false,
        user: "Operations Manager"
      }
    ]
  }
];