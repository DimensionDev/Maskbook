import { useMemo } from 'react'
import { Sentry } from '@masknet/web3-providers'
import type { EventID, EventType, ExceptionID, ExceptionType } from '../types/index.js'
import { useTelemetryContext } from './context.js'

export function useTelemetry() {
    const options = useTelemetryContext()

    return useMemo(() => {
        return {
            captureEvent(eventType: EventType, eventID: EventID) {
                Sentry.captureEvent({
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
    }, [options])
}
