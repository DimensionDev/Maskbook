import { useAsyncRetry } from 'react-use'
import { ERC721TokenDetailed, getERC721TokenDetailedFromChain, useERC721TokenContracts } from '@masknet/web3-shared'

export const useCollectibleOwners = (tokens: ERC721TokenDetailed[]) => {
    const contracts = useERC721TokenContracts(tokens.map((x) => x.contractDetailed.address))

    return useAsyncRetry(async () => {
        if (!tokens.length) return

        const calls = tokens.map((x) => {
            const contract = contracts.find((c) => c.options.address)
            if (!contract) return null
            return getERC721TokenDetailedFromChain(x.contractDetailed, contract, x.tokenId)
        })

        const result = await Promise.all(calls)
        return result.filter(Boolean)
    }, [tokens.length])
}
