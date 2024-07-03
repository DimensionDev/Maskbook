import type { AbiEventFragment, EventLog, Log } from 'web3-types'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { abiCoder } from './abiCoder.js'

// function toHexString(params:type) {

// }
export function decodeEvents(abis: AbiEventFragment[], logs: Log[]) {
    // the topic0 for identifying which abi to be used for decoding the event
    const listOfTopic0 = abis.map((abi) =>
        web3_utils.keccak256(`${abi.name}(${abi.inputs?.map((x) => x.type).join(',')})`),
    )

    // decode events
    const events = logs.map((log) => {
        if (!log.topics) return
        const idx = listOfTopic0.indexOf(web3_utils.toHex(log.topics[0]))
        if (idx === -1) return
        const abi = abis[idx]
        const inputs = abi?.inputs ?? []

        return {
            // more: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html?highlight=decodeLog#decodelog
            // https://github.com/web3/web3.js/issues/7136
            returnValues: abiCoder.decodeLog(
                [...inputs],
                web3_utils.toHex(log.data || '0x0'),
                (abi.anonymous ? log.topics : log.topics.slice(1)).map((x) => web3_utils.toHex(x)),
            ),
            raw: {
                data: log.data,
                topics: log.topics,
            },
            event: abi.name,
            signature: listOfTopic0[idx],
            ...log,
        } as EventLog
    })
    const eventObject: { [eventName: string]: EventLog | undefined } = {}
    for (const event of events) {
        if (event) eventObject[event.event] = event
    }
    return eventObject
}
