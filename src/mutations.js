import * as types from './mutation-types'

export default {
  [types.PUT] (state, { key, value }) {
    state[key] = value
  },

  [types.REMOVE] (state, { key }) {
    delete state[key]
  },

  [types.SYNC] (state, { records }) {
    // Delete existing keys - Cognito datastore is the source of truth
    for (let key in state) {
      delete state[key]
    }
    // Assign keys from Cognito datastore
    for (let record of records) {
      if (!record.value) continue
      state[record.key] = record.value
    }
  }
}
