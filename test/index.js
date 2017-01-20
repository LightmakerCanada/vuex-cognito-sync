import test from 'ava'
import sinon from 'sinon'
import AWS from 'aws-sdk'
import 'amazon-cognito-js'

// Modules to test
import CognitoSync from '../src'
import config from './test-config.json'

// Start testing
let sb

test.beforeEach(t => {
  sb = sinon.sandbox.create()
})

test.afterEach.always(t => {
  sb.restore()
})

test.serial('class init method', async t => {
  let logins = 'logins object'
  sb.stub(CognitoSync, 'authenticate').returns(Promise.resolve())
  sb.stub(CognitoSync, 'initSyncManager').returns(Promise.resolve())
  await CognitoSync.init(config, logins)
  sinon.assert.calledWith(CognitoSync.authenticate, config, logins)
  sinon.assert.calledOnce(CognitoSync.initSyncManager)
  sinon.assert.callOrder(CognitoSync.authenticate, CognitoSync.initSyncManager)
})

test.serial('class authenticate method - create', async t => {
  sb.stub(AWS, 'CognitoIdentityCredentials')
  delete CognitoSync.context.credentials
  let logins = { key: 'value' }
  await CognitoSync.authenticate(config, logins)
  sinon.assert.calledWith(AWS.CognitoIdentityCredentials, {
    IdentityPoolId: config.IdentityPoolId,
    Logins: logins
  })
})

test.serial('class authenticate method - get', async t => {
  sb.stub(AWS, 'CognitoIdentityCredentials')
  CognitoSync.context.credentials = { params: { Logins: {} } }
  let logins = { key: 'value' }
  await CognitoSync.authenticate(config, logins)
  sinon.assert.notCalled(AWS.CognitoIdentityCredentials)
  t.deepEqual(CognitoSync.context.credentials.params.Logins, logins)
  t.true(CognitoSync.context.credentials.expired)
})

test.serial('class initSyncManager method - create', async t => {
  AWS.config.credentials = {
    get: sb.stub().callsArgWith(0, null)
  }
  sb.stub(AWS, 'CognitoSyncManager')
  let manager = await CognitoSync.initSyncManager()
  sinon.assert.callOrder(AWS.config.credentials.get, AWS.CognitoSyncManager)
  t.is(CognitoSync.context.manager, manager)
})

test.serial('class initSyncManager method - get', async t => {
  AWS.config.credentials = {
    get: sb.stub().callsArgWith(0, null)
  }
  sb.stub(AWS, 'CognitoSyncManager')
  CognitoSync.context.manager = 'existing manager'
  let manager = await CognitoSync.initSyncManager()
  sinon.assert.notCalled(AWS.CognitoSyncManager)
  sinon.assert.notCalled(AWS.config.credentials.get)
  t.is(manager, 'existing manager')
  t.is(CognitoSync.context.manager, manager)
  delete CognitoSync.context.manager
})

test.serial('class initSyncManager method - failure', async t => {
  AWS.config.credentials = {
    get: sb.stub().callsArgWith(0, new Error('error message'))
  }
  let error = await t.throws(CognitoSync.initSyncManager())
  t.is(error.message, 'error message')
})
