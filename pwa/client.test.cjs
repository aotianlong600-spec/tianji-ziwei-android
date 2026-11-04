const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

async function client({ protocol = 'https:', hostname = 'example.test', registrationError = false, waiting = false, ready = true, installed = false, persisted = false, storageError = false, active = true } = {}) {
  assert.ok(fs.existsSync(path.join(__dirname, 'client.js')), 'registration client is required');
  const states = [];
  const registrations = [];
  const storageCalls = [];
  const handlers = new Map();
  const registration = {
    active: active ? {} : null, installing: null, waiting: waiting ? {} : null,
    addEventListener: (name, fn) => handlers.set(name, fn),
  };
  let resolveReady;
  const readiness = new Promise(resolve => { resolveReady = resolve; });
  if (ready) resolveReady(registration);
  const serviceWorker = {
    controller: null, ready: readiness,
    register: async (...args) => {
      registrations.push(args);
      if (registrationError) throw new Error('cannot install');
      return registration;
    },
    addEventListener: (name, fn) => handlers.set(name, fn),
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8'), {
    location: { protocol, hostname }, navigator: { serviceWorker, storage: {
      persisted: async () => { storageCalls.push('persisted'); return persisted; },
      persist: async () => { storageCalls.push('persist'); if (storageError) throw new Error('storage unavailable'); return false; },
    } },
    window: { matchMedia: () => ({ matches: installed }), dispatchEvent: event => states.push(event.detail), location: { reload: () => assert.fail('never reload an unsaved chart') } },
    CustomEvent: class { constructor(name, options) { this.type = name; this.detail = options.detail; } },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { states, registrations, handlers, registration, storageCalls, completeReady: async () => { resolveReady(registration); await new Promise(resolve => setImmediate(resolve)); } };
}

test('registration is relative and reports offline ready only after service worker readiness', async () => {
  const c = await client({ ready: false });
  assert.equal(c.registrations.length, 1);
  assert.equal(c.registrations[0][0], './sw.js');
  assert.equal(c.registrations[0][1].scope, './');
  assert.equal(c.registrations[0][1].updateViaCache, 'none');
  assert.equal(c.states[0].state, 'preparing');
  assert.equal(c.states.some(state => state.state === 'ready'), false);
  await c.completeReady();
  assert.equal(c.states.at(-1).state, 'ready');
  assert.ok(c.states.every(state => typeof state.message === 'string'));
});

test('an existing ancestor worker cannot claim this app is ready before its scoped worker installs', async () => {
  const c = await client({ active: false, installed: true });
  assert.equal(c.states.at(-1).state, 'preparing');
  assert.deepEqual(c.storageCalls, []);
  c.registration.active = {};
  c.handlers.get('controllerchange')();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(c.states.at(-1).state, 'ready');
  assert.deepEqual(c.storageCalls, ['persisted', 'persist']);
});

test('only installed apps request storage persistence after offline readiness; denials and errors stay harmless', async () => {
  const c = await client({ ready: false, installed: true });
  assert.deepEqual(c.storageCalls, []);
  await c.completeReady();
  assert.deepEqual(c.storageCalls, ['persisted', 'persist']);
  assert.equal(c.states.at(-1).state, 'ready');
  const browser = await client();
  assert.deepEqual(browser.storageCalls, []);
  const existing = await client({ installed: true, persisted: true });
  assert.deepEqual(existing.storageCalls, ['persisted']);
  const failed = await client({ installed: true, storageError: true });
  assert.equal(failed.states.at(-1).state, 'ready');
});

test('waiting update reports instructions while leaving current forms and chart untouched', async () => {
  const c = await client({ waiting: true });
  assert.equal(c.states.at(-1).state, 'update-ready');
  assert.match(c.states.at(-1).message, /关闭/);
});

test('insecure remote sites never register and registration failure never claims offline readiness', async () => {
  const insecure = await client({ protocol: 'http:' });
  assert.equal(insecure.registrations.length, 0);
  assert.equal(insecure.states.at(-1).state, 'unavailable');
  const failed = await client({ registrationError: true });
  assert.equal(failed.states.at(-1).state, 'error');
  assert.equal(failed.states.some(state => state.state === 'ready'), false);
  const local = await client({ protocol: 'http:', hostname: 'localhost' });
  assert.equal(local.states.at(-1).state, 'ready');
});
