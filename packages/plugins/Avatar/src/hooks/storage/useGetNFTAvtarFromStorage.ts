import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useCallback } from 'react'
import { PLUGIN_NAME } from '../../constants.js'

export function useGetNFTAvatarFromStorage() {
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    return useCallback(
        async (userId: string, address: string) => {
            if (!Storage) return
            const stringStorage = Storage.createStringStorage(PLUGIN_NAME, userId, address)
            const data = await stringStorage.getData?.<string>()
            if (!data) return
            return JSON.parse(data)
        },
        [Storage],
    )
}
