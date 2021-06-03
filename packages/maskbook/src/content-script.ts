import './extension/content-script/hmr'
import Services from './extension/service'
import { status } from './setup.ui'

status.then((loaded) => {
    loaded && import('./extension/content-script/tasks')
})

// The scope should be the ./ of the web page
Services.ThirdPartyPlugin.isSDKEnabled(new URL('./', location.href).href).then((result) => {
    result && import('./extension/external-sdk')
})
