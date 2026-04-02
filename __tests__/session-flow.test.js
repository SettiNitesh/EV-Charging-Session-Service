import { createFakeFastify } from './helpers/fakeMongo.js';
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import startSessionUsecase from '../src/application/usecases/session/startSession.js';
import updateSessionUsecase from '../src/application/usecases/session/updateSession.js';
import stopSessionUsecase from '../src/application/usecases/session/stopSession.js';

describe('EV Charging Session Service - core usecases', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Start session: CREATED -> ACTIVE returned and persisted', async () => {
    const t0 = new Date('2026-04-02T10:00:00.000Z');
    jest.setSystemTime(t0.getTime());

    const fastify = createFakeFastify();
    const startSession = startSessionUsecase(fastify);

    const response = await startSession({
      data: { userId: 'u1', stationId: 's1' },
      idempotencyKey: undefined,
    });

    expect(response.status).toBe('ACTIVE');
    expect(response.energyLogs).toEqual([]);
    expect(response.cdr).toBe(null);
    expect(response.createdAt.toISOString()).toBe(t0.toISOString());

    const stored = fastify.mongo.sessions.getBySessionId(response.sessionId);
    expect(stored).not.toBeNull();
    expect(stored.status).toBe('ACTIVE');
  });

  test('Idempotency-Key on START: same key returns same sessionId', async () => {
    const t0 = new Date('2026-04-02T10:00:00.000Z');
    jest.setSystemTime(t0.getTime());

    const fastify = createFakeFastify();
    const startSession = startSessionUsecase(fastify);

    const key = 'start-abc-001';
    const res1 = await startSession({
      data: { userId: 'u1', stationId: 's1' },
      idempotencyKey: key,
    });
    const res2 = await startSession({
      data: { userId: 'u1', stationId: 's1' },
      idempotencyKey: key,
    });

    expect(res2.sessionId).toBe(res1.sessionId);
    expect(fastify.mongo.sessions.getBySessionId(res1.sessionId)).not.toBeNull();
  });

  test('PATCH update: only ACTIVE sessions accept energy logs', async () => {
    const t0 = new Date('2026-04-02T10:00:00.000Z');
    jest.setSystemTime(t0.getTime());

    const fastify = createFakeFastify();
    const startSession = startSessionUsecase(fastify);
    const updateSession = updateSessionUsecase(fastify);

    const started = await startSession({ data: { userId: 'u1', stationId: 's1' } });
    const sessionId = started.sessionId;

    const t1 = new Date('2026-04-02T10:01:00.000Z');
    jest.setSystemTime(t1.getTime());

    await updateSession({ sessionId, energy: 5.5 });
    await updateSession({ sessionId, energy: 2.0 });

    const stored = fastify.mongo.sessions.getBySessionId(sessionId);
    expect(stored.energyLogs).toHaveLength(2);
    expect(stored.energyLogs[0].value).toBe(5.5);
    expect(stored.energyLogs[1].value).toBe(2.0);
    expect(stored.energyLogs[0].time.toISOString()).toBe(t1.toISOString());
  });

  test('PATCH update: throws when session is not ACTIVE', async () => {
    const t0 = new Date('2026-04-02T10:00:00.000Z');
    jest.setSystemTime(t0.getTime());

    const sessionId = 'sess-1';
    const fastify = createFakeFastify({
      initialSessions: [
        {
          sessionId,
          userId: 'u1',
          stationId: 's1',
          status: 'CREATED',
          energyLogs: [],
          createdAt: t0,
          stoppedAt: null,
          cdr: null,
        },
      ],
    });

    const updateSession = updateSessionUsecase(fastify);

    await expect(updateSession({ sessionId, energy: 1.2 })).rejects.toHaveProperty('code', 404);
  });

  test('Stop session: computes CDR using energy + duration and finalizes COMPLETED', async () => {
    const t0 = new Date('2026-04-02T10:00:00.000Z');
    const t1 = new Date('2026-04-02T10:02:30.000Z'); // 2.5 minutes
    jest.setSystemTime(t1.getTime());

    const sessionId = 'sess-2';
    const fastify = createFakeFastify({
      initialSessions: [
        {
          sessionId,
          userId: 'u1',
          stationId: 's1',
          status: 'ACTIVE',
          energyLogs: [
            { value: 1, time: t0 },
            { value: 2, time: t0 },
          ],
          createdAt: t0,
          stoppedAt: null,
          cdr: null,
        },
      ],
    });

    const stopSession = stopSessionUsecase(fastify);
    const cdr = await stopSession({ sessionId });

    expect(cdr.sessionId).toBe(sessionId);
    expect(cdr.totalEnergy).toBe(3);
    expect(cdr.totalDuration).toBeCloseTo(2.5, 3);
    expect(cdr.totalCost).toBeCloseTo(35, 3); // 3*10 + 2.5*2
    expect(cdr.tariff.tariff.energyRate).toBe(10);
    expect(cdr.tariff.tariff.timeRate).toBe(2);

    const stored = fastify.mongo.sessions.getBySessionId(sessionId);
    expect(stored.status).toBe('COMPLETED');
    expect(stored.cdr).toEqual(cdr);
  });

  test('Idempotency-Key on STOP: same key returns same CDR on retry', async () => {
    const t0 = new Date('2026-04-02T10:00:00.000Z');
    const t1 = new Date('2026-04-02T10:02:00.000Z'); // 2 minutes
    jest.setSystemTime(t1.getTime());

    const sessionId = 'sess-3';
    const fastify = createFakeFastify({
      initialSessions: [
        {
          sessionId,
          userId: 'u1',
          stationId: 's1',
          status: 'ACTIVE',
          energyLogs: [{ value: 4, time: t0 }],
          createdAt: t0,
          stoppedAt: null,
          cdr: null,
        },
      ],
    });

    const stopSession = stopSessionUsecase(fastify);
    const key = 'stop-abc-001';

    const cdr1 = await stopSession({ sessionId, idempotencyKey: key });
    const cdr2 = await stopSession({ sessionId, idempotencyKey: key });

    expect(cdr2.sessionId).toBe(cdr1.sessionId);
    expect(cdr2.totalEnergy).toBe(cdr1.totalEnergy);
    expect(cdr2.totalCost).toBe(cdr1.totalCost);
    expect(cdr2.stoppedAt.getTime()).toBe(cdr1.stoppedAt.getTime());
  });

  test('Second stop without idempotency-key returns the existing CDR', async () => {
    const t0 = new Date('2026-04-02T10:00:00.000Z');
    const t1 = new Date('2026-04-02T10:01:00.000Z'); // 1 minute
    jest.setSystemTime(t1.getTime());

    const sessionId = 'sess-4';
    const fastify = createFakeFastify({
      initialSessions: [
        {
          sessionId,
          userId: 'u1',
          stationId: 's1',
          status: 'ACTIVE',
          energyLogs: [{ value: 1, time: t0 }],
          createdAt: t0,
          stoppedAt: null,
          cdr: null,
        },
      ],
    });

    const stopSession = stopSessionUsecase(fastify);
    const cdr1 = await stopSession({ sessionId });
    const cdr2 = await stopSession({ sessionId });

    expect(cdr2).toEqual(cdr1);
  });

  test('Stop before start (CREATED) throws InvalidStopRequestError', async () => {
    const t0 = new Date('2026-04-02T10:00:00.000Z');
    jest.setSystemTime(t0.getTime());

    const sessionId = 'sess-5';
    const fastify = createFakeFastify({
      initialSessions: [
        {
          sessionId,
          userId: 'u1',
          stationId: 's1',
          status: 'CREATED',
          energyLogs: [],
          createdAt: t0,
          stoppedAt: null,
          cdr: null,
        },
      ],
    });

    const stopSession = stopSessionUsecase(fastify);

    await expect(stopSession({ sessionId })).rejects.toHaveProperty('code', 404);
  });
});
