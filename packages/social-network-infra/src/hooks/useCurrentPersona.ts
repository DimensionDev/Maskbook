import { useAsyncRetry } from 'react-use'
import { useServices } from './useContext.js'
import { useCurrentIdentity } from './useCurrentIdentity.js'

export function useCurrentPersona() {
    const currentIdentity = useCurrentIdentity()
    const services = useServices()

    return useAsyncRetry(async () => {
        if (!currentIdentity?.linkedPersona) return
        return services.queryPersona(currentIdentity.linkedPersona)
    }, [currentIdentity?.linkedPersona, services])
}
