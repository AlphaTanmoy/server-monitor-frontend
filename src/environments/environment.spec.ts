import { environment } from './environment';

describe('environment', () => {
  it('should use the frontend proxy for local development requests', () => {
    expect(environment.apiUrl).toBe('/api/v1/monitor');
  });
});
