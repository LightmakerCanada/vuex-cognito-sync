# vuex-cognito-sync

[![CircleCI](https://img.shields.io/circleci/project/github/LightmakerCanada/vuex-cognito-sync.svg)]()

A [Vuex](https://vuex.vuejs.org) wrapper for [Amazon Cognito Sync Manager](https://github.com/aws/amazon-cognito-js).

🚧 Work in progress! 🚧


# Installation
Install via [Yarn](http://yarnpkg.com) or NPM:

```sh
$ yarn add vuex-cognito-sync
# or...
$ npm install --save vuex-cognito-sync
```

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
import config from './cognito.config.json'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    myNamespace: new CognitoSync(config)
  }
})
```


# Initialization Actions
Before you can start working with Cognito Sync data, use the following actions to authenticate with Cognito and instantiate a Sync Manager.

## authenticate
Creates a new `AWS.CognitoIdentityCredentials` instance and adds it to the AWS SDK `config` object.
If already authenticated, new logins will be merged with existing logins.

```js
this.$store.dispatch('myNamespace/authenticate', {
  logins: {
    'graph.facebook.com': '** token **' // Optional Cognito login tokens
  }
}).then(() => {
  // do stuff
})
```

## initSyncManager
Instantiate a new `AWS.CognitoSyncManager`.

```js
this.$store.dispatch('myNamespace/initSyncManager').then((manager) => {
  // do stuff
})
```

## openOrCreateDataset
Open or create a dataset with the given name.

```js
this.$store.dispatch('myNamespace/openOrCreateDataset', {
  name: 'datasetName'
}).then((dataset) => {
  // do stuff
})
```

## init
A shortcut that dispatches all three `authenticate`, `initSyncManager`, and `openOrCreateDataset` actions respectively.
Useful when bootstrapping an app.

```js
this.$store.dispatch('myNamespace/init', {
  name: 'datasetName',
  logins: {
    'graph.facebook.com': '** token **' // Optional Cognito login tokens
  }
})
```


# Data Actions
Once a Cognito Sync Manager has been initialized using the above actions, you can use
these actions to start working with data.

## put
```js
this.$store.dispatch('myNamespace/put', {
  key: 'someKey',
  value: 'someValue'
}).then(() => {
  // do stuff
})
```

## remove
```js
this.$store.dispatch('myNamespace/remove', {
  key: 'someKey'
}).then(() => {
  // do stuff
})
```

## sync
Tell the dataset to synchronize with the Cognito Sync server, and then update the state in Vuex.

```js
this.$store.dispatch('myNamespace/sync').then(() => {
  // do stuff
})
```
