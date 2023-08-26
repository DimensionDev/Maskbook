import { useMount } from 'react-use'
import { type Unresolved, resolve } from '@masknet/shared-base'
import { type EventID, EventType } from '@masknet/web3-telemetry/types'
import { Telemetry } from '@masknet/web3-telemetry'

/**
 * Log an access event
 */
export function useMountReport(eventID: Unresolved<EventID>) {
    useMount(() => {
        Telemetry.captureEvent(EventType.Access, resolve(eventID))
    })
}
