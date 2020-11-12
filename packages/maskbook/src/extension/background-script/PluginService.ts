import * as RedPacket from '../../plugins/RedPacket/services'
import * as Wallet from '../../plugins/Wallet/services'
import * as Trader from '../../plugins/Trader/services'
import * as Election2020 from '../../plugins/Election2020/services'

const Plugins = {
    'maskbook.red_packet': RedPacket,
    'maskbook.wallet': Wallet,
    'maskbook.trader': Trader,
    'maskbook.election2020': Election2020,
} as const
type Plugins = typeof Plugins
/**
 * @deprecated
 * Please manage plugin RPC in the plugin. We suggest to use createPluginMessage + AsyncCall.
 */
export async function invokePlugin<K extends keyof Plugins, M extends keyof Plugins[K], P extends Plugins[K][M]>(
    key: K,
    method: M,
    ...args: Parameters<P extends (...args: any) => any ? P : never>
): Promise<P extends (...args: any) => Promise<infer R> ? R : never> {
    // @ts-ignore
    return Plugins[key][method](...args)
}
