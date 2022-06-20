import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { RSS3 } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import type { RSS3_KEY_SNS } from '../../constants'
import { AvatarMetaDB, SET_NFT_FLAG, NFTRSSNode, RSS3Cache } from '../../types'

export function useSaveAvatarToRSS3() {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    return useAsyncFn(
        async (address: string, nft: AvatarMetaDB, signature: string, snsKey: RSS3_KEY_SNS, flag: SET_NFT_FLAG) => {
            const rss = RSS3.createRSS3(address, async (message: string) => {
                return connection.signMessage(message, 'personalSign', { account: address }) ?? ''
            })
            let _nfts = await RSS3.getFileData<Record<string, NFTRSSNode>>(rss, address, snsKey)
            if (!_nfts) {
                _nfts = {
                    [nft.userId]: {
                        signature,
                        nft: flag === SET_NFT_FLAG.NFT_PFP ? nft : undefined,
                        background: flag === SET_NFT_FLAG.NFT_BACKGROUND ? nft : undefined,
                    },
                }
            } else {
                _nfts[nft.userId] = {
                    signature,
                    nft: flag === SET_NFT_FLAG.NFT_PFP ? nft : _nfts[nft.userId].nft,
                    background: flag === SET_NFT_FLAG.NFT_BACKGROUND ? nft : _nfts[nft.userId].background,
                }
            }
            await RSS3.setFileData(rss, address, snsKey, _nfts)
            // clear cache
            if (RSS3Cache.has(address)) RSS3Cache.delete(address)
            return nft
        },
        [connection],
    )
}
