import { useAsync } from 'react-use'
import type { PersonaIdentifier } from '@masknet/shared'
import { Services } from '../../../API'

export function useExportPrivateKey(identifier: PersonaIdentifier) {
    return useAsync(async () => {
        return Services.Identity.exportPersonaPrivateKey(identifier)
    }, [identifier])
}
