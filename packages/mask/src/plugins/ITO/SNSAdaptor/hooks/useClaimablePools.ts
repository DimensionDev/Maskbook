import { useAsyncRetry } from 'react-use'
import { useClaimablePoolsByWeb3 } from './useClaimablePoolsByWeb3'
import { unionBy } from 'lodash-unified'
import {
    getChainDetailed,
    useAccount,
    FungibleTokenDetailed,
    useFungibleTokensDetailed,
    useITOConstants,
    ChainId,
    FungibleToken,
} from '@masknet/web3-shared-evm'
import { useClaimablePoolsBySubgraph } from './useClaimablePoolsBySubgraph'
import { checkAvailability } from '../../Worker/apis/checkAvailability'
import { useMemo } from 'react'

export interface SwappedToken {
    pids: string[]
    amount: number
    token: FungibleTokenDetailed
    isClaimable: boolean
    unlockTime: Date
}

export function useClaimablePools(chainId: ChainId, isMainnetOld = false) {
    const account = useAccount()
    const { ITO_CONTRACT_ADDRESS, ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const contractAddress = isMainnetOld ? ITO_CONTRACT_ADDRESS : ITO2_CONTRACT_ADDRESS
    //#region fetch claimable pool
    const { value: poolsFromSubgraph = [], loading: loadingSubgraph } = useClaimablePoolsBySubgraph(chainId)
    const { value: poolsFromWeb3 = [], loading: loadingWeb3 } = useClaimablePoolsByWeb3(chainId)
    const loadingPool = loadingSubgraph || loadingWeb3
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
    const { value: tokens, loading: loadingTokens } = useFungibleTokensDetailed(_tokens, chainId)
    const pools = isPoolsFromWeb3Empty
        ? _pools
        : _pools.map((p, i) => {
              if (tokens) {
                  const token = tokens.find((t) => t.address === p.token.address)
                  if (token) return { ...p, token }
              }
              return p
          })
    //#endregion

    const loading = loadingPool || loadingTokens

    return useAsyncRetry(async () => {
        const chainDetailed = getChainDetailed(chainId)

        if (!chainDetailed || loading) return undefined
        if ((isMainnetOld && chainId !== ChainId.Mainnet) || pools.length === 0) return []
        if (!contractAddress) return undefined

        const raws = await Promise.all(
            pools.map(async (value) => {
                const availability = await checkAvailability(value.pid, account, contractAddress, chainId, isMainnetOld)
                return { availability, ...value }
            }),
        )
        const swappedTokens: SwappedToken[] = raws
            .filter(
                (raw) =>
                    raw.availability.exchange_addrs.length !== 0 &&
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
    }, [JSON.stringify(pools), account, chainId, loading, contractAddress])
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
