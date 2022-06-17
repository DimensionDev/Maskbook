import { RSS3 } from '@masknet/web3-providers'
import type { Constant } from '@masknet/web3-shared-base/src/utils/types'
import type { GameRSSNode } from '../types'
import { GAME_CONFIG_ADDRESS } from '../constants'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const cache = new Map<string, Record<string, Constant> | undefined>()

export async function getConfigGameListFromRSS(connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>) {
    const v = cache.get(GAME_CONFIG_ADDRESS)
    if (v) return v
    const rss = RSS3.createRSS3(GAME_CONFIG_ADDRESS, async (message: string) => {
        return connection.signMessage(message, 'personalSign', { account: GAME_CONFIG_ADDRESS })
    })
    const data = await RSS3.getFileData<GameRSSNode>(rss, GAME_CONFIG_ADDRESS, '_nff_game_list')
    cache.set(GAME_CONFIG_ADDRESS, data?.games)
    return data?.games
}
