
import { AuditStep } from '../types';

export class AuditLogger {
  private trail: AuditStep[] = [];

  log(step: 'recall' | 'apply' | 'decide' | 'learn', details: string): void {
    this.trail.push({
      step,
      timestamp: new Date().toISOString(),
      details
    });
  }

  getTrail(): AuditStep[] {
    return this.trail;
  }

  clear(): void {
    this.trail = [];
  }
}