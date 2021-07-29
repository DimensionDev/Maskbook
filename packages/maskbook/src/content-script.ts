import './extension/content-script/hmr'
import Services from './extension/service'
import './setup.ui'

// The scope should be the ./ of the web page
const rootHref = new URL('./', location.href).href
console.log('rootHref:', rootHref)
Services.ThirdPartyPlugin.isSDKEnabled(rootHref).then((result) => {
    console.log('result', result)
    result && import('./extension/external-sdk')
})
