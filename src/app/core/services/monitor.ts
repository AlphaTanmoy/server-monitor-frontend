import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MonitorStatus } from '../model/monitor-status.model';


@Injectable({
  providedIn: 'root'
})
export class MonitorService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  /**
   * Checks if the monitor backend is alive.
   * No API key required.
   */
  getHealth(): Observable<string> {

    return this.http.get(
      `${this.apiUrl}/health`,
      {
        responseType: 'text'
      }
    );

  }

  /**
   * Fetches all monitor statuses.
   * Requires API key.
   */
  getStatus(apiKey: string): Observable<MonitorStatus[]> {

    const normalizedApiKey = apiKey?.trim();

    if (!normalizedApiKey) {
      throw new Error('Missing API key');
    }

    const headers = new HttpHeaders({
      [environment.apiKeyHeader]: normalizedApiKey
    });

    return this.http.get<MonitorStatus[]>(
      `${this.apiUrl}/status`,
      {
        headers,
        withCredentials: true
      }
    );

  }

}