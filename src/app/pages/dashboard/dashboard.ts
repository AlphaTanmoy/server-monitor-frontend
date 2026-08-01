import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MonitorStatus } from '../../core/model/monitor-status.model';
import { MonitorService } from '../../core/services/monitor';
import { environment } from '../../../environments/environment';

interface ParticleConfig {
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
  background: string;
}

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
export class Dashboard implements OnInit, OnDestroy {

  private readonly monitorService = inject(MonitorService);

  private readonly router = inject(Router);

  readonly apiKey = signal('');

  readonly status = signal('Checking backend...');

  readonly monitors = signal<MonitorStatus[]>([]);

  readonly expandedDetails = signal<Record<string, boolean>>({});

  readonly isApiKeyModalOpen = signal(false);

  readonly modalApiKey = signal('');

  readonly MAX_HISTORY = 15;

  readonly particles: ParticleConfig[] = Array.from({ length: 18 }, (_, index) => ({
    left: (index * 9 + 7) % 100,
    top: (index * 13 + 10) % 100,
    delay: index * 0.35,
    duration: 10 + (index % 5) * 1.5,
    size: 30 + (index % 4) * 12,
    background: `hsla(${196 + (index % 6) * 12}, 95%, 72%, 0.65)`
  }));

  private readonly apiKeyStorageKey = 'server-monitor-api-key';

  private readonly apiKeyExpiryStorageKey = 'server-monitor-api-key-expiry';

  private readonly twelveHoursInMs = 12 * 60 * 60 * 1000;

  private pollingTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.initializeFlow();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private initializeFlow(): void {
    this.monitorService.getHealth()
      .subscribe({
        next: () => {
          this.status.set('Backend is online. Validating saved session...');
          this.tryCachedApiKey();
        },
        error: () => {
          this.stopPolling();
          this.monitors.set([]);
          this.status.set('Backend offline. Please try again later.');
        }
      });
  }

  private tryCachedApiKey(): void {
    const cachedApiKey = this.getStoredApiKey();

    if (!cachedApiKey) {
      this.promptForApiKey();
      return;
    }

    this.checkStatus(cachedApiKey, false);
  }

  private promptForApiKey(): void {
    this.openApiKeyModal();
  }

  openApiKeyModal(): void {
    this.modalApiKey.set('');
    this.isApiKeyModalOpen.set(true);
  }

  closeApiKeyModal(): void {
    this.isApiKeyModalOpen.set(false);
    this.modalApiKey.set('');
  }

  confirmApiKey(): void {
    const enteredApiKey = this.modalApiKey().trim();

    if (!enteredApiKey) {
      this.status.set('API key is required to view server status.');
      return;
    }

    this.closeApiKeyModal();
    this.checkStatus(enteredApiKey, true);
  }

  checkStatus(apiKey: string = this.apiKey(), shouldPersist = true): void {

    const normalizedApiKey = apiKey.trim();

    if (!normalizedApiKey) {
      this.status.set('Please enter API key');
      return;
    }

    this.apiKey.set(normalizedApiKey);

    this.monitorService.getStatus(normalizedApiKey)
      .subscribe({

        next: response => {

          const normalizedResponse = response.map(service => ({
            ...service,
            history: service.history.slice(0, this.MAX_HISTORY)
          }));

          this.monitors.set(normalizedResponse);
          this.status.set('Connected');

          if (shouldPersist) {
            this.persistApiKey(normalizedApiKey);
          }

          this.startPolling();

        },

        error: error => {

          console.error(error);

          this.monitors.set([]);

          if (error?.status === 401) {
            this.status.set('Unauthorized: Invalid API Key');
            this.clearStoredApiKey();
            this.promptForApiKey();
            return;
          }

          this.status.set('Unable to fetch monitor status');

        }

      });

  }

  private startPolling(): void {
    this.stopPolling();

    this.pollingTimer = setInterval(() => {
      const latestApiKey = this.apiKey();

      if (!latestApiKey) {
        this.stopPolling();
        return;
      }

      this.checkStatus(latestApiKey, false);
    }, environment.pollingInterval);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = undefined;
    }
  }

  private persistApiKey(apiKey: string): void {
    const expiresAt = Date.now() + this.twelveHoursInMs;

    localStorage.setItem(this.apiKeyStorageKey, apiKey);
    localStorage.setItem(this.apiKeyExpiryStorageKey, String(expiresAt));
  }

  private clearStoredApiKey(): void {
    localStorage.removeItem(this.apiKeyStorageKey);
    localStorage.removeItem(this.apiKeyExpiryStorageKey);
  }

  private getStoredApiKey(): string | null {
    const storedApiKey = localStorage.getItem(this.apiKeyStorageKey);
    const storedExpiry = Number(localStorage.getItem(this.apiKeyExpiryStorageKey) ?? '0');

    if (!storedApiKey || !storedExpiry) {
      return null;
    }

    if (Date.now() > storedExpiry) {
      this.clearStoredApiKey();
      return null;
    }

    return storedApiKey;
  }

  goBackToLanding(): void {
    this.clearStoredApiKey();
    this.stopPolling();
    this.apiKey.set('');
    this.monitors.set([]);
    this.router.navigate(['/']);
  }

  toggleDetails(name: string) {
    const current = this.expandedDetails();
    this.expandedDetails.set({
      ...current,
      [name]: !current[name]
    });
  }

  getServiceLogo(serviceName: string): string {
    const normalizedName = serviceName.trim().toLowerCase();
    const logoMap: Record<string, string> = {
      cloudflared: 'cloudflared.png',
      ollama: 'ollama.png',
      postgresql: 'pstgres.png',
      rabbitmq: 'rabbit.png',
      redis: 'redis.png',
      'shivaai health': 'shiva.png',
      ufw: 'ufw.png',
      cpu: 'cpu.png',
      disk: 'storage.png',
      memory: 'memory.png'
    };

    return `/${logoMap[normalizedName] ?? 'favicon.ico'}`;
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