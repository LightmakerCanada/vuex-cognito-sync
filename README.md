# vuex-cognito-sync

[![CircleCI](https://img.shields.io/circleci/project/github/LightmakerCanada/vuex-cognito-sync.svg)](https://circleci.com/gh/LightmakerCanada/vuex-cognito-sync)
[![Coveralls](https://img.shields.io/coveralls/LightmakerCanada/vuex-cognito-sync.svg)](https://coveralls.io/github/LightmakerCanada/vuex-cognito-sync)
[![npm](https://img.shields.io/npm/v/vuex-cognito-sync.svg)](https://www.npmjs.com/package/vuex-cognito-sync)
[![npm](https://img.shields.io/npm/l/express.svg)](https://www.npmjs.com/package/vuex-cognito-sync)

A [Vuex](https://vuex.vuejs.org) wrapper for [Amazon Cognito Sync Manager](https://github.com/aws/amazon-cognito-js).

🚧 Work in progress! 🚧


# Installation
Install via [Yarn](http://yarnpkg.com) or npm:

```sh
$ yarn add vuex-cognito-sync
# or...
$ npm install --save vuex-cognito-sync
```

# Usage
> `vuex-cognito-sync` is a [namespaced module](https://vuex.vuejs.org/en/modules.html#namespacing). Your app can have multiple Cognito Sync datasets, and synchronize them with Cognito independently.

Create a config file:

```js
// cognito.config.json
{
  "IdentityPoolId": "us-east-1:********-****-****-****-************"
}
```

Add module to your Vuex store:

```js
import Vue from 'vue'
import Vuex from 'vuex'
import CognitoSync from 'vuex-cognito-sync'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    myNamespace: new CognitoSync('datasetName')
  }
})
```

Call init method when bootstrapping your app:

```js
import CognitoSync from 'vuex-cognito-sync'
import config from './cognito.config.json'

// optional Cognito login tokens
let logins = {
  'graph.facebook.com': '** token **'
}

CognitoSync.init(config, logins)
  .then(() => {
    // do stuff
  })
  .catch((err) => {
    if (err.code === 'NotAuthorizedException') {
      // login token is probably expired
    }
  })
```

Initialize a datastore and perform initial sync:

```js
this.$store.dispatch('myNamespace/init')
  .then(() => {
    return this.$store.dispatch('myNamespace/sync')
  })
```


# Actions

## init
Initialize this module's dataset. Must be dispatched before any other actions.

```js
this.$store.dispatch('myNamespace/init')
  .then((dataset) => {
    // do stuff
  })
```

## put

```js
this.$store.dispatch('myNamespace/put', {
    key: 'someKey',
    value: 'someValue'
  })
  .then(() => {
    // do stuff
  })
```

## remove

```js
this.$store.dispatch('myNamespace/remove', {
    key: 'someKey'
  })
  .then(() => {
    // do stuff
  })
```

## sync
Tell the dataset to synchronize with the Cognito Sync server, and then update the state in Vuex.

```js
this.$store.dispatch('myNamespace/sync')
  .then(() => {
    // do stuff
  })
```

# What's with the `put` & `remove` actions?
It would seem cleaner to use a [plugin](https://vuex.vuejs.org/en/plugins.html) to update the local Cognito dataset when the Vuex store changes.

But unfortunately, [Amazon Cognito Sync Manager](https://github.com/aws/amazon-cognito-js) performs all operations asynchronously... Even when making `localStorage` changes. This means a plugin would go against Vuex's rule that [mutations must be synchronous](https://vuex.vuejs.org/en/mutations.html#mutations-must-be-synchronous), potentially causing race conditions if you make state changes and then dispatch the `sync` action right away.

If if you have a better idea of how to deal with this, please [open an issue](https://github.com/LightmakerCanada/vuex-cognito-sync/issues/new) and let me know!

# TODO
- [ ] Configurable conflict resolution logic (currently always resolves with remote record)
- [ ] Add dataset deleted handling
- [ ] Add datasets merged handling
