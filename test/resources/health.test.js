import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HealthResource } from '../../src/resources/HealthResource.js';

describe('resources/HealthResource', () => {
  it('calls GET /health and passes parameters', async () => {
    let capturedParams;
    const mockHttp = {
      request: async (params) => {
        capturedParams = params;
        return { status: { code: 0, text: 'AUTH' } };
      },
    };

    const health = new HealthResource(mockHttp);
    const result = await health.check({ wakeup: true });

    assert.equal(capturedParams.method, 'GET');
    assert.equal(capturedParams.path, '/health');
    assert.deepEqual(capturedParams.query, { wakeup: true });
    assert.equal(result.status.text, 'AUTH');
  });
});
