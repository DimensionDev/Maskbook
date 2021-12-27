import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'
import { setupStorage, StorageDefaultValue } from '../../storage'
import { InjectedProviderBridge } from '../components/InjectedProviderBridge'
import { FortmaticProviderBridge } from '../components/FortmaticProviderBridge'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupStorage(context.createKVStorage('memory', StorageDefaultValue))
    },
    Web3UI,
    Web3State: {},
    GlobalInjection() {
        return (
            <>
                <InjectedProviderBridge type="ethereum" />
                <InjectedProviderBridge type="coin98" />
                <FortmaticProviderBridge />
            </>
        )
    },
}

export default sns
