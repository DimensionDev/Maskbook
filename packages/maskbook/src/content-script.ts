import './extension/content-script/hmr'
import Services from './extension/service'
import './setup.ui'

// The scope should be the ./ of the web page
const currentLocation = new URL('./', location.href).href
Services.ThirdPartyPlugin.isSDKEnabled(currentLocation).then((result) => {
    result && import('./extension/external-sdk')
})
