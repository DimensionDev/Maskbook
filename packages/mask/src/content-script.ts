import './setup.ui'
import { Flags } from '../shared'

if (Flags.mask_SDK_ready) {
    import('./extension/mask-sdk')
}
