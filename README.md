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

# Usage
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
