import { useAsyncRetry } from 'react-use'
import { unionBy } from 'lodash-es'
import {
    getChainDetailed,
    useAccount,
    useChainId,
    FungibleTokenDetailed,
    useFungibleTokensDetailed,
    FungibleToken,
    useITOConstants,
    ChainId,
} from '@masknet/web3-shared'
import type { ITO2 } from '@masknet/web3-contracts/types/ITO2'
import { useClaimablePoolsByWeb3 } from './useClaimablePoolsByWeb3'
import { useClaimablePoolsBySubgraph } from './useClaimablePoolsBySubgraph'
import { useITO_Contract } from './useITO_Contract'
import { useMemo } from 'react'

export interface SwappedToken {
    pids: string[]
    amount: number
    token: FungibleTokenDetailed
    isClaimable: boolean
    unlockTime: Date
}

export function useClaimablePools(isMainnetOld = false) {
    const account = useAccount()
    const chainId = useChainId()
    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    // Todo: Remove the code after the period that old ITO is being used and continues to be used for a while
    const { contract: ITO_Contract } = useITO_Contract(isMainnetOld ? ITO_CONTRACT_ADDRESS : undefined)

    //#region fetch claimable pool
    const { value: poolsFromSubgraph = [], loading: loadingSubgraph } = useClaimablePoolsBySubgraph()
    const { value: poolsFromWeb3 = [], loading: loadingWeb3 } = useClaimablePoolsByWeb3()
    // One of them works is okay
    const loadingPool = loadingSubgraph && loadingWeb3
    const isPoolsFromWeb3Empty = poolsFromWeb3.length === 0
    const _pools = unionBy(poolsFromWeb3, poolsFromSubgraph, 'pid')
    //#endregion

    //#region fetch list of token detail
    const _tokens = useMemo(
        () =>
            _pools.reduce<Pick<FungibleToken, 'address' | 'type'>[]>((acc, cur) => {
                if (acc.every((p) => p.address !== cur.token.address)) acc.push(cur.token)
                return acc
            }, []),
        [JSON.stringify(_pools)],
    )

    // No need to fetch token details again since subgraph returns it.
    const { value: tokens, loading: loadingTokens } = useFungibleTokensDetailed(_tokens)
    const pools = isPoolsFromWeb3Empty
        ? _pools
        : _pools.map((p, i) => {
              if (tokens) {
                  const token = tokens.find((t) => t.address === p.token.address)
                  if (token) p.token = token
              }
              return p
          })
    //#endregion

    const loading = loadingPool || loadingTokens

    return useAsyncRetry(async () => {
        const chainDetailed = getChainDetailed(chainId)
        if (!chainDetailed) return []
        if (isMainnetOld && chainId !== ChainId.Mainnet) return []
        if (!ITO_Contract || loading) return undefined
        if (pools.length === 0) return []

        const raws = await Promise.all(
            pools.map(async (value) => {
                const availability = await (ITO_Contract as ITO2).methods.check_availability(value.pid).call({
                    from: account,
                })
                return { availability, ...value }
            }),
        )
        const swappedTokens: SwappedToken[] = raws
            .filter(
                (raw) =>
                    !raw.availability.claimed &&
                    raw.availability.swapped !== '0' &&
                    Number(raw.availability.end_time) * 1000 < Number(raw.availability.unlock_time) * 1000,
            )
            .map((raw) => {
                return {
                    pids: [raw.pid],
                    amount: Number(raw.availability.swapped),
                    token: raw.token,
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
    }, [JSON.stringify(pools), account, chainId, loading])
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
