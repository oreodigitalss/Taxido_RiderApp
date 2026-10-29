const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { createAsyncThunk } = require('@reduxjs/toolkit');

function loadSource(relativePath, dependencies) {
  const filename = path.resolve(__dirname, '..', relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = name => dependencies[name] ?? originalRequire(name);
  loaded._compile(source, filename);
  return loaded.exports;
}

function mockActions(names) {
  return Object.fromEntries(names.map(name => [name, createAsyncThunk(name, async () => undefined)]));
}

test('failed ride request returns an error state without crashing', () => {
  const actions = mockActions(['allRide', 'allpayment', 'allRides', 'rideDataPut', 'allInvoice', 'locationChanges']);
  const reducer = loadSource('src/api/store/reducers/allRideReducer.tsx', {
    '../actions/allRideAction': actions,
  }).default;
  const state = reducer(undefined, actions.allRide.rejected(new Error('Offline'), 'request', { ride_id: 1 }));
  assert.equal(state.loading, false);
  assert.equal(state.success, false);
  assert.equal(state.statusCode, 500);
});

test('failed coupon request returns an error state without crashing', () => {
  const actions = mockActions(['couponListData', 'couponVerifyData']);
  const reducer = loadSource('src/api/store/reducers/couponReducer.tsx', {
    '../actions/couponAction': actions,
  }).default;
  const state = reducer(undefined, actions.couponListData.rejected(new Error('Offline'), 'request'));
  assert.equal(state.loading, false);
  assert.equal(state.success, false);
  assert.equal(state.statusCode, 500);
});

test('successful coupon request preserves coupons and records success status', () => {
  const actions = mockActions(['couponListData', 'couponVerifyData']);
  const reducer = loadSource('src/api/store/reducers/couponReducer.tsx', {
    '../actions/couponAction': actions,
  }).default;
  const payload = { data: [{ id: 1, code: 'SAVE' }] };
  const state = reducer(undefined, actions.couponListData.fulfilled(payload, 'request'));
  assert.deepEqual(state.couponsList, payload);
  assert.equal(state.statusCode, 200);
});

test('startup shows the rider settings error returned by a rejected request', () => {
  const { formatStartupError } = loadSource('src/utils/startupError.ts', {});
  assert.equal(
    formatStartupError({ message: 'Unable to reach rider settings.' }),
    'Unable to reach rider settings.',
  );
});

test('Google sign-in displays the identity error returned by the API', () => {
  const { authErrorMessage } = loadSource('src/utils/authErrorMessage.ts', {});
  assert.equal(
    authErrorMessage(
      { message: 'Google identity token is invalid.', success: false },
      'Google sign-in failed.',
    ),
    'Google identity token is invalid.',
  );
});

test('clearing an expired token preserves saved preferences; full logout can clear all storage', async () => {
  const values = new Map([['token', 'expired'], ['selectedLanguage', 'hi']]);
  const storage = {
    removeItem: async key => values.delete(key),
    clear: async () => values.clear(),
  };
  const { clearValue } = loadSource('src/utils/localstorage/index.tsx', {
    '@react-native-async-storage/async-storage': storage,
  });
  await clearValue('token');
  assert.equal(values.has('token'), false);
  assert.equal(values.get('selectedLanguage'), 'hi');
  await clearValue();
  assert.equal(values.size, 0);
});
