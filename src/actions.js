import * as types from './mutation-types'

export default function actionsFactory ({ datasetName, classContext }) {
  return {

    /**
     * Get or create a Cognito Sync dataset.
     * @returns {Promise}
     */
    init () {
      if (!classContext.manager) {
        return Promise.reject(new Error('Sync manager not initialized'))
      }
      if (classContext.datasets[datasetName]) {
        return Promise.resolve(classContext.datasets[datasetName])
      }
      return new Promise((resolve, reject) => {
        classContext.manager.openOrCreateDataset(datasetName, (err, dataset) => {
          if (err) return reject(err)
          classContext.datasets[datasetName] = dataset
          resolve(classContext.datasets[datasetName])
        })
      })
    },

    /**
     * Put a record in the dataset.
     * @param {Object} context
     * @param {Object} payload
     * @returns {Promise}
     */
    put ({ commit }, payload) {
      if (!classContext.datasets[datasetName]) {
        return Promise.reject(new Error(`'${datasetName}' dataset not initialized`))
      }
      return new Promise((resolve, reject) => {
        classContext.datasets[datasetName].put(payload.key, payload.value, (err, record) => {
          if (err) return reject(err)
          commit(types.PUT, {
            key: record.key,
            value: record.value
          })
          resolve()
        })
      })
    },

    /**
     * Remove a record from the dataset.
     * @param {Object} context
     * @param {Object} payload
     * @returns {Promise}
     */
    remove ({ commit }, { key }) {
      if (!classContext.datasets[datasetName]) {
        return Promise.reject(new Error(`'${datasetName}' dataset not initialized`))
      }
      return new Promise((resolve, reject) => {
        classContext.datasets[datasetName].remove(key, (err, record) => {
          if (err) return reject(err)
          commit(types.REMOVE, { key })
          resolve()
        })
      })
    },

    /**
     * Sync the local dataset with the Cognito server.
     * @param {Object} context
     * @returns {Promise}
     */
    sync ({ commit }) {
      if (!classContext.datasets[datasetName]) {
        return Promise.reject(new Error(`'${datasetName}' dataset not initialized`))
      }
      return new Promise((resolve, reject) => {
        classContext.datasets[datasetName].synchronize({
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
            classContext.datasets[datasetName].resolve(resolved, () => {
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
