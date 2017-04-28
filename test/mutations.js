import test from 'ava'
import sinon from 'sinon'

// Modules to test
import Vue from 'vue'
import * as types from '../src/mutation-types'
import mutations from '../src/mutations'

// Start testing
let state

test.beforeEach(t => {
  t.context.sb = sinon.sandbox.create()
  t.context.sb.spy(Vue, 'set')
  t.context.sb.spy(Vue, 'delete')
  state = {}
})

test.afterEach.always(t => {
  t.context.sb.restore()
})

test.serial('PUT mutation', t => {
  let key = 'key'
  let value = 'value'
  mutations[types.PUT](state, { key, value })
  t.is(state[key], value)
  sinon.assert.calledWith(Vue.set, state, key, value)
})

test.serial('REMOVE mutation', t => {
  let key = 'key'
  let value = 'value'
  state[key] = value
  mutations[types.REMOVE](state, { key })
  t.is(state[key], undefined)
  sinon.assert.calledWith(Vue.delete, state, key)
})

test.serial('SYNC mutation', t => {
  state.oldKey = 'old value'
  let records = [
    {
      key: 'oldKey',
      value: ''
    },
    {
      key: 'key1',
      value: 'value1'
    },
    {
      key: 'key2',
      value: 'value2'
    }
  ]
  mutations[types.SYNC](state, { records })
  t.is(state.oldKey, undefined, 'clears records that were removed from Cognito Sync storage')
  t.is(state.key1, 'value1')
  t.is(state.key2, 'value2')
  sinon.assert.calledWith(Vue.delete, state, 'oldKey')
  sinon.assert.callCount(Vue.set, 2)
  sinon.assert.calledWith(Vue.set, state, records[1].key, records[1].value)
  sinon.assert.calledWith(Vue.set, state, records[2].key, records[2].value)
})
