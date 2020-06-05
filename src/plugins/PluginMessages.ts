import { MessageCenter as MC } from '@holoflows/kit/es'
import Serialization from '../utils/type-transform/Serialization'

interface PluginMessages {
    'maskbook.wallets.update': void
    'maskbook.wallets.reset': void
    'maskbook.red_packets.update': void
    'maskbook.gitcoin.update': void
}
export const PluginMessageCenter = new MC<PluginMessages>(true, 'maskbook-plugin-events')
PluginMessageCenter.serialization = Serialization
