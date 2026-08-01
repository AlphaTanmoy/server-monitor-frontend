import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
export class Landing {
  readonly particles: ParticleConfig[] = Array.from({ length: 18 }, (_, index) => ({
    left: (index * 9 + 7) % 100,
    top: (index * 13 + 10) % 100,
    delay: index * 0.35,
    duration: 10 + (index % 5) * 1.5,
    size: 30 + (index % 4) * 12,
    background: `hsla(${196 + (index % 6) * 12}, 95%, 72%, 0.65)`
  }));
}
