import test from 'ava'

// Modules to test
import * as types from '../src/mutation-types'
import mutations from '../src/mutations'

// Start testing
let state

test.beforeEach(t => {
  state = {}
})

test('PUT mutation', t => {
  let key = 'key'
  let value = 'value'
  mutations[types.PUT](state, { key, value })
  t.is(state[key], value)
})

test('REMOVE mutation', t => {
  let key = 'key'
  let value = 'value'
  state[key] = value
  mutations[types.REMOVE](state, { key })
  t.is(state[key], undefined)
})

test('SYNC mutation', t => {
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
})
