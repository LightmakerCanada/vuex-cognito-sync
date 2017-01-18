import * as types from './mutation-types'

export default {
  [types.PUT] (state, { key, value }) {
    state[key] = value
  },
  [types.REMOVE] (state, { key }) {
    delete state[key]
  },
  [types.SYNC] (state, { records }) {
    for (let record of records) {
      state[record.key] = record.value
    }
  }
}
