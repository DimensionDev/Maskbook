import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PluginGameMessages } from '../messages'
// import { Trans } from 'react-i18next'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationEntry } from '@masknet/shared'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection() {
        return (
            <>
                <div>Game</div>
            </>
        )
    },
    ApplicationEntries: [
        (() => {
            const icon = <img src={new URL('../assets/logo.png', import.meta.url).toString()} />
            const name = 'Game' // <Trans i18nKey="plugin_pets_name" />
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const { openDialog } = useRemoteControlledDialog(PluginGameMessages.events.essayDialogUpdated)

                    return <ApplicationEntry disabled={disabled} title={name} icon={icon} onClick={openDialog} />
                },
                appBoardSortingDefaultPriority: 11,
                marketListSortingPriority: 12,
                icon,
                description: 'Game description', // <Trans i18nKey="plugin_pets_description" />,
                name,
                tutorialLink: 'https://twitter.com/NonFFriend',
                category: 'dapp',
            }
        })(),
    ],
}

export default sns
