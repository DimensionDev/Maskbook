import { useAsyncRetry } from 'react-use'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useAllPoolsAsBuyer } from './useAllPoolsAsBuyer'
import { useITO_Contract } from '../contracts/useITO_Contract'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'

export interface SwappedToken {
    pids: string[]
    amount: number
    token: EtherTokenDetailed | ERC20TokenDetailed
    isClaimable: boolean
    unlockTime: Date
}

export function useClaimAll() {
    const account = useAccount()
    const ITO_Contract = useITO_Contract()
    const { value: pools = [] } = useAllPoolsAsBuyer(account)

    return useAsyncRetry<SwappedToken[]>(async () => {
        if (pools.length === 0 || !ITO_Contract) {
            return []
        }
        const raws = await Promise.all(
            pools.map(async (value) => {
                const availability = await ITO_Contract.methods.check_availability(value.pool.pid).call({
                    from: account,
                })

                return { availability, ...value }
            }),
        )
        const swappedTokens: SwappedToken[] = raws
            .filter((raw) => raw.availability.swapped !== '0')
            .map((raw) => {
                return {
                    pids: [raw.pool.pid],
                    amount: Number(raw.availability.swapped),
                    token: raw.pool.token,
                    isClaimable: raw.availability.unlocked,
                    unlockTime: new Date(Number(raw.availability.unlock_time) * 1000),
                }
            })
            .reduce((acc: SwappedToken[], cur) => {
                if (acc.some((t) => t.token.address === cur.token.address && t.isClaimable) && cur.isClaimable) {
                    const existToken = acc.find((t) => t.token.address === cur.token.address)
                    const existTokenIndex = acc.findIndex((t) => t.token.address === cur.token.address)
                    existToken!.pids = existToken!.pids.concat(cur.pids)
                    existToken!.amount = existToken!.amount + cur.amount
                    acc[existTokenIndex] = existToken!
                } else {
                    acc.push(cur)
                }
                return acc
            }, [])
            .sort((a, b) => b.unlockTime.getTime() - a.unlockTime.getTime())
        return swappedTokens
    }, [pools, account])
}
