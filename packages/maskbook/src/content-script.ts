import './extension/content-script/hmr'
import Services from './extension/service'
import './setup.ui'

// The scope should be the ./ of the web page
const currentLocation = new URL('./', location.href).href
Services.ThirdPartyPlugin.isSDKEnabled(currentLocation).then((result) => {
    result && import('./extension/external-sdk')
})

// we cannot inject to the globalThis, because this function will loaded after the third party javascript loaded
// so globalThis.masklogin would be `undefined` for a long time
// Object.defineProperty(globalThis, 'masklogin',{
//     enumerable: true,
//     configurable: true,
//     value: Services.WebAuthn,
//     writable: false
// })
