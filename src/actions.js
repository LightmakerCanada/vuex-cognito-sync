import AWS from 'aws-sdk'
import 'amazon-cognito-js'

import * as types from './mutation-types'

const defaultRegion = 'us-east-1'

export default function actionsFactory (config) {
  const cognito = {
    manager: null,
    dataset: null,
    credentials: null
  }

  return {

    _cognito: cognito, // Expose for testing

    // Cognito init actions

    init ({ dispatch }, { name, logins }) {
      return dispatch('authenticate', { logins })
        .then(() => {
          return dispatch('initCognitoSyncManager')
        })
        .then(() => {
          return dispatch('openOrCreateDataset', { name })
        })
    },

    authenticate (context, { logins }) {
      if (!cognito.credentials) {
        // Build credentials instance if none exists yet
        AWS.config.region = process.env.AWS_REGION || defaultRegion
        cognito.credentials = AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: config.IdentityPoolId,
          Logins: logins || {}
        })
      } else {
        // Update cached credentials
        cognito.credentials.params.Logins = Object.assign(cognito.credentials.params.Logins, logins)
        cognito.credentials.expired = true // Expire credentials so they are refreshed on the next request
      }
      return Promise.resolve()
    },

    initCognitoSyncManager () {
      return new Promise((resolve, reject) => {
        AWS.config.credentials.get((err) => {
          if (err) return reject(err)
          cognito.manager = new AWS.CognitoSyncManager()
          resolve(cognito.manager)
        })
      })
    },

    openOrCreateDataset (context, { name }) {
      return new Promise((resolve, reject) => {
        cognito.manager.openOrCreateDataset(name, (err, dataset) => {
          if (err) return reject(err)
          cognito.dataset = dataset
          resolve(cognito.dataset)
        })
      })
    },

    // Cognito data actions

    put ({ commit }, payload) {
      return new Promise((resolve, reject) => {
        cognito.dataset.put(payload.key, payload.value, (err, record) => {
          if (err) return reject(err)
          commit(types.PUT, {
            key: record.key,
            value: record.value
          })
          resolve()
        })
      })
    },

    remove ({ commit }, { key }) {
      return new Promise((resolve, reject) => {
        cognito.dataset.remove(key, (err, record) => {
          if (err) return reject(err)
          commit(types.REMOVE, { key })
          resolve()
        })
      })
    },

    sync ({ commit }) {
      return new Promise((resolve, reject) => {
        cognito.dataset.synchronize({
          onSuccess: (dataset, newRecords) => {
            dataset.getAllRecords((err, records) => {
              if (err) return reject(err)
              commit(types.SYNC, { records })
              resolve()
            })
          },
          onFailure: reject,
          onConflict: (dataset, conflicts, cb) => {
            let resolved = conflicts.map((conflict) => {
              return conflict.resolveWithRemoteRecord() // TODO: Make configurable
            })
            cognito.dataset.resolve(resolved, () => {
              cb(true)
              resolve()
            })
          },
          onDatasetDeleted: (dataset, datasetName, cb) => {
            cb(true) // TODO: Make configurable
            resolve()
          },
          onDatasetsMerged: (dataset, datasetNames, cb) => {
            cb(true) // TODO: Make configurable
            resolve()
          }
        })
      })
    }

  }
}
