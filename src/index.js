import AWS from 'aws-sdk/global'
import 'aws-sdk/clients/cognitosync'
import 'amazon-cognito-js'
import ActionsFactory from './actions'
import mutations from './mutations'

const context = { datasets: {} } // Class level context object
const defaultRegion = 'us-east-1'

export default class CognitoSync {
  static get context () { return context }

  /**
   * Authenticate, then instantiate a new `CognitoSyncManager`.
   * @param {Object} config
   * @param {Object} [logins] - Cognito Identity logins.
   * @returns {Promise}
   */
  static init (config, logins) {
    return this.authenticate(config, logins)
      .then(this.initSyncManager.bind(this))
  }

  /**
   * Create or udpate AWS SDK credentials.
   * @param {Object} config
   * @param {Object} [logins] - Cognito Identity logins.
   * @returns {Promise}
   */
  static authenticate (config, logins) {
    return new Promise((resolve, reject) => {
      if (!this.context.credentials) {
        // Build credentials instance if none exists yet
        AWS.config.region = process.env.AWS_REGION || defaultRegion
        AWS.config.correctClockSkew = true
        this.context.credentials = AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: config.IdentityPoolId,
          Logins: logins || {}
        })
      } else {
        // Update cached credentials
        this.context.credentials.params.Logins = Object.assign(this.context.credentials.params.Logins, logins)
        this.context.credentials.expired = true // Expire credentials so they are refreshed on the next request
      }
      // Call refresh method in order to authenticate user and get new temp credentials
      this.context.credentials.refresh((err) => {
        if (err) return reject(err)
        resolve(this.context.credentials)
      })
    })
  }

  /**
   * Instantiate a new `CognitoSyncManager`.
   * @returns {Promise}
   */
  static initSyncManager () {
    if (this.context.manager) return Promise.resolve(this.context.manager)
    return new Promise((resolve, reject) => {
      AWS.config.credentials.get((err) => {
        if (err) return reject(err)
        this.context.manager = new AWS.CognitoSyncManager()
        resolve(this.context.manager)
      })
    })
  }

  /**
   * Removes local storage and invalidates cached identity ID.
   * @returns {Promise}
   */
  static wipe () {
    if (this.context.manager) this.context.manager.wipeData()
    if (AWS.config.credentials) {
      AWS.config.credentials.clearCachedId()
      AWS.config.credentials.params.Logins = {}
    }
    this.context.datasets = {}
    return Promise.resolve()
  }

  /**
   * Construct a new CognitoSync Vuex module.
   * @param {String} datasetName - Name of the dataset.
   */
  constructor (datasetName) {
    this.namespaced = true
    const state = {}
    this.state = state
    this.actions = new ActionsFactory({
      datasetName,
      classContext: CognitoSync.context
    })
    this.mutations = mutations
  }
}
