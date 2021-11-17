import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { InjectedProviderBridge } from '../components/InjectedProviderBridge'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <InjectedProviderBridge />
            </>
        )
    },
}

export default sns
