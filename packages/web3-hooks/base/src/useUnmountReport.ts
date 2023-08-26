import { useUnmount } from 'react-use'
import { type Unresolved, resolve } from '@masknet/shared-base'
import { type EventID, EventType } from '@masknet/web3-telemetry/types'
import { Telemetry } from '@masknet/web3-telemetry'

/**
 * Log an exit event
 */
export function useUnmountReport(eventID: Unresolved<EventID>) {
    useUnmount(() => {
        Telemetry.captureEvent(EventType.Exit, resolve(eventID))
    })
}
