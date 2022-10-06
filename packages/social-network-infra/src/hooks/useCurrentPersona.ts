import { useAsyncRetry } from 'react-use'
import { useServices } from './useContext.js'
import { useCurrentIdentity } from './useCurrentIdentity.js'

export function useCurrentPersona() {
    const identity = useCurrentIdentity()
    const services = useServices()

    return useAsyncRetry(async () => {
        if (!identity?.linkedPersona) return
        return services.queryPersona(identity.linkedPersona)
    }, [identity?.linkedPersona, services])
}
