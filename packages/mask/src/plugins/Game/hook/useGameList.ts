import { useAsync } from 'react-use'
import { map } from 'lodash-unified'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PluginGameRPC } from '../messages'
import type { GameInfo } from '../types'

export function useGameList() {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    return useAsync(async () => {
        const config = (await PluginGameRPC.getConfigGameListFromRSS(connection)) ?? {}
        const list = map(Object.values(config), (v: GameInfo) => v)
        return list
    }, []).value
}
