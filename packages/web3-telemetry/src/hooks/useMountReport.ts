import { useMount } from 'react-use'
import { type Unresolved, resolve } from '@masknet/shared-base'
import { useTelemetry } from './useTelemetry.js'
import { type EventID, EventType } from '../types/index.js'

/**
 * Log an access event
 */
export function useMountReport(eventID: Unresolved<EventID>) {
    const telemetry = useTelemetry()

    useMount(() => {
        telemetry.captureEvent(EventType.Access, resolve(eventID))
    })
}
