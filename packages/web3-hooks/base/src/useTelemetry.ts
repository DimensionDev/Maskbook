import { useMemo } from 'react'
import { Sentry, Mixpanel } from '@masknet/web3-telemetry'
import type { EventID, EventType, ExceptionID, ExceptionType } from '@masknet/web3-telemetry/types'
import { useTelemetryContext } from './Telemetry/index.js'

export function useTelemetry() {
    const options = useTelemetryContext()

    return useMemo(() => {
        return {
            captureEvent(eventType: EventType, eventID: EventID) {
                Mixpanel.captureEvent({
                    ...options,
                    eventType,
                    eventID,
                })
            },
            captureException(exceptionType: ExceptionType, exceptionID: ExceptionID, error: Error) {
                Sentry.captureException({
                    ...options,
                    exceptionType,
                    exceptionID,
                    error,
                })
            },
        }
    }, [JSON.stringify(options)])
}
