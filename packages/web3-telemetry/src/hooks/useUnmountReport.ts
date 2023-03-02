import { useUnmount } from 'react-use'
import { TelemetryAPI } from '@masknet/web3-providers/types'
import { useTelemetry } from './useTelemetry.js'

/**
 * Log an exit event
 */
export function useUnmountReport(eventID: TelemetryAPI.EventID) {
    const telemetry = useTelemetry()

    useUnmount(() => {
        telemetry.captureEvent(TelemetryAPI.EventType.Exit, eventID)
    })
}
