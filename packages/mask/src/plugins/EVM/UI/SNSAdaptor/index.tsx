import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'
import { Web3State } from '../Web3State'
import { InjectedProviderBridge } from '../components/InjectedProviderBridge'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    Web3UI,
    Web3State,
    GlobalInjection() {
        return (
            <>
                <InjectedProviderBridge />
            </>
        )
    },
}

export default sns
