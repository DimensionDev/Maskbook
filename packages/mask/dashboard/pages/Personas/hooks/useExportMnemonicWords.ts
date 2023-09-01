import { useAsync } from 'react-use'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { Services } from '../../../../shared-ui/service.js'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'

export function useExportMnemonicWords(identifier: PersonaIdentifier): AsyncState<string> {
    return useAsync(async () => {
        return Services.Backup.backupPersonaMnemonicWords(identifier)
    }, [identifier])
}
