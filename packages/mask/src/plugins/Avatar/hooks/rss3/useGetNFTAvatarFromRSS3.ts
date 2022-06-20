import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { RSS3 as RSS3API } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import addSeconds from 'date-fns/addSeconds'
import type { RSS3_KEY_SNS } from '../../constants'
import { NFTRSSNode, RSS3Cache, SET_NFT_FLAG } from '../../types'
import { ChainId } from '@masknet/web3-shared-evm'
import type RSS3 from 'rss3-next'

export function useGetNFTAvatarFromRSS3() {
    const connection = useWeb3Connection<'all'>(NetworkPluginID.PLUGIN_EVM, { chainId: ChainId.Mainnet })

    return useAsyncFn(
        async (userId: string, address: string, snsKey: RSS3_KEY_SNS, flag: SET_NFT_FLAG) => {
            const rss = RSS3API.createRSS3(address, async (message: string) => {
                return connection?.signMessage(message, 'personalSign', { account: address }) ?? ''
            })
            const key = `${address}, ${userId}, ${snsKey}`
            let v = RSS3Cache.get(key)
            if (!v || Date.now() > v[1]) {
                RSS3Cache.set(key, [
                    _getNFTAvatarFromRSS(rss, userId, address, snsKey),
                    addSeconds(Date.now(), 60).getTime(),
                ])
            }

            v = RSS3Cache.get(key)
            const result = await v?.[0]
            return flag === SET_NFT_FLAG.NFT_PFP ? result?.nft : result?.background
        },
        [connection],
    )
}

async function _getNFTAvatarFromRSS(
    rss: RSS3,
    userId: string,
    address: string,
    snsKey: RSS3_KEY_SNS,
): Promise<NFTRSSNode | undefined> {
    const nfts = await RSS3API.getFileData<Record<string, NFTRSSNode>>(rss, address, snsKey)
    if (nfts) {
        return nfts[userId]
    }
    return RSS3API.getFileData<NFTRSSNode>(rss, address, '_nft')
}
