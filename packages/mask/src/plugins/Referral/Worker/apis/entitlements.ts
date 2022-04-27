import { orderBy } from 'lodash-unified'
import { Interface } from '@ethersproject/abi'
import { keccak256 } from 'web3-utils'

import { expandEvmAddressToBytes32 } from '../../helpers'
import { type EntitlementLog, RpcMethod } from '../../types'
import { getOracle, rpcCall } from './oracle'

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
    const parsed = itemsSorted.map((row) => {
        return eventsPeriodEntitlement.parseLog({
            data: row.data,
            topics: row.topics,
        })
    })
    return parsed
}

export async function getAccountEntitlements(account: string): Promise<EntitlementLog[]> {
    const host = await getOracle()
    const topics = [eventIdsPeriodEntitlement.PeriodEntitlement, '', expandEvmAddressToBytes32(account)]

    const { result } = await rpcCall(host, RpcMethod.oracle_getLogs, [{ topics, chainId: [ORACLE_CHAIN_ID.testnet] }])

    return parsePeriodEntitlementEvents(result)
}
