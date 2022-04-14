import { NextIDPlatform } from '@masknet/shared-base'
import { isSameAddress, useAccount, useERC721TokenContract } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { usePersonas } from './usePersonas'

export function useTokenOwner(address: string, tokenId: string) {
    const ERC721Contract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!ERC721Contract || !tokenId) return
        const owner = await ERC721Contract?.methods.ownerOf(tokenId).call()
        const name = await ERC721Contract.methods.name().call()
        const symbol = await ERC721Contract.methods.symbol().call()

        return { owner, name, symbol }
    }, [ERC721Contract, tokenId])
}

export function useCheckTokenOwner(owner?: string) {
    const account = useAccount()
    const { binds, loading } = usePersonas()

    return {
        loading,
        isOwner: Boolean(
            account &&
                owner &&
                (isSameAddress(account, owner) ||
                    binds?.proofs
                        .filter((x) => x.platform === NextIDPlatform.Ethereum)
                        .filter((x) => isSameAddress(x.identity, owner))),
        ),
    }
}
