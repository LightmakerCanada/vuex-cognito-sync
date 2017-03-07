<a name="0.4.6"></a>
## [0.4.6](https://github.com/lightmakercanada/vuex-cognito-sync/compare/v0.4.5...v0.4.6) (2017-03-07)


### Bug Fixes

* don't include entire AWS SDK ([96dbbe0](https://github.com/lightmakercanada/vuex-cognito-sync/commit/96dbbe0))



<a name="0.4.5"></a>
## [0.4.5](https://github.com/lightmakercanada/vuex-cognito-sync/compare/v0.4.4...v0.4.5) (2017-02-28)


### Bug Fixes

* records aren't fully removed from Vuex store when removed from Cognito Sync ([0a268c7](https://github.com/lightmakercanada/vuex-cognito-sync/commit/0a268c7))



<a name="0.4.4"></a>
## [0.4.4](https://github.com/lightmakercanada/vuex-cognito-sync/compare/v0.4.3...v0.4.4) (2017-02-22)


### Bug Fixes

* error thrown when calling `wipe()` without AWS credentials ([a06a849](https://github.com/lightmakercanada/vuex-cognito-sync/commit/a06a849))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/lightmakercanada/vuex-cognito-sync/compare/v0.4.2...v0.4.3) (2017-02-15)


### Features

* use `babel-preset-env` with "> 1%" and "last 2 versions" browser support ([a3ede33](https://github.com/lightmakercanada/vuex-cognito-sync/commit/a3ede33))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/lightmakercanada/vuex-cognito-sync/compare/v0.4.1...v0.4.2) (2017-02-09)


### Features

* don't import entire AWS SDK ([0a84dde](https://github.com/lightmakercanada/vuex-cognito-sync/commit/0a84dde))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/lightmakercanada/vuex-cognito-sync/compare/v0.4.0...v0.4.1) (2017-02-08)


### Bug Fixes

* include `dist` files when publishing to npm ([9b703f9](https://github.com/lightmakercanada/vuex-cognito-sync/commit/9b703f9))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/lightmakercanada/vuex-cognito-sync/compare/v0.3.0...v0.4.0) (2017-02-08)


### Features

* clear local datasets when wiping local data ([9fda1ea](https://github.com/lightmakercanada/vuex-cognito-sync/commit/9fda1ea))
* include `src` files with NPM package ([10be18a](https://github.com/lightmakercanada/vuex-cognito-sync/commit/10be18a))
* new static `wipe()` method for clearing local datasets & cached credentials ([f5867a0](https://github.com/lightmakercanada/vuex-cognito-sync/commit/f5867a0))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/lightmakercanada/vuex-cognito-sync/compare/v0.2.0...v0.3.0) (2017-01-20)


### Features

* rename `initCognitoSyncManager` action to `initSyncManager` ([6697d55](https://github.com/lightmakercanada/vuex-cognito-sync/commit/6697d55))
* renamed actions and moved some to static methods on `CognitoSync` class ([a8a1d73](https://github.com/lightmakercanada/vuex-cognito-sync/commit/a8a1d73))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/lightmakercanada/vuex-cognito-sync/compare/6dd5c3c...v0.2.0) (2017-01-20)


### Features

* initial commit ([6dd5c3c](https://github.com/lightmakercanada/vuex-cognito-sync/commit/6dd5c3c))
* make a namespaced module and support multiple instances ([5339528](https://github.com/lightmakercanada/vuex-cognito-sync/commit/5339528))
* on sync, delete existing state and repopulate from Cognito storage ([87c3796](https://github.com/lightmakercanada/vuex-cognito-sync/commit/87c3796))
* start testing builds on CircleCI ([d4e93ad](https://github.com/lightmakercanada/vuex-cognito-sync/commit/d4e93ad))
* update store with change from Cognito when synchronizing ([92b295b](https://github.com/lightmakercanada/vuex-cognito-sync/commit/92b295b))



