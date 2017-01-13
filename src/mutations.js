import * as types from './mutation-types'

export default {
  [types.PUT] (state, { key, value }) {
    state[key] = value
  },
  [types.REMOVE] (state, { key }) {
    delete state[key]
  },
  [types.SYNC] (state, payload) {
    // TODO
  }
}
