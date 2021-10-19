//#region Polyfills
import './polyfill'
// @ts-ignore WebCrypto
import { crypto } from 'webcrypto-liner/build/index.es'
Object.defineProperty(globalThis, 'crypto', { configurable: true, enumerable: true, get: () => crypto })
//#endregion

import './extension/service' // setup Services.*
import './utils/native-rpc' // setup Android and iOS API server
import './social-network-adaptor' // setup social network providers
import './extension/background-script/Jobs' // start jobs
import './utils/debug/general'
