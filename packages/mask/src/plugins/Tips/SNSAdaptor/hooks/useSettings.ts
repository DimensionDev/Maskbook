import { useAsyncRetry } from 'react-use'
import { PluginID } from '@masknet/plugin-infra'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { BindingProof, NextIDPlatform } from '@masknet/shared-base'
import type { Settings } from '../../types/index.js'

export function useSettings(publicKeyAsHex?: string) {
    const { Storage } = useWeb3State()

    return useAsyncRetry(async () => {
        if (!Storage || !publicKeyAsHex) return
        const storage = Storage.createNextIDStorage(publicKeyAsHex, NextIDPlatform.NextID, publicKeyAsHex)

        const settings = await storage.get<BindingProof[] | Settings>(PluginID.Tips)

        // When the data is legacy
        if (!Array.isArray(settings)) return settings

        const defaultAddress = settings.find((x) => x.isDefault)?.identity
        const hiddenAddresses = settings.filter((x) => x.isPublic === 0).map((x) => x.identity)

        return {
            defaultAddress,
            hiddenAddresses,
        }
    }, [Storage, publicKeyAsHex])
}
