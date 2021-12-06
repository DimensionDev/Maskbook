import { useAsync } from 'react-use'
import type { PersonaIdentifier } from '@masknet/shared'
import { Services } from '../../../API'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useExportPrivateKey(identifier: PersonaIdentifier): AsyncState<string> {
    return useAsync(async () => {
        return Services.Identity.exportPersonaPrivateKey(identifier)
    }, [identifier])
}
