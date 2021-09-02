import Services from './extension/service'
import './setup.ui'

// The scope should be the ./ of the web page
Services.ThirdPartyPlugin.isSDKEnabled(new URL('./', location.href).href).then((result) => {
    result && import('./extension/external-sdk')
})
