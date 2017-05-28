// @flow
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore } from 'redux-persist'
import allModels from 'models/allModels'
import immutableTransform from 'redux-persist-transform-immutable'

/// #if !isElectron
import path from 'path'
import os from 'os'
import { AsyncNodeStorage } from 'redux-persist-node-storage'
/// #endif

let loginStore = null
let fullStore = null
let currentPrefix = null
const fullStoreChangeCallbacks = []

export function createLoginStore() {
  const enhancerCreator = (process.env.NODE_ENV === 'production')
    ? require('./configureEnhancer.production')
    : require('./configureEnhancer.development')

  const enhancer = enhancerCreator('Login store')
  const reducer = require('reducers/combined/commonReducer')

  const store = createStore(reducer, undefined, enhancer)

  const onComplete = new Promise((resolve) => {
    persistStore(store, {
      blacklist: ['ui', 'form'],
      transforms: [immutableTransform({records: allModels})],
/// #if !isElectron
      storage: new AsyncNodeStorage(path.join(os.homedir(), '.arbore-contactAdder')),
/// #endif
    }, () => { resolve(store) })
  })

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('reducers/combined/commonReducer', () => (
      store.replaceReducer(require('reducers/combined/commonReducer'))
    ))
  }

  return { store, onComplete }
}

export function createFullStore(prefix: string, name: string) {
  const enhancerCreator = (process.env.NODE_ENV === 'production')
    ? require('./configureEnhancer.production')
    : require('./configureEnhancer.development')

  const enhancer = enhancerCreator('Full store: ' + name)
  const reducer = require('reducers/combined/fullReducer')

  const store = createStore(reducer, undefined, enhancer)

  const onComplete = new Promise((resolve) => {
    persistStore(store, {
      blacklist: ['ui', 'form'],
      transforms: [immutableTransform({records: allModels})],
      keyPrefix: '@'+prefix+':',
/// #if !isElectron
      storage: new AsyncNodeStorage(path.join(os.homedir(), '.arbore-contactAdder')),
/// #endif
    }, () => { resolve(store) })
  })

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('reducers/combined/fullReducer', () => (
      store.replaceReducer(require('reducers/combined/fullReducer'))
    ))
  }

  return { store, onComplete }
}

export function addfullStoreChangeCallback(callback: (any) => any) {
  fullStoreChangeCallbacks.push(callback)
}

export function getLoginStore() {
  if(!loginStore) {
    const { store, onComplete } = createLoginStore()
    loginStore = store

    return onComplete
  }

  return Promise.resolve(loginStore)
}

export function getFullStore(prefix, name) {
  if(prefix !== currentPrefix) {
    const { store, onComplete } = createFullStore(prefix, name)
    fullStore = store
    currentPrefix = prefix

    fullStoreChangeCallbacks.forEach(callback => callback(onComplete))

    return onComplete
  }
  return Promise.resolve(fullStore)
}
