import { useAsync } from 'react-use'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PluginGameRPC } from '../messages'
import type { GameInfo } from '../types'
import { useGameConstants } from '@masknet/web3-shared-evm'

export function useGameList() {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { GAME_CONFIG_ADDRESS = '' } = useGameConstants()
    return useAsync(async () => {
        const config = (await PluginGameRPC.getConfigGameListFromRSS(connection, GAME_CONFIG_ADDRESS)) ?? {}
        return Object.values(config) as GameInfo[]
    }, [GAME_CONFIG_ADDRESS]).value
}
