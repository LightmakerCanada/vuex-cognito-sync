import test from 'ava'
import sinon from 'sinon'
import AWS from 'aws-sdk'
import 'amazon-cognito-js'

// Modules to test
import * as types from '../src/mutation-types'
import actionsFactory from '../src/actions'
import config from './test-config.json'

// Start testing
let sb
let actions

test.beforeEach(t => {
  sb = sinon.sandbox.create()
  actions = actionsFactory(config)
})

test.afterEach.always(t => {
  sb.restore()
})

test('init action - success', async t => {
  const dispatch = sb.stub().returns(Promise.resolve())
  const name = 'dataset name'
  const logins = 'logins object'
  await actions.init({ dispatch }, { name, logins })
  sinon.assert.calledWith(dispatch.getCall(0), 'authenticate', { logins })
  sinon.assert.calledWith(dispatch.getCall(1), 'initCognitoSyncManager')
  sinon.assert.calledWith(dispatch.getCall(2), 'openOrCreateDataset', { name })
})

test.serial('authenticate action - without credentials', async t => {
  sb.stub(AWS, 'CognitoIdentityCredentials')
  const logins = 'logins object'
  await actions.authenticate(null, { logins })
  sinon.assert.calledWith(AWS.CognitoIdentityCredentials, {
    IdentityPoolId: config.IdentityPoolId,
    Logins: logins
  })
  t.is(actions._cognito.credentials, AWS.config.credentials)
})

test.serial('authenticate action - with existing credentials', async t => {
  sb.stub(AWS, 'CognitoIdentityCredentials')
  const oldLogins = { 'old-login': 'old value' }
  const logins = { 'new-login': 'new value' }
  actions._cognito.credentials = { params: { Logins: oldLogins } }
  await actions.authenticate(null, { logins })
  sinon.assert.notCalled(AWS.CognitoIdentityCredentials)
  t.deepEqual(actions._cognito.credentials.params.Logins, Object.assign(oldLogins, logins), 'merges login identities')
  t.true(actions._cognito.credentials.expired, 'forces refresh of credentials')
})

test.serial('initCognitoSyncManager action - success', async t => {
  AWS.config.credentials = {
    get: sb.stub().callsArg(0)
  }
  sb.stub(AWS, 'CognitoSyncManager')
  let manager = await actions.initCognitoSyncManager()
  sinon.assert.calledOnce(AWS.config.credentials.get)
  sinon.assert.calledOnce(AWS.CognitoSyncManager)
  t.is(manager, actions._cognito.manager)
})

test.serial('initCognitoSyncManager action - failure', async t => {
  AWS.config.credentials = {
    get: sb.stub().callsArgWith(0, new Error('error message'))
  }
  sb.stub(AWS, 'CognitoSyncManager')
  let error = await t.throws(actions.initCognitoSyncManager())
  sinon.assert.calledOnce(AWS.config.credentials.get)
  sinon.assert.notCalled(AWS.CognitoSyncManager)
  t.is(error.message, 'error message')
})

test.serial('openOrCreateDataset action - success', async t => {
  let dataset = 'cognito sync dataset'
  let name = 'datasetName'
  actions._cognito.manager = {
    openOrCreateDataset: sb.stub().callsArgWith(1, null, dataset)
  }
  let result = await actions.openOrCreateDataset(null, { name })
  t.is(actions._cognito.dataset, dataset)
  t.is(result, actions._cognito.dataset)
})

test.serial('openOrCreateDataset action - failure', async t => {
  let name = 'datasetName'
  actions._cognito.manager = {
    openOrCreateDataset: sb.stub().callsArgWith(1, new Error('error message'))
  }
  const error = await t.throws(actions.openOrCreateDataset(null, { name }))
  t.is(error.message, 'error message')
})

test.serial('put action - success', async t => {
  let commit = sb.stub()
  let payload = {
    key: 'key',
    value: 'value'
  }
  let record = {
    key: 'record-key',
    value: 'record-value'
  }
  actions._cognito.dataset = {
    put: sb.stub().callsArgWith(2, null, record)
  }
  await actions.put({ commit }, payload)
  sinon.assert.calledWith(actions._cognito.dataset.put, payload.key, payload.value)
  sinon.assert.calledWith(commit, types.PUT, {
    key: record.key,
    value: record.value
  })
})

test.serial('put action - failure', async t => {
  let commit = sb.stub()
  let payload = {
    key: 'key',
    value: 'value'
  }
  actions._cognito.dataset = {
    put: sb.stub().callsArgWith(2, new Error('error message'))
  }
  const error = await t.throws(actions.put({ commit }, payload))
  sinon.assert.notCalled(commit)
  t.is(error.message, 'error message')
})

test.serial('remove action - success', async t => {
  let commit = sb.stub()
  let key = 'key'
  let record = {}
  actions._cognito.dataset = {
    remove: sb.stub().callsArgWith(1, null, record)
  }
  await actions.remove({ commit }, { key })
  sinon.assert.calledWith(actions._cognito.dataset.remove, key)
  sinon.assert.calledWith(commit, types.REMOVE, { key })
})

test.serial('remove action - failure', async t => {
  let commit = sb.stub()
  let key = 'key'
  actions._cognito.dataset = {
    remove: sb.stub().callsArgWith(1, new Error('error message'))
  }
  const error = await t.throws(actions.remove({ commit }, { key }))
  sinon.assert.notCalled(commit)
  t.is(error.message, 'error message')
})

test.serial('sync action - success', async t => {
  let commit = sb.stub()
  let records = []
  actions._cognito.dataset = {
    synchronize: (callbacks) => {
      callbacks.onSuccess(actions._cognito.dataset)
    },
    getAllRecords: sb.stub().callsArgWith(0, null, records)
  }
  await actions.sync({ commit })
  sinon.assert.calledOnce(actions._cognito.dataset.getAllRecords)
  sinon.assert.calledWith(commit, types.SYNC, { records })
})

test.serial('sync action - failure', async t => {
  let commit = sb.stub()
  actions._cognito.dataset = {
    synchronize: (callbacks) => {
      callbacks.onFailure(new Error('error message'))
    }
  }
  const error = await t.throws(actions.sync({ commit }))
  t.is(error.message, 'error message')
})
