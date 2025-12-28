import { Invoice, PurchaseOrder, DeliveryNote } from '../types';
import { AuditLogger } from '../utils/logger';

export class DecisionEngine {
  constructor(private logger: AuditLogger) {}

  decide(
    originalInvoice: Invoice,
    correctedInvoice: Invoice,
    corrections: string[],
    pos: PurchaseOrder[],
    dns: DeliveryNote[]
  ): {
    requiresHumanReview: boolean;
    reasoning: string;
    confidenceScore: number;
  } {
    const issues: string[] = [];
    let confidenceScore = 0.8;

    
    if (!correctedInvoice.fields.serviceDate) {
      issues.push('Missing service date');
      confidenceScore -= 0.2;
    }

    if (!correctedInvoice.fields.currency) {
      issues.push('Missing currency');
      confidenceScore -= 0.1;
    }

   
    if (!correctedInvoice.fields.poNumber) {
      const matchingPOs = pos.filter(po => {
        if (po.vendor !== correctedInvoice.vendor) return false;
        
        
        const invoiceSkus = correctedInvoice.fields.lineItems
          .map(li => li.sku)
          .filter((sku): sku is string => sku !== null && sku !== undefined);
        
        
        const poSkus = po.lineItems.map(li => li.sku);
        
        
        return invoiceSkus.some(invSku => poSkus.includes(invSku));
      });

      if (matchingPOs.length === 1) {
        correctedInvoice.fields.poNumber = matchingPOs[0].poNumber;
        corrections.push(`Matched to PO: ${matchingPOs[0].poNumber}`);
        this.logger.log('decide', `Auto-matched single PO`);
      } else if (matchingPOs.length > 1) {
        issues.push('Multiple PO matches - needs clarification');
        confidenceScore -= 0.3;
      } else {
        issues.push('No matching PO found');
        confidenceScore -= 0.2;
      }
    }
    if (correctedInvoice.fields.poNumber) {
      const dn = dns.find(d => d.poNumber === correctedInvoice.fields.poNumber);
      if (dn) {
        correctedInvoice.fields.lineItems.forEach(item => {
          const dnItem = dn.lineItems.find(d => d.sku === item.sku);
          if (dnItem && dnItem.qtyDelivered !== item.qty) {
            issues.push(`Qty mismatch: Invoice=${item.qty}, Delivered=${dnItem.qtyDelivered}`);
            confidenceScore -= 0.2;
          }
        });
      }
    }

    
    if (originalInvoice.confidence < 0.65) {
      issues.push('Low extraction confidence - possible duplicate or quality issue');
      confidenceScore -= 0.2;
    }

    if (corrections.length > 0) {
      confidenceScore += 0.1;
    }

    confidenceScore = Math.max(0, Math.min(1, confidenceScore));

    const requiresHumanReview = confidenceScore < 0.7 || issues.length > 0;

    let reasoning = '';
    if (corrections.length > 0) {
      reasoning += `Applied ${corrections.length} correction(s). `;
    }
    if (issues.length > 0) {
      reasoning += `Issues: ${issues.join('; ')}. `;
    }
    if (!requiresHumanReview) {
      reasoning += 'High confidence - auto-approved.';
    } else {
      reasoning += 'Requires human review due to unresolved issues.';
    }

    this.logger.log('decide', reasoning);

    return { requiresHumanReview, reasoning, confidenceScore };
  }
}