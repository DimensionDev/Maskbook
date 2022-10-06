import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import { useAsyncRetry } from 'react-use'
import { useServices } from './useContext.js'

export function usePersonaFromDB(identityResolved: IdentityResolved) {
    const services = useServices()
    return useAsyncRetry(async () => {
        if (!identityResolved.identifier) return
        return services.queryPersonaByProfile(identityResolved.identifier)
    }, [services, identityResolved.identifier?.toText()])
}
