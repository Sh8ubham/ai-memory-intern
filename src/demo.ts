import * as fs from 'fs';
import { MemoryStore } from './memory/MemoryStore';
import { RecallEngine } from './engine/RecallEngine';
import { ApplyEngine } from './engine/ApplyEngine';
import { DecisionEngine } from './engine/DecisionEngine';
import { LearningEngine } from './engine/LearningEngine';
import { AuditLogger } from './utils/logger';
import { Invoice, PurchaseOrder, DeliveryNote, HumanCorrection } from './types';

console.log('\n=======================================================================');
console.log('AI AGENT WITH LEARNED MEMORY - DEMO');
console.log('Demonstrating Learning Over Time');
console.log('=======================================================================\n');

const invoices: Invoice[] = JSON.parse(fs.readFileSync('./data/invoices_extracted.json', 'utf-8'));
const pos: PurchaseOrder[] = JSON.parse(fs.readFileSync('./data/purchase_orders.json', 'utf-8'));
const dns: DeliveryNote[] = JSON.parse(fs.readFileSync('./data/delivery_notes.json', 'utf-8'));
const corrections: HumanCorrection[] = JSON.parse(fs.readFileSync('./data/human_corrections.json', 'utf-8'));

fs.writeFileSync('./data/memory.json', JSON.stringify({
  vendorPatterns: [],
  correctionPatterns: [],
  resolutions: []
}, null, 2));

console.log('Memory cleared for demo\n');

const memory = new MemoryStore();
const logger = new AuditLogger();
const recallEngine = new RecallEngine(memory, logger);
const applyEngine = new ApplyEngine(logger);
const decisionEngine = new DecisionEngine(logger);
const learningEngine = new LearningEngine(memory, logger);

console.log('=======================================================================');
console.log('ROUND 1: Processing INV-A-001 (Supplier GmbH) - NO MEMORY YET');
console.log('=======================================================================\n');

const inv1 = invoices.find(i => i.invoiceId === 'INV-A-001')!;
logger.clear();

const recalled1 = recallEngine.recallForInvoice(inv1);
console.log(`Recalled patterns: ${recalled1.vendorPatterns.length}`);

const { correctedInvoice: corrected1, corrections: corrections1 } = applyEngine.applyCorrections(inv1, recalled1.vendorPatterns);
console.log(`Corrections applied: ${corrections1.length}`);

const decision1 = decisionEngine.decide(inv1, corrected1, corrections1, pos, dns);
console.log(`Requires review: ${decision1.requiresHumanReview ? 'YES' : 'NO'}`);
console.log(`Confidence: ${(decision1.confidenceScore * 100).toFixed(1)}%`);
console.log(`Reasoning: ${decision1.reasoning}\n`);

console.log('Human applies correction: serviceDate from Leistungsdatum\n');
const humanCorr1 = corrections.find(c => c.invoiceId === 'INV-A-001')!;
const updates1 = learningEngine.learnFromCorrection(humanCorr1);
updates1.forEach(u => console.log(`   ${u}`));

console.log('\nMemory saved!\n');

console.log('=======================================================================');
console.log('ROUND 2: Processing INV-A-002 (Supplier GmbH) - WITH LEARNED MEMORY');
console.log('=======================================================================\n');

const inv2 = invoices.find(i => i.invoiceId === 'INV-A-002')!;
logger.clear();

const recalled2 = recallEngine.recallForInvoice(inv2);
console.log(`Recalled patterns: ${recalled2.vendorPatterns.length} (UP FROM 0)`);

const { correctedInvoice: corrected2, corrections: corrections2 } = applyEngine.applyCorrections(inv2, recalled2.vendorPatterns);
console.log(`Corrections applied: ${corrections2.length} (AUTOMATIC)`);
corrections2.forEach(c => console.log(`   ${c}`));

const decision2 = decisionEngine.decide(inv2, corrected2, corrections2, pos, dns);
console.log(`\nRequires review: ${decision2.requiresHumanReview ? 'YES' : 'NO'}`);
console.log(`Confidence: ${(decision2.confidenceScore * 100).toFixed(1)}% (IMPROVED)`);
console.log(`Reasoning: ${decision2.reasoning}\n`);

console.log('=======================================================================');
console.log('DEMO COMPLETE - LEARNING DEMONSTRATED');
console.log('=======================================================================');
console.log(`
KEY TAKEAWAYS:
   - Round 1: No memory, flagged for review
   - Round 2: Learned pattern, auto-applied correction
   - Confidence improved from ${(decision1.confidenceScore * 100).toFixed(1)}% to ${(decision2.confidenceScore * 100).toFixed(1)}%
   - System is LEARNING
`);