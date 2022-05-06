import { orderBy } from 'lodash-unified'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { keccak256, asciiToHex, padRight } from 'web3-utils'
import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { formatUnits } from '@ethersproject/units'
import ReferralFarmsV1ABI from '@masknet/web3-contracts/abis/ReferralFarmsV1.json'

import type {
    EvmAddress,
    ChainAddress,
    FarmExistsEvent,
    FarmMetaDataLog,
    ChainId,
    FarmDetailed,
    FarmHash,
    RewardsHarvested,
    RewardData,
    FarmDepositChangeEvent,
} from '../../types'
import {
    expandBytes24ToBytes32,
    expandEvmAddressToBytes32,
    parseChainAddress,
    toChainAddressEthers,
} from '../../helpers'
import { queryIndexersWithNearestQuorum } from './indexers'
import { REFERRAL_FARMS_V1_ADDR } from '../../constants'
import { fetchERC20TokensFromTokenListsMap } from './tokenLists'

const REFERRAL_FARMS_V1_IFACE = new Interface(ReferralFarmsV1ABI)

// Index the events name => id
const eventIds: any = {}
Object.entries(REFERRAL_FARMS_V1_IFACE.events).forEach(([k, v]) => (eventIds[v.name] = keccak256(k)))

function parseEvents(items: Array<any>): Array<any> {
    const itemsSorted = orderBy(items, ['chainId', 'blockNumber', 'logIndex'], ['asc', 'asc', 'asc'])
    const parsed = itemsSorted.map((row) => {
        return REFERRAL_FARMS_V1_IFACE.parseLog({
            data: row.data,
            topics: JSON.parse(row.topics),
        })
    })
    return parsed
}
function parseFarmExistsEvents(unparsed: any) {
    const parsed = parseEvents(unparsed)

    const farms: Array<FarmExistsEvent> = parsed.map((e) => {
        const { farmHash, referredTokenDefn, rewardTokenDefn, sponsor } = e.args
        return { farmHash, referredTokenDefn, rewardTokenDefn, sponsor }
    })

    // select unique farms(uniq farmHash)
    const uniqueFarms = farms.filter(
        (val, index) => index === farms.findIndex((elem) => elem.farmHash === val.farmHash),
    )

    return uniqueFarms
}
function parseFarmMetaStateChangeEvents(unparsed: any) {
    const parsed = parseEvents(unparsed)

    const farmMetastateMap = new Map<string, { dailyFarmReward: string }>()

    parsed.forEach((e) => {
        const { farmHash, key, value } = e.args

        const periodRewardKey = padRight(asciiToHex('periodReward'), 64)
        let dailyFarmReward = '0'

        if (key === periodRewardKey) {
            const periodReward = defaultAbiCoder.decode(['uint128', 'int128'], value)[0]
            dailyFarmReward = periodReward.toString()
        }

        // set the last value(newest) of dailyFarmReward
        farmMetastateMap.set(farmHash, { dailyFarmReward })
    })

    return farmMetastateMap
}
function parseRewardsHarvestedEvents(unparsed: any) {
    const parsed = parseEvents(unparsed)

    const rewards: RewardsHarvested[] = parsed.map((e) => {
        const { farmHash, caller, rewardTokenDefn, leafHash, value } = e.args
        return { farmHash, caller, rewardTokenDefn, leafHash, value: Number.parseFloat(formatUnits(value)) }
    })

    return rewards
}
function parseFarmDepositAndFarmMetastateEvents(
    farmMetaDataEvents: FarmMetaDataLog[],
    farmsMap: Map<string, FarmDetailed>,
) {
    const farmsData = farmsMap

    farmMetaDataEvents.forEach((e) => {
        const { farmHash } = e.args
        const farmState = farmsData.get(farmHash)

        if (!farmState) return

        const rewardTokenDec = farmState.rewardToken?.decimals ?? 18

        if (e.topic === eventIds.FarmDepositChange) {
            const prevTotalFarmRewards = farmState.totalFarmRewards || 0

            const totalFarmRewards = prevTotalFarmRewards + Number.parseFloat(formatUnits(e.args.delta, rewardTokenDec))
            farmsData.set(farmHash, { ...farmState, totalFarmRewards })
        }
        if (e.topic === eventIds.FarmMetastate) {
            const { key, value } = e.args

            const periodRewardKey = padRight(asciiToHex('periodReward'), 64)
            if (key === periodRewardKey) {
                const periodReward = defaultAbiCoder.decode(['uint128', 'int128'], value)[0]

                farmsData.set(farmHash, {
                    ...farmState,
                    dailyFarmReward: Number.parseFloat(formatUnits(periodReward, rewardTokenDec)),
                })
            }
        }
    })

    return farmsData
}

export async function getFarmExistEvents(chainId: ChainId): Promise<FarmExistsEvent[]> {
    const farmExistsEvents = await queryIndexersWithNearestQuorum({
        addresses: [REFERRAL_FARMS_V1_ADDR],
        topic1: [eventIds.FarmExists],
        chainId: [chainId],
    })
    const farms = parseFarmExistsEvents(farmExistsEvents.items)

    return farms
}

interface TokenFilter {
    rewardTokens?: ChainAddress[]
    referredTokens?: ChainAddress[]
}
export async function getAccountFarms(
    account: string,
    chainId: ChainId,
    tokenLists?: string[],
    filter?: TokenFilter,
): Promise<FarmDetailed[]> {
    // Allow filtering your own tokens
    let topic3, topic4
    if (filter?.rewardTokens) {
        topic3 = filter.rewardTokens.map((t) => expandBytes24ToBytes32(t))
    }
    if (filter?.referredTokens) {
        topic4 = filter.referredTokens.map((t) => expandBytes24ToBytes32(t))
    }

    // Query account farms
    const farmExistsEvents = await queryIndexersWithNearestQuorum({
        addresses: [REFERRAL_FARMS_V1_ADDR],
        topic1: [eventIds.FarmExists],
        topic2: [expandEvmAddressToBytes32(account)],
        topic3,
        topic4,
        chainId: [chainId],
    })

    if (!farmExistsEvents?.items.length) return []

    const farms = parseFarmExistsEvents(farmExistsEvents.items)

    const farmsDepositEvents = await queryIndexersWithNearestQuorum({
        addresses: [REFERRAL_FARMS_V1_ADDR],
        topic1: [eventIds.FarmDepositChange],
        topic2: farms.map((farm) => farm.farmHash),
        chainId: [chainId],
    })
    const farmsDeposits = parseEvents(farmsDepositEvents?.items)

    const tokensMap = tokenLists && (await fetchERC20TokensFromTokenListsMap(tokenLists, chainId))

    const farmsMap = new Map(
        farms.map((farm) => [
            farm.farmHash,
            {
                ...farm,
                totalFarmRewards: 0,
                dailyFarmReward: 0,
                referredToken: tokensMap?.get(parseChainAddress(farm.referredTokenDefn).address),
                rewardToken: tokensMap?.get(parseChainAddress(farm.rewardTokenDefn).address),
            },
        ]),
    )

    farmsDeposits.forEach((deposit: { args: FarmDepositChangeEvent }) => {
        const { farmHash, delta } = deposit.args
        const farmState = farmsMap.get(farmHash)

        if (!farmState) return

        const rewardTokenDec = farmState.rewardToken?.decimals ?? 18
        const totalFarmRewards =
            (farmState.totalFarmRewards || 0) + Number.parseFloat(formatUnits(delta, rewardTokenDec))
        farmsMap.set(farmHash, { ...farmState, totalFarmRewards })
    })

    return [...farmsMap.values()]
}

type FarmsMetaStateMap = Map<string, { dailyFarmReward: string }>
export async function getFarmsMetaState(
    chainId: ChainId,
    farmHashes?: FarmHash[],
): Promise<FarmsMetaStateMap | undefined> {
    const farmsAddr = REFERRAL_FARMS_V1_ADDR

    // Allow filter by farmHash
    let topic2
    if (farmHashes?.length) {
        topic2 = farmHashes.map((farmHash) => farmHash)
    }

    const res = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topic1: [eventIds.FarmMetastate],
        topic2,
        chainId: [chainId],
    })

    return parseFarmMetaStateChangeEvents(res.items)
}

export async function getMyRewardsHarvested(
    account: string,
    chainId: ChainId,
    filter?: { rewardTokens?: ChainAddress[] },
): Promise<RewardsHarvested[]> {
    const farmsAddr = REFERRAL_FARMS_V1_ADDR

    // Allow filtering by reward tokens
    let topic3
    if (filter?.rewardTokens) {
        topic3 = filter.rewardTokens.map((t) => expandBytes24ToBytes32(t))
    }

    // Query indexers
    const res = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topic1: [eventIds.RewardsHarvested],
        topic2: [expandEvmAddressToBytes32(account)],
        topic3,
        chainId: [chainId],
    })

    return parseRewardsHarvestedEvents(res.items)
}

async function getFarmsForReferredToken(
    chainId: ChainId,
    referredToken: EvmAddress,
    tokenLists: string[],
): Promise<Map<string, FarmDetailed>> {
    // query farms basic data
    const farmExistsEvents = await queryIndexersWithNearestQuorum({
        addresses: [REFERRAL_FARMS_V1_ADDR],
        topic1: [eventIds.FarmExists],
        topic4: [expandBytes24ToBytes32(toChainAddressEthers(chainId, referredToken))],
        chainId: [chainId],
    })
    const farms = parseFarmExistsEvents(farmExistsEvents.items)

    const tokensMap = tokenLists?.length ? await fetchERC20TokensFromTokenListsMap(tokenLists, chainId) : undefined

    const farmsMap = new Map(
        farms.map((farm) => [
            farm.farmHash,
            {
                ...farm,
                totalFarmRewards: 0,
                dailyFarmReward: 0,
                referredToken: tokensMap?.get(parseChainAddress(farm.referredTokenDefn).address),
                rewardToken: tokensMap?.get(parseChainAddress(farm.rewardTokenDefn).address),
            },
        ]),
    )

    // query farms meta data
    const farmsDataEvents = await queryIndexersWithNearestQuorum({
        addresses: [REFERRAL_FARMS_V1_ADDR],
        topic1: [eventIds.FarmMetastate, eventIds.FarmDepositChange],
        topic2: farms.map(({ farmHash }) => farmHash),
        chainId: [chainId],
    })
    const farmsDataParsed = parseEvents(farmsDataEvents.items)

    const farmsData = parseFarmDepositAndFarmMetastateEvents(farmsDataParsed, farmsMap)

    return farmsData
}
export async function getRewardsForReferredToken(
    chainId: ChainId,
    referredToken: EvmAddress,
    tokenLists: string[],
): Promise<RewardData[]> {
    const farmsData = await getFarmsForReferredToken(chainId, referredToken, tokenLists)

    const rewards = new Map<
        ChainAddress,
        { rewardToken?: FungibleTokenDetailed; dailyReward: number; totalReward: number; apr: number }
    >()
    for (const [, value] of farmsData.entries()) {
        const prevState = rewards.get(value.rewardTokenDefn)

        rewards.set(value.rewardTokenDefn, {
            rewardToken: value.rewardToken,
            totalReward: (prevState?.totalReward || 0) + value.totalFarmRewards,
            dailyReward: (prevState?.dailyReward || 0) + value.dailyFarmReward,
            apr: 0,
        })
    }

    return [...rewards.values()]
}

export async function getReferredTokensDefn(chainId: ChainId): Promise<ChainAddress[]> {
    const farmExistEvents = await getFarmExistEvents(chainId)
    const referredTokensDefn = farmExistEvents.map((farm) => farm.referredTokenDefn)

    return [...new Set(referredTokensDefn)]
}
