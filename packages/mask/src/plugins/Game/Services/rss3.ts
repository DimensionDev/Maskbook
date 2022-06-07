import { RSS3 } from '@masknet/web3-providers'
import type { Constant } from '@masknet/web3-shared-base/src/utils/types'
import { WalletRPC } from '../../Wallet/messages'
import type { GameRSSNode } from '../types'
import { GAME_CONFIG_ADDRESS } from '../constants'

const cache = new Map<string, Record<string, Constant> | undefined>()

export async function getConfigGameListFromRSS() {
    const v = cache.get(GAME_CONFIG_ADDRESS)
    if (v) return v
    const rss = RSS3.createRSS3(GAME_CONFIG_ADDRESS, async (message: string) => {
        return WalletRPC.signPersonalMessage(message, GAME_CONFIG_ADDRESS)
    })
    const data = await RSS3.getFileData<GameRSSNode>(rss, GAME_CONFIG_ADDRESS, '_nff_game_list')
    cache.set(GAME_CONFIG_ADDRESS, data?.games)
    return data?.games
}
