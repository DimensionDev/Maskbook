import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { useServices, useMessages } from './useContext.js'

/**
 * Get all owned personas from DB
 */
export function usePersonasFromDB() {
    const messages = useMessages()
    const services = useServices()
    const asyncResult = useAsyncRetry(async () => {
        return services.queryOwnedPersonaInformation(true)
    }, [services])

    useEffect(() => messages.events.ownPersonaChanged.on(() => asyncResult.retry()), [messages, asyncResult.retry])

    return asyncResult
}
