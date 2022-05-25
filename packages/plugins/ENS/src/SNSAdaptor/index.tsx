import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { parseURL } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { useMemo, useState } from 'react'
import { base } from '../base'
import { setupContext } from './context'
import ENSCard from './ENSCard'
import ENSDialog from './ENSDialog'
import { ApplicationEntry } from '@masknet/shared'
import { PLUGIN_ID } from '../constants'

const isENS = (x: string): boolean => /^https:\/\/app.ens.domains\/name\/[\S\s]{3,}.eth\/details$/.test(x)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    CompositionDialogEntry: {
        label: 'ENS',
        dialog: ENSDialog,
    },
    PostInspector: function Component(): JSX.Element | null {
        const links = usePostInfoDetails.mentionedLinks()
        const link = links.find(isENS)
        if (!link) return null
        return <ENSCard url={link} />
    },
    DecryptedInspector: function Component(props): JSX.Element | null {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isENS)
        }, [props.message])
        if (!link) return null
        return <ENSCard url={link} />
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'ENS',
            priority: 10,
            UI: {
                TabContent: (identity) => (
                    <ENSCard
                        url="kk"
                        identity={{
                            userId: identity?.identity?.identifier?.userId,
                            bio: identity?.identity?.bio,
                            nickname: identity?.identity?.nickname,
                        }}
                    />
                ),
            },
        },
    ],
    ApplicationEntries: [
        (() => {
            const icon = <img src={new URL('./assets/ens.png', import.meta.url).toString()} />
            const name = { i18nKey: '__plugin_name', fallback: 'ENS' }
            const iconFilterColor = 'rgba(183, 212, 255, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                disabled={disabled}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={() => setOpen(true)}
                            />
                            <ENSDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 5,
                name,
                icon,
                iconFilterColor,
                tutorialLink: 'https://ens.domains',
            }
        })(),
    ],
}

export default sns
