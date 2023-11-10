import type { EventLog, Log } from 'web3-core'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { AbiItem } from 'web3-utils'
import { abiCoder } from './abiCoder.js'

export function decodeEvents(abis: AbiItem[], logs: Log[]) {
    // the topic0 for identifying which abi to be used for decoding the event
    const listOfTopic0 = abis.map((abi) =>
        web3_utils.keccak256(`${abi.name}(${abi.inputs?.map((x) => x.type).join(',')})`),
    )

    // decode events
    const events = logs.map((log) => {
        const idx = listOfTopic0.indexOf(log.topics[0])
        if (idx === -1) return
        const abi = abis[idx]
        const inputs = abi?.inputs ?? []

        return {
            // more: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html?highlight=decodeLog#decodelog
            returnValues: abiCoder.decodeLog(inputs, log.data, abi.anonymous ? log.topics : log.topics.slice(1)),
            raw: {
                data: log.data,
                topics: log.topics,
            },
            event: abi.name,
            signature: listOfTopic0[idx],
            ...log,
        } as EventLog
    })
    return events.reduce<{
        [eventName: string]: EventLog | undefined
    }>((accumulate, event) => {
        if (event) accumulate[event.event] = event
        return accumulate
    }, {})
}
