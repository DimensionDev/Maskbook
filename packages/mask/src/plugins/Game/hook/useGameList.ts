import { useAsync } from 'react-use'
import { map } from 'lodash-unified'
import { PluginGameRPC } from '../messages'
import type { GameInfo } from '../types'

export function useGameList() {
    return useAsync(async () => {
        const config = (await PluginGameRPC.getConfigGameListFromRSS()) ?? {}
        const list = map(Object.values(config), (v: GameInfo) => v)
        return list
    }, []).value
}
