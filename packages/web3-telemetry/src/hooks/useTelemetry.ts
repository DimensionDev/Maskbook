import { useMemo } from 'react'
import { Sentry } from '@masknet/web3-providers'
import type { TelemetryAPI } from '@masknet/web3-providers/types'
import { useTelemetryContext } from './context.js'

export function useTelemetry() {
    const options = useTelemetryContext()

    return useMemo(() => {
        return {
            captureEvent(eventType: TelemetryAPI.EventType, eventID: TelemetryAPI.EventID) {
                Sentry.captureEvent({
                    ...options,
                    eventType,
                    eventID,
                })
            },
            captureException(
                exceptionType: TelemetryAPI.ExceptionType,
                exceptionID: TelemetryAPI.ExceptionID,
                error: Error,
            ) {
                Sentry.captureException({
                    ...options,
                    exceptionType,
                    exceptionID,
                    error,
                })
            },
        }
    }, [options])
}
