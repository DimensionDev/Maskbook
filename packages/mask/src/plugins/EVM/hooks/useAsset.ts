import { useAsyncRetry } from 'react-use'
import {
    NonFungibleAssetProvider,
    currySameAddress,
    isSameAddress,
    useAccount,
    useChainId,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../messages'

export function useAsset(address: string, tokenId: string, provider: NonFungibleAssetProvider) {
    const account = useAccount()
    const chainId = useChainId()
    const { WNATIVE_ADDRESS } = useTokenConstants()

    return useAsyncRetry(async () => {
        const asset = await EVM_RPC.getAsset(address, tokenId, chainId, provider)

        return {
            ...asset,
            isOrderWeth: isSameAddress(asset?.desktopOrder?.payment_token ?? '', WNATIVE_ADDRESS) ?? false,
            isCollectionWeth: asset?.collection?.payment_tokens?.some(currySameAddress(WNATIVE_ADDRESS)) ?? false,
            isOwner:
                asset?.top_ownerships.some((item: { owner: { address: string | undefined } }) =>
                    isSameAddress(item.owner.address, account),
                ) ?? false,
        }
    }, [account, chainId, WNATIVE_ADDRESS, address, tokenId, provider])
}
