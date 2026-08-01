const shouldCallBackendServer = true; // Set this to true if you want to call the backend server, false for local development

export const environment = {
  production: false,
  shouldCallBackendServer,
  apiUrl: shouldCallBackendServer
    ? 'https://monitor-backend.tanmoysyatraofficial.store/api/v1/monitor'
    : 'http://localhost:8091/api/v1/monitor',
  pollingInterval: 5000,
  apiKeyHeader: 'X-ShivaAI-Monitor-Key'
};


//G2nz5weqWfiXvKmo2Y2afDt62YTi2anVXusSL5uj90g1vHKG5q