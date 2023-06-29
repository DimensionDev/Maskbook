import { useAsync } from 'react-use'
import { useGameConstants } from '@masknet/web3-shared-evm'
import { Web3Storage } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { GameRSSNode, GameInfo } from '../types.js'

export function useGameList() {
    const { GAME_CONFIG_ADDRESS = '' } = useGameConstants()

    const { value } = useAsync(async () => {
        const storage = Web3Storage.createFireflyStorage('Game', GAME_CONFIG_ADDRESS)
        const config = await storage.get<GameRSSNode>('_nff_game_list')
        if (!config) return EMPTY_LIST
        return Object.values(config.games) as GameInfo[]
    }, [GAME_CONFIG_ADDRESS, Storage])

    return value
}
