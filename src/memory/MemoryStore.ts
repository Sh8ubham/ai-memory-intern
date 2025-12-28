
import * as fs from 'fs';
import * as path from 'path';
import { MemoryDatabase, VendorPattern, CorrectionPattern, ResolutionRecord } from '../types';

export class MemoryStore {
  private memoryPath: string;
  private memory: MemoryDatabase;

  constructor(memoryPath: string = './data/memory.json') {
    this.memoryPath = memoryPath;
    this.memory = this.loadMemory();
  }

  
  private loadMemory(): MemoryDatabase {
    if (fs.existsSync(this.memoryPath)) {
      const data = fs.readFileSync(this.memoryPath, 'utf-8');
      return JSON.parse(data);
    }
    
    
    return {
      vendorPatterns: [],
      correctionPatterns: [],
      resolutions: []
    };
  }

  
  saveMemory(): void {
    fs.writeFileSync(
      this.memoryPath,
      JSON.stringify(this.memory, null, 2),
      'utf-8'
    );
  }

  
  getVendorPatterns(vendor: string): VendorPattern[] {
    return this.memory.vendorPatterns.filter(p => p.vendor === vendor);
  }

 
  addVendorPattern(pattern: VendorPattern): void {
    const existing = this.memory.vendorPatterns.find(
      p => p.vendor === pattern.vendor && p.pattern === pattern.pattern
    );

    if (existing) {
      
      existing.confidence = Math.min(1.0, existing.confidence + 0.1);
      existing.timesApplied += 1;
      existing.lastUsed = new Date().toISOString();
    } else {
    
      this.memory.vendorPatterns.push(pattern);
    }
  }


  getCorrectionPatterns(): CorrectionPattern[] {
    return this.memory.correctionPatterns;
  }


  addCorrectionPattern(pattern: CorrectionPattern): void {
    const existing = this.memory.correctionPatterns.find(
      p => p.pattern === pattern.pattern
    );

    if (existing) {
      existing.confidence = Math.min(1.0, existing.confidence + 0.1);
      existing.timesApplied += 1;
    } else {
      this.memory.correctionPatterns.push(pattern);
    }
  }

  
  addResolution(resolution: ResolutionRecord): void {
    this.memory.resolutions.push(resolution);
  }


  getAllMemory(): MemoryDatabase {
    return this.memory;
  }
}