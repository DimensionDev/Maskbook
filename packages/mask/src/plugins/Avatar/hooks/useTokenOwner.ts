import { NextIDPlatform } from '@masknet/shared-base'
import {
    isSameAddress,
    safeNonPayableTransactionCall,
    useAccount,
    useERC721TokenContract,
} from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { usePersonas } from './usePersonas'

export function useTokenOwner(address: string, tokenId: string) {
    const ERC721Contract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!ERC721Contract || !tokenId) return
        const owner = await safeNonPayableTransactionCall(ERC721Contract?.methods.ownerOf(tokenId))
        const name = await safeNonPayableTransactionCall(ERC721Contract.methods.name())
        const symbol = await safeNonPayableTransactionCall(ERC721Contract.methods.symbol())

        return { owner, name, symbol }
    }, [ERC721Contract, tokenId])
}

export function useCheckTokenOwner(owner?: string) {
    const account = useAccount()
    const { value: persona, loading } = usePersonas()

    return {
        loading,
        isOwner: Boolean(
            account &&
                owner &&
                (isSameAddress(account, owner) ||
                    persona?.binds?.proofs
                        .filter((x) => x.platform === NextIDPlatform.Ethereum)
                        .filter((x) => isSameAddress(x.identity, owner))),
        ),
    }
}
