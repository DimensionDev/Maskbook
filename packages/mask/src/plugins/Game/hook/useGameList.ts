import { useAsync } from 'react-use'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { useGameConstants } from '@masknet/web3-shared-evm'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { GameRSSNode, GameInfo } from '../types.js'
import { parseJSON } from '@masknet/web3-providers'

export function useGameList() {
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { GAME_CONFIG_ADDRESS = '' } = useGameConstants()

    const { value } = useAsync(async () => {
        if (!Storage) return EMPTY_LIST
        const storage = Storage.createStringStorage('Game', GAME_CONFIG_ADDRESS)
        const result = await storage.get<string>('_nff_game_list')
        if (!result) return EMPTY_LIST
        const config = parseJSON<GameRSSNode>(result)
        if (!config) return EMPTY_LIST
        return Object.values(config.games) as GameInfo[]
    }, [GAME_CONFIG_ADDRESS, Storage])

    return value
}
