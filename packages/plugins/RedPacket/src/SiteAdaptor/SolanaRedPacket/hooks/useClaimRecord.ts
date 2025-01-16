import { useQuery } from '@tanstack/react-query'
import type { Cluster } from '@solana/web3.js'
import { getClaimRecord } from '../../helpers/getClaimRecord.js'

export function useClaimRecord(account: string, accountId: string, cluster: Cluster) {
    return useQuery({
        queryKey: ['red-packet', 'claim-record', account, accountId, cluster],
        queryFn: async () => getClaimRecord({ cluster, accountId, account }),
    })
}
