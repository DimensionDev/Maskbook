import { orderBy } from 'lodash-unified'
import { Interface } from '@ethersproject/abi'
import { keccak256 } from 'web3-utils'

import { expandEvmAddressToBytes32 } from '../../helpers'
import { type Entitlement, RpcMethod } from '../../types'
import { getOracle, rpcCall } from './oracle'
import { supportedOracleChainId } from '../../constants'

const Entitlement = 'Entitlement'
const eventsEntitlement = new Interface([
    `event ${Entitlement}(bytes32 indexed farmHash, address indexed entitlee, uint128 confirmation, uint128 rewardValue, bytes32[] proof)`,
])
const eventIdsEntitlement: any = {}
Object.entries(eventsEntitlement.events).forEach(([k, v]) => (eventIdsEntitlement[v.name] = keccak256(k)))

function parseEntitlementEvents(items: Array<any>): Array<any> {
    const itemsSorted = orderBy(items, ['chainId', 'blockNumber', 'logIndex'], ['asc', 'asc', 'asc'])
    const parsed = itemsSorted.map((row) => {
        return eventsEntitlement.parseLog({
            data: row.data,
            topics: row.topics,
        }).args
    })
    return parsed
}

export async function getAccountEntitlements(account: string): Promise<Entitlement[] | undefined> {
    const host = await getOracle()
    const topics = [eventIdsEntitlement.Entitlement, '', expandEvmAddressToBytes32(account)]

    const res = await rpcCall(host, RpcMethod.oracle_getLogs, [{ topics, chainId: [supportedOracleChainId] }])

    return parseEntitlementEvents(res?.result)
}
