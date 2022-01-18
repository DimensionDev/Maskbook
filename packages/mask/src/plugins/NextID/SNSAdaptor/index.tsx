import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PLUGIN_ID } from '../constants'
import { NextIdPage } from '../components/NextIdPage'
import { setupStorage, StorageDefaultValue } from '../storage'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        context.personaSign
        context.walletSign
        setupStorage(context.createKVStorage('memory', StorageDefaultValue))
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Wallet',
            priority: 99999,
            UI: {
                TabContent: (pr) => {
                    return <NextIdPage />
                },
            },
        },
    ],
}

export default sns
