import { Lens } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function usePublicationId(txId: string | null) {
    return useQuery({
        queryKey: ['lens', 'transaction-publication-id', txId],
        queryFn: async () => {
            if (!txId) return null
            return Lens.queryTransactionPublicationId(txId)
        },
    })
}
