import { useAsyncRetry } from 'react-use'

const mutualIdeaTokens = [
    {
        name: 'Number #1',
        rank: '2',
        price: '0.7$',
        mutualHolders: 2,
        mutualQuantity: 7096,
    },
    {
        name: 'Number #2',
        rank: '6',
        price: '0.1$',
        mutualHolders: 1,
        mutualQuantity: 154,
    },
    {
        name: 'Number #3',
        rank: '6',
        price: '0.1$',
        mutualHolders: 1,
        mutualQuantity: 154,
    },
    {
        name: 'Number #4',
        rank: '6',
        price: '0.1$',
        mutualHolders: 1,
        mutualQuantity: 154,
    },
    {
        name: 'Number #5',
        rank: '6',
        price: '0.1$',
        mutualHolders: 1,
        mutualQuantity: 154,
    },
]

export function useMutualHoldersTokens(tokenId: string, pagination: number) {
    return useAsyncRetry(async () => {
        if (!tokenId || !pagination) return
        return mutualIdeaTokens
    }, [tokenId, pagination])
}
