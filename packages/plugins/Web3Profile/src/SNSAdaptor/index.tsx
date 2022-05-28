import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Web3ProfileIcon } from '@masknet/icons'
import { useState } from 'react'
import { base } from '../base'
import { Web3ProfileDialog } from './components/Web3ProfileDialog'
import { setupContext } from './context'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { PLUGIN_ID } from '../constants'
import { Trans } from 'react-i18next'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        (() => {
            const icon = <Web3ProfileIcon />
            const name = { i18nKey: '__plugin_name', fallback: 'Web3-Profile' }
            const recommendFeature = {
                description: <Trans i18nKey="plugin_web3_profile_recommend_feature_description" />,
                backgroundGradient: 'linear-gradient(181.28deg, #6BA3FF 1.76%, #C2E9FB 99.59%)',
            }
            return {
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                {...EntryComponentProps}
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                icon={icon}
                                recommendFeature={recommendFeature}
                                onClick={EntryComponentProps.onClick ?? (() => setOpen(true))}
                            />
                            <Web3ProfileDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                ApplicationEntryID: base.ID,
                appBoardSortingDefaultPriority: 3,
                marketListSortingPriority: 3,
                name,
                icon,
                nextIdRequired: true,
                category: 'dapp',
                recommendFeature,
            }
        })(),
    ],
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_web3_profile`,
            label: 'Web3Profile',
            priority: 3,
            UI: {
                TabContent: ({ open = false, setOpen }) => {
                    return <Web3ProfileDialog open={open} onClose={() => setOpen(false)} />
                },
            },
        },
    ],
}

export default sns
