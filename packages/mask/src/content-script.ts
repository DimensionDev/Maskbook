import './setup.ui'
import { Flags } from './utils/flags'

if (Flags.mask_SDK_ready) {
    import('./extension/mask-sdk')
}
