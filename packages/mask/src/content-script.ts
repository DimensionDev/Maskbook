import './setup.ui'
import { Flags } from '../shared'
import { setupDecryptHelper } from '@masknet/injected-script'
import Services from './extension/service'

if (Flags.mask_SDK_ready) {
    import('./extension/mask-sdk')
}

if (Flags.decryptByTwitterXHRInjection && location.origin.includes('twitter.com')) {
    setupDecryptHelper(Services.Crypto.tryDecryptTwitterPublicEncryption)
}
