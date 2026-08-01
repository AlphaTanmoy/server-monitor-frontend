const shouldCallBackendServer = true;

export const environment = {
  production: true,
  shouldCallBackendServer,
  apiUrl: shouldCallBackendServer
    ? 'https://monitor-backend.tanmoysyatraofficial.store/api/v1/monitor'
    : 'http://localhost:9669',
  pollingInterval: 5000,
  apiKeyHeader: 'X-ShivaAI-Monitor-Key'
};