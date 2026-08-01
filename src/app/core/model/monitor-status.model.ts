export interface MonitorStatus {

  name: string;

  healthy: boolean;

  message: string;

  responseTime: number;

  timestamp: string;

  details?: any;

  history: boolean[];

}