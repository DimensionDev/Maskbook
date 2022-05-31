import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { RSS3 } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import addSeconds from 'date-fns/addSeconds'
import type { RSS3_KEY_SNS } from '../../constants'
import { NFTRSSNode, RSS3Cache } from '../../types'

export function useGetNFTAvatarFromRSS3() {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    return useAsyncFn(
        async (userId: string, address: string, snsKey: RSS3_KEY_SNS) => {
            const key = `${address}, ${userId}, ${snsKey}`
            let v = RSS3Cache.get(key)
            if (!v || Date.now() > v[1]) {
                RSS3Cache.set(key, [
                    _getNFTAvatarFromRSS(connection, userId, address, snsKey),
                    addSeconds(Date.now(), 60).getTime(),
                ])
            }

            v = RSS3Cache.get(key)
            const result = await v?.[0]
            return result?.nft
        },
        [connection],
    )
}

async function _getNFTAvatarFromRSS(
    connection: any,
    userId: string,
    address: string,
    snsKey: RSS3_KEY_SNS,
): Promise<NFTRSSNode | undefined> {
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return connection.signMessage(message, address)
    })

    const nfts = await RSS3.getFileData<Record<string, NFTRSSNode>>(rss, address, snsKey)
    if (nfts) {
        return nfts[userId]
    }
    return RSS3.getFileData<NFTRSSNode>(rss, address, '_nft')
}
