import { useMemo } from 'react'
import { Sentry } from '@masknet/web3-providers'
import type { LoggerAPI } from '@masknet/web3-providers/types'
import { useLogContext } from './useContext.js'

export function useLog() {
    const options = useLogContext()

    return useMemo(() => {
        return {
            captureEvent(eventID: LoggerAPI.EventID) {
                Sentry.captureEvent({
                    ...options,
                    eventID,
                })
            },
            captureException(exceptionID: LoggerAPI.ExceptionID, error: Error) {
                Sentry.captureException({
                    ...options,
                    exceptionID,
                    error,
                })
            },
        }
    }, [options])
}
