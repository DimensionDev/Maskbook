import './setup.ui'
import { Flags } from '@masknet/shared'

if (Flags.mask_SDK_ready) {
    import('./extension/mask-sdk')
}
