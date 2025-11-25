import { isRateLimited } from '../services/rate-limiter.service';

describe('rate-limiter.service', () => {
    it('first call should be allowed', async () => {
        const res = await isRateLimited('127.0.0.1');

        expect(res).toBe(false);
        expect(typeof res).toBe('boolean');
    });

    it('repeated calls for same key eventually block', async () => {
        const key = '10.0.0.1';
        let last = undefined;

        for (let i = 0; i < 100; i++) {
            last = await isRateLimited(key);
        }

        expect(last).toBe(true);
    });
});
