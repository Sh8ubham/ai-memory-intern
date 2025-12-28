import { MemoryStore } from '../memory/MemoryStore';
import { HumanCorrection, VendorPattern, CorrectionPattern } from '../types';
import { AuditLogger } from '../utils/logger';

export class LearningEngine {
  constructor(
    private memory: MemoryStore,
    private logger: AuditLogger
  ) {}

  learnFromCorrection(correction: HumanCorrection): string[] {
    const updates: string[] = [];

    if (correction.finalDecision !== 'approved') {
      this.logger.log('learn', `Skipped learning - correction was rejected`);
      return updates;
    }

    for (const corr of correction.corrections) {
      if (corr.field === 'serviceDate' && corr.reason.includes('Leistungsdatum')) {
        const pattern: VendorPattern = {
          vendor: correction.vendor,
          pattern: 'Leistungsdatum',
          field: 'serviceDate',
          action: 'extract_from_rawText',
          confidence: 0.7,
          timesApplied: 1,
          lastUsed: new Date().toISOString()
        };
        this.memory.addVendorPattern(pattern);
        updates.push(`Learned: ${correction.vendor} uses 'Leistungsdatum' for service date`);
        this.logger.log('learn', `Stored vendor pattern: Leistungsdatum`);
      }

      if (corr.field === 'taxTotal' && corr.reason.toLowerCase().includes('vat included')) {
        const pattern: VendorPattern = {
          vendor: correction.vendor,
          pattern: 'MwSt. inkl.',
          field: 'taxTotal',
          action: 'recalculate_from_gross',
          confidence: 0.75,
          timesApplied: 1,
          lastUsed: new Date().toISOString()
        };
        this.memory.addVendorPattern(pattern);
        updates.push(`Learned: ${correction.vendor} includes VAT in totals`);
        this.logger.log('learn', `Stored VAT pattern`);
      }

      if (corr.field === 'currency' && corr.reason.includes('rawText')) {
        const pattern: VendorPattern = {
          vendor: correction.vendor,
          pattern: 'Currency in rawText',
          field: 'currency',
          action: 'extract_from_rawText',
          confidence: 0.8,
          timesApplied: 1,
          lastUsed: new Date().toISOString()
        };
        this.memory.addVendorPattern(pattern);
        updates.push(`Learned: Extract currency from rawText for ${correction.vendor}`);
        this.logger.log('learn', `Stored currency extraction pattern`);
      }

      
      if (corr.field === 'poNumber') {
        const pattern: VendorPattern = {
          vendor: correction.vendor,
          pattern: 'PO matching by items',
          field: 'poNumber',
          action: 'match_by_sku',
          confidence: 0.7,
          timesApplied: 1,
          lastUsed: new Date().toISOString()
        };
        this.memory.addVendorPattern(pattern);
        updates.push(`Learned: Match PO by SKU for ${correction.vendor}`);
        this.logger.log('learn', `Stored PO matching pattern`);
      }

      
      if (corr.field.includes('sku') && corr.to === 'FREIGHT') {
        const pattern: VendorPattern = {
          vendor: correction.vendor,
          pattern: 'Seefracht/Shipping',
          field: 'lineItems[0].sku',
          action: 'map_to_FREIGHT',
          confidence: 0.75,
          timesApplied: 1,
          lastUsed: new Date().toISOString()
        };
        this.memory.addVendorPattern(pattern);
        updates.push(`Learned: Map transport descriptions to FREIGHT SKU`);
        this.logger.log('learn', `Stored freight mapping pattern`);
      }

      if (corr.field === 'discountTerms') {
        const pattern: VendorPattern = {
          vendor: correction.vendor,
          pattern: 'Skonto',
          field: 'discountTerms',
          action: 'extract_skonto',
          confidence: 0.8,
          timesApplied: 1,
          lastUsed: new Date().toISOString()
        };
        this.memory.addVendorPattern(pattern);
        updates.push(`Learned: Capture Skonto terms for ${correction.vendor}`);
        this.logger.log('learn', `Stored Skonto pattern`);
      }
    }

    this.memory.saveMemory();
    this.logger.log('learn', `Memory saved with ${updates.length} new patterns`);

    return updates;
  }
}