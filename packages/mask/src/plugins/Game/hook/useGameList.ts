import { useAsync } from 'react-use'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { useGameConstants } from '@masknet/web3-shared-evm'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { GameRSSNode } from '../types'

export function useGameList() {
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { GAME_CONFIG_ADDRESS = '' } = useGameConstants()

    const { value } = useAsync(async () => {
        if (!Storage) return EMPTY_LIST
        const storage = Storage.createRSS3Storage(GAME_CONFIG_ADDRESS)
        const config = await storage.get<GameRSSNode>('_nff_game_list')
        if (!config) return EMPTY_LIST

        return Object.values(config)
    }, [GAME_CONFIG_ADDRESS, Storage])

    return value
}
