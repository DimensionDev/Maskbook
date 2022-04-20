import { orderBy } from 'lodash-unified'
import { Interface } from '@ethersproject/abi'
import { keccak256 } from 'web3-utils'

import { expandEvmAddressToBytes32 } from '../../helpers'
import { queryIndexersWithNearestQuorum } from './indexers'
import type { EntitlementLog } from '../../types'

enum ORACLE_CHAIN_ID {
    testnet = 4470,
    mainnet = 47,
}

const PeriodEntitlement = 'PeriodEntitlement'
const eventsPeriodEntitlement = new Interface([
    `event ${PeriodEntitlement}(bytes32 indexed farmHash, address indexed entitlee, uint128 period, uint64 nonce, uint128 rewardValue, bytes32[] proof)`,
])
const eventIdsPeriodEntitlement: any = {}
Object.entries(eventsPeriodEntitlement.events).forEach(([k, v]) => (eventIdsPeriodEntitlement[v.name] = keccak256(k)))

function parsePeriodEntitlementEvents(items: Array<any>): Array<any> {
    const itemsSorted = orderBy(items, ['chainId', 'blockNumber', 'logIndex'], ['asc', 'asc', 'asc'])
    // TODO: clean console.log
    console.log({ entitlementEvents: itemsSorted })
    const parsed = itemsSorted.map((row) => {
        return eventsPeriodEntitlement.parseLog({
            data: row.data,
            topics: JSON.parse(row.topics),
        })
    })
    return parsed
}

export async function getAccountEntitlements(account: string): Promise<EntitlementLog[]> {
    // Query indexers
    const res = await queryIndexersWithNearestQuorum({
        topic1: [eventIdsPeriodEntitlement.PeriodEntitlement],
        topic3: [expandEvmAddressToBytes32(account)],
        chainId: [ORACLE_CHAIN_ID.testnet],
    })

    return parsePeriodEntitlementEvents(res.items)
}
