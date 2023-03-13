import { Flags } from '@masknet/flags'
import './setup.ui.js'

if (Flags.mask_SDK_ready) {
    import('./extension/mask-sdk/index.js')
}
