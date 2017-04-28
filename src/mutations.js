import Vue from 'vue'
import * as types from './mutation-types'

export default {
  [types.PUT] (state, { key, value }) {
    Vue.set(state, key, value)
  },

  [types.REMOVE] (state, { key }) {
    Vue.delete(state, key)
  },

  [types.SYNC] (state, { records }) {
    // Delete existing keys - Cognito datastore is the source of truth
    for (const key in state) {
      Vue.delete(state, key)
    }
    // Assign keys from Cognito datastore
    for (const record of records) {
      if (!record.value) continue
      Vue.set(state, record.key, record.value)
    }
  }
}
