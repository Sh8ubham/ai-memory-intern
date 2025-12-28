import * as fs from 'fs';
import * as path from 'path';
import { MemoryStore } from './memory/MemoryStore';
import { RecallEngine } from './engine/RecallEngine';
import { ApplyEngine } from './engine/ApplyEngine';
import { DecisionEngine } from './engine/DecisionEngine';
import { LearningEngine } from './engine/LearningEngine';
import { AuditLogger } from './utils/logger';
import { Invoice, PurchaseOrder, DeliveryNote, HumanCorrection, ProcessedInvoice } from './types';


const invoices: Invoice[] = JSON.parse(fs.readFileSync('./data/invoices_extracted.json', 'utf-8'));
const pos: PurchaseOrder[] = JSON.parse(fs.readFileSync('./data/purchase_orders.json', 'utf-8'));
const dns: DeliveryNote[] = JSON.parse(fs.readFileSync('./data/delivery_notes.json', 'utf-8'));
const corrections: HumanCorrection[] = JSON.parse(fs.readFileSync('./data/human_corrections.json', 'utf-8'));


const memory = new MemoryStore();
const logger = new AuditLogger();

const recallEngine = new RecallEngine(memory, logger);
const applyEngine = new ApplyEngine(logger);
const decisionEngine = new DecisionEngine(logger);
const learningEngine = new LearningEngine(memory, logger);

console.log(' AI Agent Memory System - Starting...\n');


invoices.forEach((invoice, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(` Processing Invoice ${index + 1}/${invoices.length}: ${invoice.invoiceId}`);
  console.log(`   Vendor: ${invoice.vendor}`);
  console.log(`${'='.repeat(60)}\n`);

  logger.clear();

  
  const recalled = recallEngine.recallForInvoice(invoice);

  
  const { correctedInvoice, corrections: appliedCorrections } = applyEngine.applyCorrections(
    invoice,
    recalled.vendorPatterns
  );

  
  const decision = decisionEngine.decide(invoice, correctedInvoice, appliedCorrections, pos, dns);

 
  const output: ProcessedInvoice = {
    normalizedInvoice: correctedInvoice,
    proposedCorrections: appliedCorrections,
    requiresHumanReview: decision.requiresHumanReview,
    reasoning: decision.reasoning,
    confidenceScore: decision.confidenceScore,
    memoryUpdates: [],
    auditTrail: logger.getTrail()
  };

  
  const humanCorrection = corrections.find(c => c.invoiceId === invoice.invoiceId);
  if (humanCorrection) {
    console.log(`\n Learning from human correction...`);
    const updates = learningEngine.learnFromCorrection(humanCorrection);
    output.memoryUpdates = updates;
    updates.forEach(u => console.log(`   ✓ ${u}`));
  }

  
  const outputPath = `./output/results/${invoice.invoiceId}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n Summary:`);
  console.log(`   Corrections Applied: ${appliedCorrections.length}`);
  console.log(`   Confidence Score: ${(decision.confidenceScore * 100).toFixed(1)}%`);
  console.log(`   Requires Review: ${decision.requiresHumanReview ? ' YES' : ' NO'}`);
  console.log(`   Memory Updates: ${output.memoryUpdates.length}`);
  console.log(`   Output: ${outputPath}`);
});

console.log(`\n${'='.repeat(60)}`);
console.log(` Processing Complete!`);
console.log(` Results saved to: ./output/results/`);
console.log(` Memory saved to: ./data/memory.json`);
console.log(`${'='.repeat(60)}\n`);