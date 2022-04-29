import { orderBy } from 'lodash-unified'
import type { ERC20TokenDetailed, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { keccak256, asciiToHex, padRight } from 'web3-utils'
import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { TokenList } from '@masknet/web3-providers'
import { formatUnits } from '@ethersproject/units'
import ReferralFarmsV1ABI from '@masknet/web3-contracts/abis/ReferralFarmsV1.json'

import type {
    EvmAddress,
    ChainAddress,
    FarmExistsEvent,
    FarmDepositChangeEvent,
    FarmMetaDataLog,
    ChainId,
    FarmDetailed,
    FarmHash,
    RewardsHarvested,
    RewardData,
} from '../../types'
import {
    expandBytes24ToBytes32,
    expandEvmAddressToBytes32,
    parseChainAddress,
    toChainAddressEthers,
} from '../../helpers'
import { queryIndexersWithNearestQuorum } from './indexers'
import { REFERRAL_FARMS_V1_ADDR } from '../../constants'

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
function parseFarmDepositChangeEvents(unparsed: any) {
    const parsed = parseEvents(unparsed)

    const farms: Array<FarmDepositChangeEvent> = parsed.map((e) => {
        const { delta, farmHash } = e.args
        return { farmHash, delta }
    })

    return farms
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
function parseBasicFarmEvents(unparsed: any, tokens: ERC20TokenDetailed[]) {
    const tokensMap = new Map(tokens.map((token) => [token.address.toLowerCase(), token]))
    const parsed = parseEvents(unparsed)

    // select unique farms
    const allEventsFarmExists = parsed.filter((e) => e.topic === eventIds.FarmExists)
    const uniqueFarms: { args: FarmExistsEvent }[] = allEventsFarmExists.filter(
        (val, index) => index === allEventsFarmExists.findIndex((event) => event.args.farmHash === val.args.farmHash),
    )
    const farmsMap = new Map(
        uniqueFarms.map((farm) => [
            farm.args.farmHash,
            {
                ...farm.args,
                totalFarmRewards: 0,
                dailyFarmReward: 0,
                referredToken: tokensMap.get(parseChainAddress(farm.args.referredTokenDefn).address),
                rewardToken: tokensMap.get(parseChainAddress(farm.args.rewardTokenDefn).address),
            },
        ]),
    )
    const farmsDetailed = parseFarmDepositAndFarmMetastateEvents(parsed, farmsMap)

    const res = uniqueFarms.map((event) => {
        const { farmHash, referredTokenDefn, rewardTokenDefn, sponsor } = event.args
        const farmDetailed = farmsDetailed.get(farmHash)
        return {
            farmHash,
            referredTokenDefn,
            rewardTokenDefn,
            sponsor,
            totalFarmRewards: farmDetailed?.totalFarmRewards || 0,
            dailyFarmReward: farmDetailed?.dailyFarmReward || 0,
            rewardToken: farmDetailed?.rewardToken,
            referredToken: farmDetailed?.referredToken,
        }
    })

    return res
}
function parseRewardsHarvestedEvents(unparsed: any) {
    const parsed = parseEvents(unparsed)

    const rewards: RewardsHarvested[] = parsed.map((e) => {
        const { farmHash, caller, rewardTokenDefn, leafHash, value } = e.args
        return { farmHash, caller, rewardTokenDefn, leafHash, value: Number.parseFloat(formatUnits(value)) }
    })

    return rewards
}

interface TokenFilter {
    rewardTokens?: ChainAddress[]
    referredTokens?: ChainAddress[]
}
export async function getMyFarms(
    account: string,
    chainId: ChainId,
    filter?: TokenFilter,
): Promise<Array<FarmExistsEvent>> {
    const farmsAddr = REFERRAL_FARMS_V1_ADDR

    // Allow filtering your own tokens
    let topic3, topic4
    if (filter?.rewardTokens) {
        topic3 = filter.rewardTokens.map((t) => expandBytes24ToBytes32(t))
    }
    if (filter?.referredTokens) {
        topic4 = filter.referredTokens.map((t) => expandBytes24ToBytes32(t))
    }

    // Query indexers
    const res = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topic1: [eventIds.FarmExists],
        topic2: [expandEvmAddressToBytes32(account)],
        topic3,
        topic4,
        chainId: [chainId],
    })

    return parseFarmExistsEvents(res.items)
}

export async function getFarmsDeposits(chainId: ChainId): Promise<Array<FarmDepositChangeEvent>> {
    const farmsAddr = REFERRAL_FARMS_V1_ADDR

    const res = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topics: [eventIds.FarmDepositChange],
        chainId: [chainId],
    })

    return parseFarmDepositChangeEvents(res.items)
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

export async function getAllFarms(chainId: ChainId, tokenLists?: string[]): Promise<Array<FarmDetailed>> {
    const farmsAddr = REFERRAL_FARMS_V1_ADDR

    // Query indexers
    const farmEvents = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topic1: [eventIds.FarmExists, eventIds.FarmDepositChange, eventIds.FarmMetastate],
        chainId: [chainId],
    })
    // Query tokens
    const tokens = tokenLists?.length ? await TokenList.fetchERC20TokensFromTokenLists(tokenLists, chainId) : []

    return parseBasicFarmEvents(farmEvents.items, tokens)
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
export async function getFarmsForReferredToken(
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

    // Query tokens
    const tokens = tokenLists?.length ? await TokenList.fetchERC20TokensFromTokenLists(tokenLists, chainId) : []
    const tokensMap = new Map(tokens.map((token) => [token.address.toLowerCase(), token]))

    const farmsMap = new Map(
        farms.map((farm) => [
            farm.farmHash,
            {
                ...farm,
                totalFarmRewards: 0,
                dailyFarmReward: 0,
                referredToken: tokensMap.get(parseChainAddress(farm.referredTokenDefn).address),
                rewardToken: tokensMap.get(parseChainAddress(farm.rewardTokenDefn).address),
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
): Promise<Map<string, RewardData>> {
    const farmsData = await getFarmsForReferredToken(chainId, referredToken, tokenLists)

    const res = new Map<
        ChainAddress,
        { rewardToken?: FungibleTokenDetailed; dailyReward: number; totalReward: number; apr: number }
    >()
    for (const [, value] of farmsData.entries()) {
        const prevState = res.get(value.rewardTokenDefn)

        res.set(value.rewardTokenDefn, {
            rewardToken: value.rewardToken,
            totalReward: (prevState?.totalReward || 0) + value.totalFarmRewards,
            dailyReward: (prevState?.dailyReward || 0) + value.dailyFarmReward,
            apr: 0,
        })
    }

    return res
}
