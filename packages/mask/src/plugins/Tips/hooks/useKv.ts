import { NextIDStorage } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
export function useKvGet() {
    const res = useAsyncRetry(async () => {
        const currentPersona = await Services.Settings.getCurrentPersona()
        if (!currentPersona || !currentPersona.publicHexKey) return []
        return NextIDStorage.get(currentPersona.publicHexKey)
    })
    return res
}
