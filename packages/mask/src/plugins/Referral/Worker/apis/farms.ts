import {
    ChainAddress,
    FarmExistsEvent,
    ReferralFarmsV1,
    FarmDepositChange,
    ChainId,
    Farm,
    FarmDepositAndMetastate,
    FarmHash,
    RewardsHarvestedEvent,
} from '../../types'
import type Web3 from 'web3'
import type { ERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { keccak256, fromWei, asciiToHex, padRight } from 'web3-utils'
import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { orderBy } from 'lodash-unified'
import { TokenList } from '@masknet/web3-providers'
import { formatUnits } from '@ethersproject/units'

import { expandBytes24ToBytes32, expandEvmAddressToBytes32, parseChainAddress } from '../../helpers'
import { getDaoAddress } from './discovery'
import { queryIndexersWithNearestQuorum } from './indexers'
import { REFERRAL_FARMS_V1_ABI } from './abis'

import BigNumber from 'bignumber.js'

const REFERRAL_FARMS_V1_IFACE = new Interface(REFERRAL_FARMS_V1_ABI)

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

    const farms: Array<FarmDepositChange> = parsed.map((e) => {
        const { delta, farmHash } = e.args
        return { farmHash, delta }
    })

    return farms
}
function parseFarmDepositAndMetaStateChangeEvents(unparsed: any) {
    const parsed = parseEvents(unparsed)

    const farms: Array<FarmDepositAndMetastate> = []
    const farmMap = new Map<string, { totalFarmRewards?: number; dailyFarmReward?: number }>()
    parsed.forEach((e) => {
        const { farmHash } = e.args
        const prevFarmState = farmMap.get(farmHash)

        if (e.topic === eventIds.FarmDepositChange) {
            const { delta: totalFarmRewards } = e.args
            farmMap.set(farmHash, { ...prevFarmState, totalFarmRewards })
        }
        if (e.topic === eventIds.FarmMetastate) {
            const { key, value } = e.args

            const periodRewardKey = padRight(asciiToHex('periodReward'), 64)
            if (key === periodRewardKey) {
                const periodReward = defaultAbiCoder.decode(['uint128', 'int128'], value)[0]

                farmMap.set(farmHash, {
                    ...prevFarmState,
                    dailyFarmReward: Number(fromWei(periodReward.toString())),
                })
            }
        }
    })
    farmMap.forEach((value: { totalFarmRewards?: number; dailyFarmReward?: number }, key: string) => {
        farms.push({
            farmHash: key,
            delta: new BigNumber(value.totalFarmRewards ?? 0),
            dailyFarmReward: new BigNumber(value.dailyFarmReward ?? 0),
        })
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
export async function getMyFarms(
    web3: Web3,
    account: string,
    chainId: ChainId,
    filter?: TokenFilter,
): Promise<Array<FarmExistsEvent>> {
    const farmsAddr = await getDaoAddress(web3, ReferralFarmsV1, chainId)

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

export async function getFarmsDeposits(web3: Web3, chainId: ChainId): Promise<Array<FarmDepositChange>> {
    const farmsAddr = await getDaoAddress(web3, ReferralFarmsV1, chainId)

    const res = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topics: [eventIds.FarmDepositChange],
        chainId: [chainId],
    })

    return parseFarmDepositChangeEvents(res.items)
}

type FarmsMetaStateMap = Map<string, { dailyFarmReward: string }>
export async function getFarmsMetaState(
    web3: Web3,
    chainId: ChainId,
    farmHashes?: FarmHash[],
): Promise<FarmsMetaStateMap | undefined> {
    const farmsAddr = await getDaoAddress(web3, ReferralFarmsV1, chainId)

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
export async function getFarmsDepositAndMetaState(
    web3: Web3,
    chainId: ChainId,
): Promise<Array<FarmDepositAndMetastate>> {
    const farmsAddr = await getDaoAddress(web3, ReferralFarmsV1, chainId)

    const res = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topics: [eventIds.FarmDepositChange, eventIds.FarmMetastate],
        chainId: [chainId],
    })

    return parseFarmDepositAndMetaStateChangeEvents(res.items)
}
function parseBasicFarmEvents(unparsed: any, tokens: ERC20TokenDetailed[]) {
    const allTokensMap = new Map(tokens.map((token) => [token.address.toLowerCase(), token]))
    const parsed = parseEvents(unparsed)
    const farms: Array<Farm> = []

    // select unique farms
    const allEventsFarmExists = parsed.filter((e) => e.topic === eventIds.FarmExists)
    const uniqueFarms = allEventsFarmExists.filter(
        (val, index) => index === allEventsFarmExists.findIndex((event) => event.args.farmHash === val.args.farmHash),
    )
    const farmExistsEventsMap = new Map(uniqueFarms.map((e) => [e.args.farmHash, e.args]))

    // group all deposit and dailyRewardRate for farmHash
    const farmMap = new Map<string, { totalFarmRewards?: number; dailyFarmReward?: number }>()
    parsed.forEach((e) => {
        const { farmHash } = e.args
        const prevFarmState = farmMap.get(farmHash)

        const farmData = farmExistsEventsMap.get(farmHash)
        const rewardTokenAddr = parseChainAddress(farmData.rewardTokenDefn).address
        const rewardTokenDec = allTokensMap.get(rewardTokenAddr)?.decimals ?? 18

        if (e.topic === eventIds.FarmDepositChange) {
            const prevTotalFarmRewards = prevFarmState?.totalFarmRewards || 0

            const totalFarmRewards = prevTotalFarmRewards + Number(formatUnits(e.args.delta.toString(), rewardTokenDec))
            farmMap.set(farmHash, { ...prevFarmState, totalFarmRewards })
        }
        if (e.topic === eventIds.FarmMetastate) {
            const { key, value } = e.args

            const periodRewardKey = padRight(asciiToHex('periodReward'), 64)
            if (key === periodRewardKey) {
                const periodReward = defaultAbiCoder.decode(['uint128', 'int128'], value)[0]

                farmMap.set(farmHash, {
                    ...prevFarmState,
                    dailyFarmReward: Number(formatUnits(periodReward, rewardTokenDec)),
                })
            }
        }
    })

    uniqueFarms.forEach((event) => {
        const { farmHash, referredTokenDefn, rewardTokenDefn, sponsor } = event.args
        const farm: Farm = {
            farmHash,
            referredTokenDefn,
            rewardTokenDefn,
            sponsor,
            totalFarmRewards: farmMap.get(farmHash)?.totalFarmRewards || 0,
            dailyFarmReward: farmMap.get(farmHash)?.dailyFarmReward || 0,
        }

        farms.push(farm)
    })

    return farms
}

export async function getAllFarms(web3: Web3, chainId: ChainId, tokenLists?: string[]): Promise<Array<Farm>> {
    const farmsAddr = await getDaoAddress(web3, ReferralFarmsV1, chainId)

    // Query indexers
    const farmEvents = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topic1: [eventIds.FarmExists, eventIds.FarmTokenChange, eventIds.FarmDepositChange, eventIds.FarmMetastate],
        chainId: [chainId],
    })
    // Query tokens
    const tokens = tokenLists?.length ? await TokenList.fetchERC20TokensFromTokenLists(tokenLists, chainId) : []

    return parseBasicFarmEvents(farmEvents.items, tokens)
}

interface TokenFilter {
    rewardTokens?: ChainAddress[]
    referredTokens?: ChainAddress[]
}

export async function getFarmsForReferredToken(
    web3: Web3,
    chainAddress: ChainAddress,
    chainId: ChainId,
): Promise<Array<FarmExistsEvent>> {
    const farmsAddr = await getDaoAddress(web3, ReferralFarmsV1, chainId)

    const res = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topic1: [eventIds.FarmExists],
        topic4: [expandBytes24ToBytes32(chainAddress)],
        chainId: [chainId],
    })

    return parseFarmExistsEvents(res.items)
}

export async function getFarmsForRewardToken(
    web3: Web3,
    chainAddress: ChainAddress,
    chainId: ChainId,
): Promise<Array<FarmExistsEvent>> {
    const farmsAddr = await getDaoAddress(web3, ReferralFarmsV1, chainId)

    const res = await queryIndexersWithNearestQuorum({
        addresses: [farmsAddr],
        topic1: [eventIds.FarmExists],
        topic3: [expandBytes24ToBytes32(chainAddress)],
        chainId: [chainId],
    })

    return parseFarmExistsEvents(res.items)
}

function parseRewardsHarvestedEvents(unparsed: any) {
    const parsed = parseEvents(unparsed)

    const rewards: Array<RewardsHarvestedEvent> = parsed.map((e) => {
        const { farmHash, caller, rewardTokenDefn, leafHash, value } = e.args
        return { farmHash, caller, rewardTokenDefn, leafHash, value: Number(fromWei(value.toString())) }
    })

    return rewards
}

export async function getMyRewardsHarvested(
    web3: Web3,
    account: string,
    chainId: ChainId,
    filter?: { rewardTokens?: ChainAddress[] },
): Promise<Array<RewardsHarvestedEvent>> {
    const farmsAddr = await getDaoAddress(web3, ReferralFarmsV1, chainId)

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
