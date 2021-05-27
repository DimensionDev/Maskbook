import { useAsyncRetry } from 'react-use'
import { useChainId } from '../../../web3/hooks/useChainId'
import { checkIfChainSupport } from '../../../web3/pipes'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useAllPoolsAsBuyer } from './useAllPoolsAsBuyer'
import { useITO_Contract } from '../contracts/useITO_Contract'
import type { FungibleTokenDetailed } from '../../../web3/types'

export interface SwappedToken {
    pids: string[]
    amount: number
    token: FungibleTokenDetailed
    isClaimable: boolean
    unlockTime: Date
}

export function useClaimAll() {
    const account = useAccount()
    const chainId = useChainId()
    const ITO_Contract = useITO_Contract()
    const { value: pools = [], loading } = useAllPoolsAsBuyer(account)

    return useAsyncRetry(async () => {
        if (!checkIfChainSupport(chainId)) return []
        if (!ITO_Contract || loading) return undefined
        if (pools.length === 0) return []

        const raws = await Promise.all(
            pools.map(async (value) => {
                const availability = await ITO_Contract.methods.check_availability(value.pool.pid).call({
                    from: account,
                })

                return { availability, ...value }
            }),
        )
        const swappedTokens: SwappedToken[] = raws
            .filter(
                (raw) =>
                    raw.availability.swapped !== '0' && raw.pool.end_time < Number(raw.availability.unlock_time) * 1000,
            )
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
                if (acc.some(checkClaimable(cur)) && cur.isClaimable) {
                    // merge same claimable tokens to one
                    const existToken = acc.find(checkClaimable(cur))
                    const existTokenIndex = acc.findIndex(checkClaimable(cur))
                    acc[existTokenIndex] = mergeTokens(existToken!, cur)
                } else if (acc.some(checkUnlockTimeEqual(cur))) {
                    // merge same unlock time tokens to one
                    const existToken = acc.find(checkUnlockTimeEqual(cur))
                    const existTokenIndex = acc.findIndex(checkUnlockTimeEqual(cur))
                    acc[existTokenIndex] = mergeTokens(existToken!, cur)
                } else {
                    acc.push(cur)
                }
                return acc
            }, [])
            .sort((a, b) => b.unlockTime.getTime() - a.unlockTime.getTime())
        return swappedTokens
    }, [pools, account, chainId, loading])
}

function checkUnlockTimeEqual(cur: SwappedToken) {
    return (t: SwappedToken) =>
        t.token.address === cur.token.address && t.unlockTime.getTime() === cur.unlockTime.getTime()
}

function checkClaimable(cur: SwappedToken) {
    return (t: SwappedToken) => t.token.address === cur.token.address && t.isClaimable
}

function mergeTokens(a: SwappedToken, b: SwappedToken) {
    a.pids = a.pids.concat(b.pids)
    a.amount += b.amount
    return a
}
