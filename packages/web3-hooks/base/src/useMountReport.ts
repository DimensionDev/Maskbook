import { useMount } from 'react-use'
import { type EventID, EventType } from '@masknet/web3-telemetry/types'
import { Telemetry } from '@masknet/web3-telemetry'

/**
 * Log an access event
 */
export function useMountReport(eventID: EventID) {
    useMount(() => {
        Telemetry.captureEvent(EventType.Access, eventID)
    })
}
