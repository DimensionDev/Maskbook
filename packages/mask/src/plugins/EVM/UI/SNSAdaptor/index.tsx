import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'
import { setupStorage, StorageDefaultValue } from '../../storage'
import { ProviderType } from '@masknet/web3-shared-evm'
import { isDashboardPage, isPopupPage } from '@masknet/shared-base'
import { ProviderBridge } from '../components/ProviderBridge'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupStorage(context.createKVStorage('memory', StorageDefaultValue))
    },
    Web3UI,
    Web3State: {},
    GlobalInjection() {
        if (isDashboardPage() || isPopupPage()) return null
        return (
            <>
                <ProviderBridge providerType={ProviderType.MetaMask} />
                <ProviderBridge providerType={ProviderType.Coin98} />
                <ProviderBridge providerType={ProviderType.Fortmatic} />
            </>
        )
    },
}

export default sns
