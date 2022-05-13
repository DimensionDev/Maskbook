import {
    ChainId,
    isSameAddress,
    safeNonPayableTransactionCall,
    useAccount,
    useERC721TokenContract,
} from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network'
import { PluginNFTAvatarRPC } from '../messages'
import { getNFTByOpensea } from '../utils'
import { usePersonas } from './usePersonas'

export function useTokenOwner(address: string, tokenId: string, chainId?: ChainId) {
    const ERC721Contract = useERC721TokenContract(address, chainId ?? ChainId.Mainnet)
    return useAsyncRetry(async () => {
        if (!ERC721Contract || !tokenId) return
        const nft = await getNFTByOpensea(address, tokenId)
        if (nft) return nft
        const allSettled = await Promise.allSettled([
            safeNonPayableTransactionCall(ERC721Contract?.methods.ownerOf(tokenId)),
            safeNonPayableTransactionCall(ERC721Contract.methods.name()),
            safeNonPayableTransactionCall(ERC721Contract.methods.symbol()),
        ])
        const result = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined))
        return { owner: result[0], name: result[1], symbol: result[2] }
    }, [ERC721Contract, tokenId])
}

export function useCheckTokenOwner(userId: string, owner?: string) {
    const account = useAccount()
    const { value: persona, loading } = usePersonas(userId)
    const { value: address, loading: loadingAddress } = useAsyncRetry(
        () => PluginNFTAvatarRPC.getAddress(userId, activatedSocialNetworkUI.networkIdentifier),
        [userId],
    )

    return {
        loading: loading || loadingAddress,
        isOwner: Boolean(
            (address && owner && isSameAddress(address, owner)) ||
                persona?.wallets.some((x) => isSameAddress(x.identity, owner)),
        ),
    }
}
