import ActionsFactory from './actions'
import mutations from './mutations'

export default class CognitoSync {
  constructor (config) {
    this.namespaced = true
    const state = {}
    this.state = state
    this.actions = new ActionsFactory(config)
    this.mutations = mutations
  }
}
