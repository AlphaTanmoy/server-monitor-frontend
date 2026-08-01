import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorService } from '../../core/services/monitor';
import { MonitorStatus } from '../../core/model/monitor-status.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  private readonly monitorService = inject(MonitorService);

  readonly apiKey = signal('');

  readonly status = signal('Checking...');

  readonly monitors = signal<MonitorStatus[]>([]);

  readonly expandedDetails = signal<Record<string, boolean>>({});

  readonly MAX_HISTORY = 15;

  checkStatus() {

    const normalizedApiKey = this.apiKey().trim();

    if (!normalizedApiKey) {
      this.status.set('Please enter API key');
      return;
    }

    this.monitorService.getStatus(normalizedApiKey)
      .subscribe({

        next: response => {

          const normalizedResponse = response.map(service => ({
            ...service,
            history: service.history.slice(0, this.MAX_HISTORY)
          }));

          this.monitors.set(normalizedResponse);
          this.status.set('Connected');

        },

        error: error => {

          console.error(error);

          this.monitors.set([]);

          if (error?.status === 401) {
            this.status.set('Unauthorized: Invalid API Key');
            return;
          }

          this.status.set('Unable to fetch monitor status');

        }

      });

  }

  toggleDetails(name: string) {
    const current = this.expandedDetails();
    this.expandedDetails.set({
      ...current,
      [name]: !current[name]
    });
  }

  getHistoryBars(history: boolean[]): boolean[] {
    return history.slice(-this.MAX_HISTORY);
  }

  getHistoryPlaceholderBars(history: boolean[]): number[] {
    const placeholderCount = Math.max(0, this.MAX_HISTORY - this.getHistoryBars(history).length);
    return Array.from({ length: placeholderCount }, (_, index) => index);
  }

  getDetailsSummary(service: MonitorStatus): string[] {
    const details = service.details ?? {};

    return Object.entries(details)
      .map(([key, value]) => `${key}: ${this.formatDetailValue(value)}`);
  }

  private formatDetailValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? JSON.stringify(value.slice(0, 3)) : '[]';
    }

    if (value && typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  }

}