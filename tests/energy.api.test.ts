import request from 'supertest';
import { createApp } from '../src/app';
import { fetchGenerationRange } from '../src/integrations/carbonIntensity';
import { ResponseStatus } from '../src/enums/response-status.enum';
import { formatDateOnly, startOfUtcDay, addDays } from '../src/utils/date.util';
import { createMixIntervals, createRangeIntervals } from './mocks/generation-data';

jest.mock('../src/integrations/carbonIntensity', () => ({
  ...jest.requireActual('../src/integrations/carbonIntensity'),
  fetchGenerationRange: jest.fn()
}));

const mockedFetchGenerationRange = fetchGenerationRange as jest.MockedFunction<typeof fetchGenerationRange>;

describe('Energy API', () => {
  const app = createApp();
  const fixedNow = new Date('2026-06-23T12:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/energy/mix', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedNow);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns energy mix for the default date range', async () => {
      const startDate = formatDateOnly(startOfUtcDay(fixedNow));
      mockedFetchGenerationRange.mockResolvedValue(createMixIntervals(startDate));

      const response = await request(app).get('/api/v1/energy/mix');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].date).toBe(startDate);
      expect(response.body.data[1].date).toBe(formatDateOnly(addDays(startOfUtcDay(fixedNow), 1)));
      expect(response.body.data[2].date).toBe(formatDateOnly(addDays(startOfUtcDay(fixedNow), 2)));
    });

    it('returns energy mix for a selected date offset', async () => {
      const offsetDays = 2;
      const startDate = formatDateOnly(addDays(startOfUtcDay(fixedNow), offsetDays));
      mockedFetchGenerationRange.mockResolvedValue(createMixIntervals(startDate));

      const response = await request(app).get('/api/v1/energy/mix?offsetDays=2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].date).toBe(startDate);
      expect(mockedFetchGenerationRange).toHaveBeenCalledWith(
        addDays(startOfUtcDay(fixedNow), offsetDays),
        addDays(startOfUtcDay(fixedNow), offsetDays + 3)
      );
    });
  });

  describe('GET /api/v1/energy/optimal-charging-window', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedNow);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns the optimal charging window for the selected date range', async () => {
      const startDate = formatDateOnly(startOfUtcDay(fixedNow));
      mockedFetchGenerationRange.mockResolvedValue(
        createRangeIntervals(startDate, 3, {
          startIndex: 4,
          length: 6,
          cleanPercentage: 90
        })
      );

      const response = await request(app).get('/api/v1/energy/optimal-charging-window?hours=3&offsetDays=0');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.windowHours).toBe(3);
      expect(response.body.data.averageCleanEnergyPercentage).toBe(90);
      expect(response.body.data.from).toBe('2026-06-23T02:00:00Z');
      expect(response.body.data.to).toBe('2026-06-23T05:00:00Z');
      expect(mockedFetchGenerationRange).toHaveBeenCalledWith(
        startOfUtcDay(fixedNow),
        addDays(startOfUtcDay(fixedNow), 3)
      );
    });
  });

  it('returns error when optimal window is unavailable in the selected range', async () => {
    mockedFetchGenerationRange.mockResolvedValue([]);

    const response = await request(app).get('/api/v1/energy/optimal-charging-window?hours=3&offsetDays=0');

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(response.body.error.status).toBe(ResponseStatus.CARBON_INTENSITY_ERROR);
    expect(response.body.error.message).toContain('No optimal charging window is available in the selected date range');
  });

  it('returns validation error for an invalid charging window payload', async () => {
    const response = await request(app).get('/api/v1/energy/optimal-charging-window?hours=9');

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.status).toBe(ResponseStatus.VALIDATION_ERROR);
    expect(response.body.error.message).toContain('hours must be at most 6');
    expect(mockedFetchGenerationRange).not.toHaveBeenCalled();
  });
});
