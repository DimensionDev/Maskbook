import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { MaskColorVar } from '@masknet/theme'
import { Link } from '@mui/material'
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
    ApplicationEntries: [
        (() => {
            const name = base.name
            const icon = <Icons.Tips size={36} />
            const iconFilterColor = 'rgba(247, 147, 30, 0.3)'
            return {
                category: 'dapp',
                description: (
                    <Trans
                        ns={PluginID.Tips}
                        i18nKey="description"
                        components={{
                            Link: (
                                <Link
                                    href="https://next.id/"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    style={{ color: MaskColorVar.primary }}
                                />
                            ),
                        }}
                    />
                ),
                ApplicationEntryID: base.ID,
                icon,
                name,
                iconFilterColor,
                appBoardSortingDefaultPriority: 5,
                nextIdRequired: true,
                entryWalletConnectedNotRequired: true,
            }
        })(),
    ],
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
