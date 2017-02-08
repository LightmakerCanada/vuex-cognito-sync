import test from 'ava'
import sinon from 'sinon'

// Modules to test
import * as types from '../src/mutation-types'
import actionsFactory from '../src/actions'

// Start testing
let datasetName = 'datasetName'
let classContext
let actions

test.beforeEach(t => {
  t.context.sb = sinon.sandbox.create()
  classContext = { datasets: {} }
  actions = actionsFactory({ datasetName, classContext })
})

test.afterEach.always(t => {
  t.context.sb.restore()
})

test.serial('init action - without sync manager', async t => {
  let error = await t.throws(actions.init())
  t.is(error.message, 'Sync manager not initialized')
})

test.serial('init action - get existing dataset', async t => {
  classContext.manager = {
    openOrCreateDataset: t.context.sb.stub()
  }
  classContext.datasets.datasetName = 'existing dataset'
  let dataset = await actions.init()
  t.is(dataset, 'existing dataset')
  sinon.assert.notCalled(classContext.manager.openOrCreateDataset)
})

test.serial('init action - failure', async t => {
  classContext.manager = {
    openOrCreateDataset: t.context.sb.stub().callsArgWith(1, new Error('error message'))
  }
  const error = await t.throws(actions.init())
  t.is(error.message, 'error message')
})

test.serial('put action - without dataset', async t => {
  let commit = t.context.sb.stub()
  delete classContext.datasets.datasetName
  let error = await t.throws(actions.put({ commit }))
  t.is(error.message, `'${datasetName}' dataset not initialized`)
  sinon.assert.notCalled(commit)
})

test.serial('put action - success', async t => {
  let commit = t.context.sb.stub()
  let payload = {
    key: 'key',
    value: 'value'
  }
  let record = {
    key: 'record-key',
    value: 'record-value'
  }
  classContext.datasets.datasetName = {
    put: t.context.sb.stub().callsArgWith(2, null, record)
  }
  await actions.put({ commit }, payload)
  sinon.assert.calledWith(classContext.datasets.datasetName.put, payload.key, payload.value)
  sinon.assert.calledWith(commit, types.PUT, {
    key: record.key,
    value: record.value
  })
})

test.serial('put action - failure', async t => {
  let commit = t.context.sb.stub()
  let payload = {
    key: 'key',
    value: 'value'
  }
  classContext.datasets.datasetName = {
    put: t.context.sb.stub().callsArgWith(2, new Error('error message'))
  }
  const error = await t.throws(actions.put({ commit }, payload))
  sinon.assert.notCalled(commit)
  t.is(error.message, 'error message')
})

test.serial('remove action - without dataset', async t => {
  let commit = t.context.sb.stub()
  let key = 'key'
  delete classContext.datasets.datasetName
  let error = await t.throws(actions.remove({ commit }, { key }))
  t.is(error.message, `'${datasetName}' dataset not initialized`)
  sinon.assert.notCalled(commit)
})

test.serial('remove action - success', async t => {
  let commit = t.context.sb.stub()
  let key = 'key'
  let record = {}
  classContext.datasets.datasetName = {
    remove: t.context.sb.stub().callsArgWith(1, null, record)
  }
  await actions.remove({ commit }, { key })
  sinon.assert.calledWith(classContext.datasets.datasetName.remove, key)
  sinon.assert.calledWith(commit, types.REMOVE, { key })
})

test.serial('remove action - failure', async t => {
  let commit = t.context.sb.stub()
  let key = 'key'
  classContext.datasets.datasetName = {
    remove: t.context.sb.stub().callsArgWith(1, new Error('error message'))
  }
  const error = await t.throws(actions.remove({ commit }, { key }))
  sinon.assert.notCalled(commit)
  t.is(error.message, 'error message')
})

test.serial('sync action - without dataset', async t => {
  let commit = t.context.sb.stub()
  delete classContext.datasets.datasetName
  let error = await t.throws(actions.sync({ commit }))
  t.is(error.message, `'${datasetName}' dataset not initialized`)
  sinon.assert.notCalled(commit)
})

test.serial('sync action - success', async t => {
  let commit = t.context.sb.stub()
  let records = []
  classContext.datasets.datasetName = {
    synchronize: (callbacks) => {
      callbacks.onSuccess(classContext.datasets.datasetName)
    },
    getAllRecords: t.context.sb.stub().callsArgWith(0, null, records)
  }
  await actions.sync({ commit })
  sinon.assert.calledOnce(classContext.datasets.datasetName.getAllRecords)
  sinon.assert.calledWith(commit, types.SYNC, { records })
})

test.serial('sync action - failure', async t => {
  let commit = t.context.sb.stub()
  classContext.datasets.datasetName = {
    synchronize: (callbacks) => {
      callbacks.onFailure(new Error('error message'))
    }
  }
  const error = await t.throws(actions.sync({ commit }))
  t.is(error.message, 'error message')
})

test.todo('sync action - conflict')
test.todo('sync action - dataset deleted')
test.todo('sync action - dataset merged')
