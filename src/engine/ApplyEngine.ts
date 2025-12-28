import { Invoice, VendorPattern } from '../types';
import { AuditLogger } from '../utils/logger';
import { shouldAutoApply } from '../utils/Confidence';

export class ApplyEngine {
  constructor(private logger: AuditLogger) {}

  applyCorrections(invoice: Invoice, patterns: VendorPattern[]): {
    correctedInvoice: Invoice;
    corrections: string[];
  } {
    const correctedInvoice = JSON.parse(JSON.stringify(invoice)); 
    const corrections: string[] = [];

    for (const pattern of patterns) {
      if (!shouldAutoApply(pattern.confidence)) {
        this.logger.log('apply', `Skipped ${pattern.pattern} - low confidence (${pattern.confidence})`);
        continue;
      }

      
      if (pattern.field === 'serviceDate' && pattern.pattern === 'Leistungsdatum') {
        const match = invoice.rawText.match(/Leistungsdatum:\s*(\d{2}\.\d{2}\.\d{4})/);
        if (match) {
          const dateStr = match[1]; 
          const [day, month, year] = dateStr.split('.');
          correctedInvoice.fields.serviceDate = `${year}-${month}-${day}`;
          corrections.push(`Set serviceDate from Leistungsdatum: ${correctedInvoice.fields.serviceDate}`);
          this.logger.log('apply', `Applied serviceDate correction`);
        }
      }

      
      if (pattern.pattern === 'MwSt. inkl.' || pattern.pattern === 'VAT included') {
        const rawTextLower = invoice.rawText.toLowerCase();
        if (rawTextLower.includes('mwst. inkl.') || rawTextLower.includes('vat already included')) {
          
          const netTotal = correctedInvoice.fields.grossTotal / (1 + correctedInvoice.fields.taxRate);
          const taxTotal = correctedInvoice.fields.grossTotal - netTotal;
          
          correctedInvoice.fields.netTotal = Math.round(netTotal * 100) / 100;
          correctedInvoice.fields.taxTotal = Math.round(taxTotal * 100) / 100;
          
          corrections.push(`Recalculated tax - VAT was included in total`);
          this.logger.log('apply', `Applied VAT recalculation`);
        }
      }

      
      if (pattern.field === 'currency' && !correctedInvoice.fields.currency) {
        const match = invoice.rawText.match(/Currency:\s*([A-Z]{3})/i);
        if (match) {
          correctedInvoice.fields.currency = match[1];
          corrections.push(`Extracted currency from rawText: ${match[1]}`);
          this.logger.log('apply', `Applied currency correction`);
        }
      }

      
      if (pattern.pattern.includes('Skonto')) {
        const match = invoice.rawText.match(/(\d+)%\s*Skonto.*?(\d+)\s*days?/i);
        if (match) {
          corrections.push(`Discount terms: ${match[1]}% within ${match[2]} days`);
          this.logger.log('apply', `Captured discount terms`);
        }
      }

      
      if (pattern.field === 'lineItems[0].sku' && pattern.action === 'map_to_FREIGHT') {
        if (invoice.rawText.match(/seefracht|shipping|transport/i)) {
          if (correctedInvoice.fields.lineItems[0] && !correctedInvoice.fields.lineItems[0].sku) {
            correctedInvoice.fields.lineItems[0].sku = 'FREIGHT';
            corrections.push(`Mapped transport description to SKU: FREIGHT`);
            this.logger.log('apply', `Applied freight SKU mapping`);
          }
        }
      }
    }

    return { correctedInvoice, corrections };
  }
}