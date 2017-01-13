import ActionsFactory from './actions'
import mutations from './mutations'

const state = {}

export default class CognitoSync {
  constructor (config) {
    this.state = state
    this.actions = new ActionsFactory(config)
    this.mutations = mutations
  }
}
