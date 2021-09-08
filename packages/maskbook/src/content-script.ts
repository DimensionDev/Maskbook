import Services from './extension/service'
import './setup.ui'
import { Flags } from './utils/flags'

// The scope should be the ./ of the web page
Services.ThirdPartyPlugin.isSDKEnabled(new URL('./', location.href).href).then((result) => {
    result && import('./extension/external-sdk')
})

if (Flags.mask_SDK_ready) {
    import('./extension/mask-sdk')
}
