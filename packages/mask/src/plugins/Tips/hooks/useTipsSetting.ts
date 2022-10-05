import { useAsyncRetry } from 'react-use'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { PluginID, BindingProof, NextIDPlatform } from '@masknet/shared-base'
import type { TipsSettingType } from '../types/index.js'

export function useTipsSetting(publicKeyAsHex?: string) {
    const { Storage } = useWeb3State()

    return useAsyncRetry(async () => {
        if (!Storage || !publicKeyAsHex) return
        const storage = Storage.createNextIDStorage(publicKeyAsHex, NextIDPlatform.NextID, publicKeyAsHex)

        const settings = await storage.get<BindingProof[] | TipsSettingType>(PluginID.Tips)

        // When the data is legacy
        if (!Array.isArray(settings)) return settings

        const hiddenAddresses = settings.filter((x) => x.isPublic === 0).map((x) => x.identity)
        const defaultAddress = settings.find((x) => x.isDefault)?.identity

        return {
            hiddenAddresses,
            defaultAddress,
        }
    }, [Storage, publicKeyAsHex])
}
