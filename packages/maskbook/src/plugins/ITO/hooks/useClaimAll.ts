import { useAsyncRetry } from 'react-use'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useAllPoolsAsBuyer } from './useAllPoolsAsBuyer'
import { useITO_Contract } from '../contracts/useITO_Contract'
import type { ERC20TokenDetailed, NativeTokenDetailed } from '../../../web3/types'

export interface ClaimableAll {
    pids: string[]
    tokens: {
        [key in string]: { token: NativeTokenDetailed | ERC20TokenDetailed; amount: number }
    }
}

export function useClaimAll() {
    const account = useAccount()
    const ITO_Contract = useITO_Contract()
    const { value: pools = [] } = useAllPoolsAsBuyer(account)

    return useAsyncRetry<ClaimableAll>(async () => {
        if (pools.length === 0 || !ITO_Contract) {
            return {
                pids: [],
                tokens: {},
            }
        }
        const raws = await Promise.all(
            pools.map(async (value) => {
                const availability = await ITO_Contract.methods.check_availability(value.pool.pid).call({
                    // check availability is ok w/o account
                    from: account,
                })

                return { availability, ...value }
            }),
        )
        return raws.reduce(
            (
                acc: {
                    pids: string[]
                    tokens: {
                        [key in string]: { token: NativeTokenDetailed | ERC20TokenDetailed; amount: number }
                    }
                },
                cur,
            ) => {
                if (!cur.availability.unlocked || cur.availability.swapped === '0') return acc

                acc.pids.push(cur.pool.pid)

                const token = cur.pool.token
                const tokenAddress = token.address
                const amount = Number(cur.availability.swapped)

                if (!acc.tokens[tokenAddress]) {
                    acc.tokens[tokenAddress] = {
                        token,
                        amount,
                    }
                } else {
                    acc.tokens[tokenAddress].amount += amount
                }
                return acc
            },
            {
                pids: [],
                tokens: {},
            },
        )
    }, [pools, account])
}
