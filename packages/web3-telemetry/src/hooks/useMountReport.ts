import { useMount } from 'react-use'
import { type Unresolved, resolve } from '@masknet/shared-base'
import { TelemetryAPI } from '@masknet/web3-providers/types'
import { useTelemetry } from './useTelemetry.js'

/**
 * Log an access event
 */
export function useMountReport(eventID: Unresolved<TelemetryAPI.EventID>) {
    const telemetry = useTelemetry()

    useMount(() => {
        telemetry.captureEvent(TelemetryAPI.EventType.Access, resolve(eventID))
    })
}
