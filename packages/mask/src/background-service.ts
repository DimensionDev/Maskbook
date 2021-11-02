//#region Polyfills
import './polyfill'
import './polyfill/web-apis/secp256k1'

import './extension/service' // setup Services.*
import './utils/native-rpc' // setup Android and iOS API server
import './social-network-adaptor' // setup social network providers
import './extension/background-script/Jobs' // start jobs
import './utils/debug/general'
