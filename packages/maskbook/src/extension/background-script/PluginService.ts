import * as RedPacket from '../../plugins/RedPacket/services'
import * as Wallet from '../../plugins/Wallet/services'
import * as Gitcoin from '../../plugins/Gitcoin/service'
import * as Poll from '../../plugins/Polls/Services'
import * as FileService from '../../plugins/FileService/service'
import * as Trader from '../../plugins/Trader/services'

const Plugins = {
    'maskbook.red_packet': RedPacket,
    'maskbook.wallet': Wallet,
    'maskbook.fileservice': FileService,
    'maskbook.trader': Trader,
    'maskbook.polls': Poll,
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
