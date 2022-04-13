import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../extension/service'
export function useProvedWallets() {
    const res = useAsyncRetry(async () => {
        const currentPersona = await Services.Settings.getCurrentPersona()
        if (!currentPersona || !currentPersona.publicHexKey) return []
        return NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey)
    }, [])

    // useEffect(() => Messages.events.ownProofChanged.on(res.retry), [res.retry])
    return res
}
