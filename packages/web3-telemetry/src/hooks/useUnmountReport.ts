import { useUnmount } from 'react-use'
import { type Unresolved, resolve } from '@masknet/shared-base'
import { type EventID, EventType } from '../types/index.js'
import { useTelemetry } from './useTelemetry.js'

/**
 * Log an exit event
 */
export function useUnmountReport(eventID: Unresolved<EventID>) {
    const telemetry = useTelemetry()

    useUnmount(() => {
        telemetry.captureEvent(EventType.Exit, resolve(eventID))
    })
}
