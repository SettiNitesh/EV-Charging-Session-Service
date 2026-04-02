const clone = (value) => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  // Fallback: good enough for this test suite’s plain objects + Dates are avoided.
  return JSON.parse(JSON.stringify(value));
};

class FakeSessionsCollection {
  constructor({ initialSessions = [] } = {}) {
    this._docs = new Map();

    for (const doc of initialSessions) {
      if (!doc?.sessionId) throw new Error('FakeSessionsCollection: sessionId is required');
      this._docs.set(doc.sessionId, clone(doc));
    }
  }

  _matchesFilters(doc, filters) {
    return Object.entries(filters).every(([key, expected]) => doc[key] === expected);
  }

  _findDoc(filters) {
    for (const doc of this._docs.values()) {
      if (this._matchesFilters(doc, filters)) return doc;
    }
    return null;
  }

  async insertOne(doc) {
    if (!doc?.sessionId) throw new Error('FakeSessionsCollection: sessionId is required');
    if (this._docs.has(doc.sessionId)) {
      const err = new Error('Duplicate sessionId');
      err.code = 11000;
      throw err;
    }
    this._docs.set(doc.sessionId, clone(doc));
    return doc;
  }

  async findOne(filters) {
    const doc = this._findDoc(filters);
    return doc ? clone(doc) : null;
  }

  async updateOne(filters, update) {
    const doc = this._findDoc(filters);
    if (!doc) return { matchedCount: 0, modifiedCount: 0 };

    if (update?.$set) {
      for (const [k, v] of Object.entries(update.$set)) doc[k] = v;
    }

    return { matchedCount: 1, modifiedCount: 1 };
  }

  async findOneAndUpdate(filters, update, options = {}) {
    const doc = this._findDoc(filters);
    if (!doc) return null;

    const before = clone(doc);

    if (update?.$set) {
      for (const [k, v] of Object.entries(update.$set)) doc[k] = v;
    }

    if (update?.$push) {
      for (const [k, v] of Object.entries(update.$push)) {
        if (!Array.isArray(doc[k])) doc[k] = [];
        doc[k].push(v);
      }
    }

    const after = clone(doc);
    return options?.returnDocument === 'before' ? before : after;
  }

  getBySessionId(sessionId) {
    const doc = this._docs.get(sessionId);
    return doc ? clone(doc) : null;
  }
}

class FakeIdempotencyCollection {
  constructor({ initial = [] } = {}) {
    // key: `${idempotencyKey}::${type}`
    this._docs = new Map();
    for (const doc of initial) {
      this._docs.set(`${doc.idempotencyKey}::${doc.type}`, clone(doc));
    }
  }

  _key(filters) {
    return `${filters.idempotencyKey}::${filters.type}`;
  }

  async insertOne(doc) {
    const key = `${doc.idempotencyKey}::${doc.type}`;
    if (this._docs.has(key)) {
      const err = new Error('Duplicate idempotencyKey + type');
      err.code = 11000;
      throw err;
    }
    this._docs.set(key, clone(doc));
    return doc;
  }

  async findOne(filters) {
    const key = this._key(filters);
    const doc = this._docs.get(key);
    return doc ? clone(doc) : null;
  }
}

class FakeMongoClient {
  startSession() {
    return {
      async withTransaction(fn) {
        return await fn();
      },
      async endSession() {},
    };
  }
}

export function createFakeFastify({ initialSessions = [], initialIdempotency = [] } = {}) {
  return {
    log: { debug: () => {} },
    mongo: {
      client: new FakeMongoClient(),
      sessions: new FakeSessionsCollection({ initialSessions }),
      idempotency: new FakeIdempotencyCollection({ initial: initialIdempotency }),
    },
  };
}
