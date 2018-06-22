import test from 'ava'
import sinon from 'sinon'
import AWS from 'aws-sdk/global'
import 'amazon-cognito-js'

// Modules to test
import CognitoSync from '../src'
import config from './test-config.json'
import mutations from '../src/mutations'

// Start testing
test.beforeEach(t => {
  t.context.sb = sinon.createSandbox()
})

test.afterEach.always(t => {
  t.context.sb.restore()
})

test('imports CognitoSync client because `amazon-cognito-js` doesn\'t... ಠ_ಠ', t => {
  t.is(typeof AWS.CognitoSync, 'function')
})

test.serial('class init() method', async t => {
  let logins = 'logins object'
  t.context.sb.stub(CognitoSync, 'authenticate').returns(Promise.resolve())
  t.context.sb.stub(CognitoSync, 'initSyncManager').returns(Promise.resolve())
  await CognitoSync.init(config, logins)
  sinon.assert.calledWith(CognitoSync.authenticate, config, logins)
  sinon.assert.calledOnce(CognitoSync.initSyncManager)
  sinon.assert.callOrder(CognitoSync.authenticate, CognitoSync.initSyncManager)
})

test.serial('class authenticate() method - create', async t => {
  t.context.sb.stub(AWS, 'CognitoIdentityCredentials').returns({
    refresh: t.context.sb.stub().callsArgWith(0, null)
  })
  delete CognitoSync.context.credentials
  let logins = { key: 'value' }
  await CognitoSync.authenticate(config, logins)
  sinon.assert.calledWith(AWS.CognitoIdentityCredentials, {
    IdentityPoolId: config.IdentityPoolId,
    Logins: logins
  })
})

test.serial('class authenticate() method - get', async t => {
  t.context.sb.stub(AWS, 'CognitoIdentityCredentials')
  CognitoSync.context.credentials = {
    params: { Logins: {} },
    refresh: t.context.sb.stub().callsArgWith(0, null)
  }
  let logins = { key: 'value' }
  await CognitoSync.authenticate(config, logins)
  sinon.assert.notCalled(AWS.CognitoIdentityCredentials)
  t.deepEqual(CognitoSync.context.credentials.params.Logins, logins)
  t.true(CognitoSync.context.credentials.expired)
})

test.serial('class initSyncManager() method - create', async t => {
  AWS.config.credentials = { get: t.context.sb.stub().callsArgWith(0, null) }
  t.context.sb.stub(AWS, 'CognitoSyncManager')
  let manager = await CognitoSync.initSyncManager()
  sinon.assert.callOrder(AWS.config.credentials.get, AWS.CognitoSyncManager)
  t.is(CognitoSync.context.manager, manager)
})

test.serial('class initSyncManager() method - get', async t => {
  AWS.config.credentials = { get: t.context.sb.stub().callsArgWith(0, null) }
  t.context.sb.stub(AWS, 'CognitoSyncManager')
  CognitoSync.context.manager = 'existing manager'
  let manager = await CognitoSync.initSyncManager()
  sinon.assert.notCalled(AWS.CognitoSyncManager)
  sinon.assert.notCalled(AWS.config.credentials.get)
  t.is(manager, 'existing manager')
  t.is(CognitoSync.context.manager, manager)
  delete CognitoSync.context.manager
})

test.serial('class initSyncManager() method - failure', async t => {
  AWS.config.credentials = { get: t.context.sb.stub().callsArgWith(0, new Error('error message')) }
  let error = await t.throws(CognitoSync.initSyncManager())
  t.is(error.message, 'error message')
})

test('class wipe() method - no manager', async t => {
  AWS.config.credentials = { clearCachedId: t.context.sb.stub() }
  CognitoSync.context.manager = undefined
  CognitoSync.context.datasets = { 'some-dataset': {} }
  await CognitoSync.wipe()
  t.deepEqual(CognitoSync.context.datasets, {}, 'clears all datasets')
  sinon.assert.calledOnce(AWS.config.credentials.clearCachedId)
})

test('class wipe() method - no credentials', async t => {
  AWS.config.credentials = undefined
  CognitoSync.context.manager = { wipeData: t.context.sb.stub() }
  CognitoSync.context.datasets = { 'some-dataset': {} }
  await CognitoSync.wipe()
  t.deepEqual(CognitoSync.context.datasets, {}, 'clears all datasets')
  sinon.assert.calledOnce(CognitoSync.context.manager.wipeData)
})

test('class wipe() method - success', async t => {
  AWS.config.credentials = { clearCachedId: t.context.sb.stub() }
  CognitoSync.context.datasets = { 'some-dataset': {} }
  CognitoSync.context.manager = { wipeData: t.context.sb.stub() }
  await CognitoSync.wipe()
  t.deepEqual(CognitoSync.context.datasets, {}, 'clears all datasets')
  sinon.assert.calledOnce(CognitoSync.context.manager.wipeData)
  sinon.assert.calledOnce(AWS.config.credentials.clearCachedId)
})

test('constructor()', t => {
  const instance = new CognitoSync('datasetName')
  t.is(instance.namespaced, true)
  t.deepEqual(instance.state, {})
  t.is(instance.mutations, mutations)
})
