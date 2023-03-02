import { useMount } from 'react-use'
import { TelemetryAPI } from '@masknet/web3-providers/types'
import { useTelemetry } from './useTelemetry.js'

/**
 * Log an access event
 */
export function useMountReport(eventID: TelemetryAPI.EventID) {
    const telemetry = useTelemetry()

    useMount(() => {
        telemetry.captureEvent(TelemetryAPI.EventType.Access, eventID)
    })
}
