import * as RedPacket from '../../plugins/Wallet/red-packet-fsm'
import * as Wallet from '../../plugins/Wallet/wallet'
import * as Gitcoin from '../../plugins/Gitcoin/Services'

const Plugins = {
    'maskbook.red_packet': RedPacket,
    'maskbook.wallet': Wallet,
    'co.gitcoin': Gitcoin,
} as const
type Plugins = typeof Plugins
export async function invokePlugin<K extends keyof Plugins, M extends keyof Plugins[K], P extends Plugins[K][M]>(
    key: K,
    method: M,
    ...args: Parameters<P extends (...args: any) => any ? P : never>
): Promise<P extends (...args: any) => Promise<infer R> ? R : never> {
    // @ts-ignore
    return Plugins[key][method](...args)
}
