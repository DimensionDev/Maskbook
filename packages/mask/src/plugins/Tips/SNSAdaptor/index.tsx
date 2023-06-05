import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import type { Plugin } from '@masknet/plugin-infra'
import { SNSAdaptorPluginContext } from '@masknet/web3-providers'
import { base } from '../base.js'
import { TipTaskManager } from '../contexts/index.js'
import { guideStorageDefaultValue, setupStorage, storageDefaultValue } from '../storage/index.js'
import { TipsRealmContent } from './components/TipsRealmContent/index.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(_, context) {
        SNSAdaptorPluginContext.setup(context)

        const storage = context.createKVStorage('memory', storageDefaultValue)
        const guideStorage = context.createKVStorage('persistent', guideStorageDefaultValue)
        setupStorage(storage, guideStorage)
    },
    GlobalInjection() {
        return <TipTaskManager />
    },
    TipsRealm: {
        ID: `${base.ID}_tips`,
        priority: 1,
        UI: {
            Content(props) {
                return (
                    <SNSAdaptorContext.Provider value={SNSAdaptorPluginContext.context}>
                        <TipsRealmContent {...props} />
                    </SNSAdaptorContext.Provider>
                )
            },
        },
    },
}

export default sns
