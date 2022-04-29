import { useAsync } from 'react-use'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { Services } from '../../../API'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useExportMnemonicWords(identifier: PersonaIdentifier): AsyncState<string> {
    return useAsync(async () => {
        return Services.Backup.backupPersonaMnemonicWords(identifier)
    }, [identifier])
}
