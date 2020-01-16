import { MessageCenter as MC } from '@holoflows/kit/es'
import Serialization from '../utils/type-transform/Serialization'

interface PluginMessages {
    'maskbook.wallets.update': void
}
export const PluginMessageCenter = new MC<PluginMessages>('maskbook-plugin-events')
PluginMessageCenter.serialization = Serialization
