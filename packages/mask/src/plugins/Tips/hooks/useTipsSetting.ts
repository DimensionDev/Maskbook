import { PluginId } from '@masknet/plugin-infra'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { BindingProof, ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import type { TipsSettingType } from '../types'

export function useTipsSetting(identifier?: ECKeyIdentifier) {
    const { Storage } = useWeb3State()

    return useAsyncRetry(async () => {
        if (!Storage || !identifier) return
        const storage = Storage.createNextIDStorage(
            identifier.publicKeyAsHex,
            NextIDPlatform.NextID,
            identifier.publicKeyAsHex,
        )

        const settings = await storage.get<BindingProof[] | TipsSettingType>(PluginId.Tips)

        // When the data is legacy
        if (!Array.isArray(settings)) return settings

        const hiddenAddresses = settings.filter((x) => x.isPublic === 0).map((x) => x.identity)
        const defaultAddress = settings.find((x) => x.isDefault)?.identity

        return {
            hiddenAddresses,
            defaultAddress,
        }
    }, [Storage, identifier])
}
