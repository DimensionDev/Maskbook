import { useAsyncRetry } from 'react-use'
import type { ChainId } from '@masknet/web3-shared-evm'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3Connection, useAccount } from '@masknet/plugin-infra/web3'
import { activatedSocialNetworkUI } from '../../../social-network'
import { PluginNFTAvatarRPC } from '../messages'
import { usePersonas } from './usePersonas'

export function useTokenOwner(address: string, tokenId: string, chainId?: ChainId) {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!address || !tokenId || !connection) return
        const token = await connection.getNonFungibleToken(address, tokenId, undefined, { chainId, account })
        return { owner: token?.ownerId, name: token?.contract?.name, symbol: token?.contract?.symbol }
    }, [connection, tokenId, address, account, chainId])
}

export function useCheckTokenOwner(userId: string, owner?: string) {
    const { value: persona, loading } = usePersonas(userId)
    const { value: address, loading: loadingAddress } = useAsyncRetry(
        async () => PluginNFTAvatarRPC.getAddress(userId, activatedSocialNetworkUI.networkIdentifier),
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
