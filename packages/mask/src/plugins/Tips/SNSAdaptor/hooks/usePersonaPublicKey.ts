import { useAsync } from 'react-use'
import type { ProfileIdentifier } from '@masknet/shared-base'
import Services from '../../../../extension/service.js'

export function usePersonaPublicKey(receiver: ProfileIdentifier | null | undefined) {
    return useAsync(async () => {
        if (!receiver) return
        const persona = await Services.Identity.queryPersonaByProfile(receiver)
        return persona?.identifier
    }, [receiver])
}
