export interface Invoice {
    invoiceId : string;
    vendor : string;
    fields : {
        invoiceNumber : string;
        invoiceDate : string;
        serviceDate? : string | null;
        currency : string | null;
        poNumber : string | null;
        netTotal : number;
        taxRate : number;
        taxTotal : number;
        grossTotal : number;
        lineItems : LineItem[] ;
    };
    confidence : number;
    rawText : string;
}

export interface LineItem{
    sku? : string |  null;
    description? : string;
    qty :number;
    unitPrice: number;
}

export interface PurchaseOrder{
    poNumber : string;
    vendor : string;
    date: string;
    lineItems:{
        sku : string ;
        qty : number;
        unitPrice : number;
    }[];
}

export interface DeliveryNote {
  dnNumber: string;
  vendor: string;
  poNumber: string;
  date: string;
  lineItems: {
    sku: string;
    qtyDelivered: number;
  }[];
}


export interface HumanCorrection {
  invoiceId: string;
  vendor: string;
  corrections: {
    field: string;
    from: any;
    to: any;
    reason: string;
  }[];
  finalDecision: 'approved' | 'rejected';
}


export interface VendorPattern {
  vendor: string;
  pattern: string;
  field: string;
  action: string;
  confidence: number;
  timesApplied: number;
  lastUsed: string;
}

export interface CorrectionPattern {
  pattern: string;
  field: string;
  correction: string;
  confidence: number;
  timesApplied: number;
}

export interface ResolutionRecord {
  invoiceId: string;
  decision: 'approved' | 'rejected';
  corrections: any[];
  timestamp: string;
}


export interface MemoryDatabase {
  vendorPatterns: VendorPattern[];
  correctionPatterns: CorrectionPattern[];
  resolutions: ResolutionRecord[];
}


export interface ProcessedInvoice {
  normalizedInvoice: Invoice;
  proposedCorrections: string[];
  requiresHumanReview: boolean;
  reasoning: string;
  confidenceScore: number;
  memoryUpdates: string[];
  auditTrail: AuditStep[];
}

export interface AuditStep {
  step: 'recall' | 'apply' | 'decide' | 'learn';
  timestamp: string;
  details: string;
}