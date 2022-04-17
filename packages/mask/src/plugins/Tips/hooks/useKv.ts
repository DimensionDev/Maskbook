import { NextIDStorage } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
export function useKvGet() {
    const res = useAsyncRetry(async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        if (!currentPersonaIdentifier) return []
        const currentPersona = await Services.Identity.queryPersona(currentPersonaIdentifier)
        if (!currentPersona || !currentPersona.publicHexKey) return []
        return NextIDStorage.get(currentPersona.publicHexKey)
    })
    return res
}
