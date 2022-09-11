import './setup.ui.js'
import { Flags } from '../shared/index.js'

if (Flags.mask_SDK_ready) {
    import('./extension/mask-sdk/index.js')
}
