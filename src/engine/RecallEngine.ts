import { MemoryStore } from '../memory/MemoryStore';
import { Invoice } from '../types';
import { AuditLogger } from '../utils/logger';

export class RecallEngine {
  constructor(
    private memory: MemoryStore,
    private logger: AuditLogger
  ) {}

  recallForInvoice(invoice: Invoice): any {
    const vendor = invoice.vendor;
    const vendorPatterns = this.memory.getVendorPatterns(vendor);
    
    this.logger.log('recall', `Found ${vendorPatterns.length} patterns for ${vendor}`);
    
    
    const relevantPatterns = vendorPatterns.filter(pattern => {
      return invoice.rawText.includes(pattern.pattern);
    });

    this.logger.log('recall', `${relevantPatterns.length} patterns match rawText`);
    
    return {
      vendorPatterns: relevantPatterns,
      allVendorPatterns: vendorPatterns
    };
  }
}