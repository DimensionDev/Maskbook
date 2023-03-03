import { useUnmount } from 'react-use'
import { TelemetryAPI } from '@masknet/web3-providers/types'
import { type Unresolved, resolve } from '@masknet/shared-base'
import { useTelemetry } from './useTelemetry.js'

/**
 * Log an exit event
 */
export function useUnmountReport(eventID: Unresolved<TelemetryAPI.EventID>) {
    const telemetry = useTelemetry()

    useUnmount(() => {
        telemetry.captureEvent(TelemetryAPI.EventType.Exit, resolve(eventID))
    })
}
