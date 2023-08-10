import { Lens } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function usePublicationId(txId: string) {
    return useQuery({
        queryKey: ['lens', 'transaction-publication-id', txId],
        queryFn: async () => Lens.queryTransactionPublicationId(txId),
    })
}
