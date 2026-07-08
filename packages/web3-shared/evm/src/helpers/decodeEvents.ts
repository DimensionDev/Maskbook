import { decodeEventLog, type ContractEventName, type DecodeEventLogReturnType, type Hex, type Log } from 'viem'
import type { Abi, ExtractAbiEventNames } from 'abitype'

export type AbiEventToPrimitiveType<
    abi extends Abi,
    eventName extends ContractEventName<abi>,
> = DecodeEventLogReturnType<abi, eventName>['args']

export type MultipleAbiEventsToMappedObject<abi extends Abi> = {
    [eventName in ExtractAbiEventNames<abi> & ContractEventName<abi>]:
        | (Log & {
              event: eventName
              raw: {
                  data: Hex
                  topics: readonly Hex[]
              }
              returnValues: AbiEventToPrimitiveType<abi, eventName>
          })
        | undefined
}

export function decodeEvents<abi extends Abi>(allAbis: abi, logs: Log[]): MultipleAbiEventsToMappedObject<abi> {
    const events: {
        [eventName: string]:
            | (Log & {
                  event: string
                  raw: {
                      data: Hex
                      topics: readonly Hex[]
                  }
                  returnValues: unknown
              })
            | undefined
    } = {}
    // decode events
    for (const log of logs) {
        try {
            const { eventName, args } = decodeEventLog({
                abi: allAbis,
                topics: log.topics as [signature: `0x${string}`, ...args: Array<`0x${string}`>],
                data: log.data as `0x${string}`,
            })
            if (!eventName) continue
            events[eventName] = {
                returnValues: args,
                raw: {
                    data: log.data,
                    topics: log.topics,
                },
                event: eventName,
                ...log,
            }
        } catch {
            continue
        }
    }
    return events as any
}
