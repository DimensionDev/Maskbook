import { useMemo } from 'react'
import { useAccount, useMutlipleContractSingleData } from '@masknet/web3-shared'
import { usePoolTogetherTicketContracts } from '../contracts/usePoolTogetherTicket'
import type { PoolTogetherTicket } from '@masknet/web3-contracts/types/PoolTogetherTicket'
import { useAsyncRetry } from 'react-use'
import type { AccountPool, Pool } from '../types'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/**
 * A callback for getting account balances of ticket pools
 * @param pools
 */
export function useAccountBalance(pools: Pool[]) {
    const account = useAccount()
    const ticketContracts = usePoolTogetherTicketContracts(pools.map((pool) => pool.tokens.ticket.address)).filter(
        Boolean,
    ) as PoolTogetherTicket[]

    const [results, calls, _, callback] = useMutlipleContractSingleData(
        ticketContracts,
        Array.from<'balanceOf'>({ length: ticketContracts.length }).fill('balanceOf'),
        [account || ZERO_ADDRESS],
    )
    const asyncResults = useAsyncRetry(() => callback(calls), [calls])

    const values = useMemo(() => {
        return results.length !== 0
            ? pools.map(
                  (pool, i) =>
                      ({
                          pool: pool,
                          account: {
                              ticketBalance: results[i].value,
                              userAddress: account,
                          },
                      } as AccountPool),
              )
            : undefined
    }, [account, ticketContracts, asyncResults, results])

    return {
        ...asyncResults,
        value: values,
    }
}
