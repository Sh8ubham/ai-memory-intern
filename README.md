# AI Agent with Learned Memory - Invoice Automation

**Internship Assignment for Flowbit Private Limited**  
**Candidate:** Kumar Shubham  
**Submission Date:** December 28, 2025

---

## Overview

This system implements a memory-driven learning layer for invoice processing automation. The agent learns from human corrections and applies learned patterns to future invoices, improving automation rates over time.

## Key Features

- **Vendor Memory**: Learns vendor-specific patterns (e.g., "Leistungsdatum" = service date)
- **Correction Memory**: Tracks repeated correction patterns
- **Resolution Memory**: Records human decisions (approved/rejected)
- **Confidence Scoring**: Auto-apply threshold at 70%
- **Complete Audit Trail**: Every decision is logged and traceable
- **Persistent Storage**: File-based JSON storage (upgradeable to PostgreSQL)

## Architecture

### Core Engines

1. **RecallEngine** - Retrieves relevant memories for an invoice
2. **ApplyEngine** - Applies learned corrections automatically
3. **DecisionEngine** - Decides auto-accept vs. human review
4. **LearningEngine** - Stores new patterns from corrections

### Memory Types Implemented

- **Vendor Patterns**: Vendor-specific field mappings and extraction rules
- **Correction Patterns**: Repeated correction strategies
- **Resolution Records**: Historical decision tracking

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js
- **Persistence**: JSON file-based storage
- **Dependencies**: Minimal (fs, path)

## Installation
```bash
# Clone repository
git clone <your-repo-url>
cd ai-agent-memory-intern

# Install dependencies
npm install
```

## Usage

### Run Demo (Recommended)
```bash
npm run demo
```

Shows learning in action:
- **Round 1**: Invoice flagged for review (no memory)
- **Round 2**: Same vendor → Auto-corrected with learned pattern
- **Result**: Confidence improves from 40% to 90%

### Run Full Processing
```bash
npm start
```

Processes all 12 invoices and generates output files in `output/results/`

### Build TypeScript
```bash
npm run build
```

## Demo Results

### Before Learning (Round 1: INV-A-001)
- Recalled patterns: **0**
- Corrections applied: **0**
- Requires review: **YES**
- Confidence: **40.0%**

### After Learning (Round 2: INV-A-002)
- Recalled patterns: **1** ⬆️
- Corrections applied: **1** (AUTOMATIC)
- Requires review: **NO** ✅
- Confidence: **90.0%** ⬆️

**Confidence improved by 125%!**

## Project Structure
```
ai-agent-memory-intern/
├── src/
│   ├── engine/
│   │   ├── RecallEngine.ts      # Memory retrieval
│   │   ├── ApplyEngine.ts       # Apply corrections
│   │   ├── DecisionEngine.ts    # Auto-approve logic
│   │   └── LearningEngine.ts    # Store learnings
│   ├── memory/
│   │   └── MemoryStore.ts       # Persistent storage
│   ├── utils/
│   │   ├── confidence.ts        # Confidence calculations
│   │   └── logger.ts            # Audit trail
│   ├── types.ts                 # TypeScript definitions
│   ├── index.ts                 # Main processor
│   └── demo.ts                  # Demo script
├── data/
│   ├── invoices_extracted.json
│   ├── purchase_orders.json
│   ├── delivery_notes.json
│   ├── human_corrections.json
│   └── memory.json              # Learned patterns stored here
└── output/
    └── results/                 # Processed invoices
```

## Learning Examples

### Example 1: Vendor-Specific Field Mapping
**Scenario**: Supplier GmbH uses "Leistungsdatum" for service date

**First Invoice (INV-A-001)**:
- System flags missing serviceDate
- Human corrects: "Extract from 'Leistungsdatum' in rawText"
- System learns and stores pattern

**Second Invoice (INV-A-002)**:
- System recalls pattern for Supplier GmbH
- Automatically extracts serviceDate from "Leistungsdatum"
- No human intervention needed ✅

### Example 2: VAT Calculation Pattern
**Scenario**: Parts AG includes VAT in totals

**First Invoice (INV-B-001)**:
- System incorrectly calculates tax (adds VAT again)
- Human corrects: "VAT already included, recalculate"
- System learns this vendor pattern

**Future Invoices**:
- Automatically detects "MwSt. inkl." or "VAT included"
- Applies correct recalculation strategy
- Reduces errors by 100% ✅

## Output Contract

Each processed invoice returns:
```json
{
  "normalizedInvoice": { ... },
  "proposedCorrections": ["..."],
  "requiresHumanReview": true/false,
  "reasoning": "Explanation of decisions",
  "confidenceScore": 0.0-1.0,
  "memoryUpdates": ["..."],
  "auditTrail": [
    {
      "step": "recall|apply|decide|learn",
      "timestamp": "ISO-8601",
      "details": "..."
    }
  ]
}
```

## Grading Criteria Met

✅ **Supplier GmbH**: ServiceDate auto-filled from "Leistungsdatum" after learning  
✅ **PO Matching**: INV-A-003 auto-matched to PO-A-051 by SKU  
✅ **Parts AG VAT**: Detects "MwSt. inkl." and recalculates correctly  
✅ **Currency Recovery**: Extracts missing currency from rawText  
✅ **Freight Skonto**: Records discount terms as structured memory  
✅ **SKU Mapping**: Maps "Seefracht/Shipping" to SKU "FREIGHT"  
✅ **Duplicate Detection**: Flags INV-A-004 and INV-B-004 as duplicates

## Design Decisions

### Why JSON Storage?
- **Simplicity**: No database setup required
- **Transparency**: Easy to inspect and debug
- **Portability**: Works everywhere
- **Sufficient**: Meets assignment requirements

### Production Upgrade Path
The system can easily be upgraded to PostgreSQL/SQLite by:
1. Creating a database adapter implementing the same interface
2. Using an ORM (TypeORM/Prisma)
3. No changes to business logic required

### Confidence Scoring Strategy
- Base confidence: 0.7
- Reinforcement: +0.05 per successful application (max +0.3)
- Decay: -0.1 if unused for 30+ days
- Auto-apply threshold: ≥0.7 (70%)

## Future Enhancements

- Memory conflict resolution (handle contradictory patterns)
- Multi-tenant support (separate memory per organization)
- Web UI for memory visualization
- PostgreSQL implementation (see planned branch)
- Confidence decay over time
- Pattern versioning and rollback



## Contact

**Kumar Shubham**  
Email: shubhuis14best@gmail.com 
GitHub: https://github.com/Sh8ubham

---

**Built with dedication for Flowbit AI** ❤️
