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


  checkStatus() {

    const normalizedApiKey = this.apiKey().trim();

    if (!normalizedApiKey) {
      this.status.set('Please enter API key');
      return;
    }


    this.monitorService.getStatus(normalizedApiKey)
      .subscribe({

        next: response => {

          this.monitors.set(response);
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

}