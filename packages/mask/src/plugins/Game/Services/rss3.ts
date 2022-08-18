import { RSS3 } from '@masknet/web3-providers'
import type { Constant } from '@masknet/web3-shared-base/src/utils/types'
import type { GameRSSNode } from '../types'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const cache = new Map<string, Record<string, Constant> | undefined>()

export async function getConfigGameListFromRSS(
    connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>,
    configAddress: string,
) {
    const v = cache.get(configAddress)
    if (v) return v
    const rss = RSS3.createRSS3(configAddress, async (message: string) => {
        return connection.signMessage(message, 'personalSign', { account: configAddress })
    })
    const data = await RSS3.getFileData<GameRSSNode>(rss, configAddress, '_nff_game_list')
    cache.set(configAddress, data?.games)
    return data?.games
}
