import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MonitorService } from '../../core/services/monitor';

interface ParticleConfig {
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
  background: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing implements OnInit {
  private readonly monitorService = inject(MonitorService);

  readonly particles: ParticleConfig[] = Array.from({ length: 18 }, (_, index) => ({
    left: (index * 9 + 7) % 100,
    top: (index * 13 + 10) % 100,
    delay: index * 0.35,
    duration: 10 + (index % 5) * 1.5,
    size: 30 + (index % 4) * 12,
    background: `hsla(${196 + (index % 6) * 12}, 95%, 72%, 0.65)`
  }));

  readonly isBackendOffline = signal(false);

  readonly serviceIcons = [
    'cloudflared.png',
    'ollama.png',
    'pstgres.png',
    'rabbit.png',
    'redis.png',
    'ufw.png',
    'cpu.png',
    'storage.png',
    'memory.png',
    'shiva.png'
  ];

  ngOnInit(): void {
    this.monitorService.getHealth().subscribe({
      next: () => {
        this.isBackendOffline.set(false);
      },
      error: () => {
        this.isBackendOffline.set(true);
      }
    });
  }

  getServiceLogo(fileName: string): string {
    return `/${fileName}`;
  }
}
