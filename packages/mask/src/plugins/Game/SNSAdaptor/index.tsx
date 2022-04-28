import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PluginGameMessages } from '../messages'
// import { Trans } from 'react-i18next'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationEntry } from '@masknet/shared'
import WalletConnectDialog from './WalletConnectDialog'
// import GameWindow from './GameWindow'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection() {
        return (
            <>
                {/* <GameWindow /> */}
                <WalletConnectDialog />
            </>
        )
    },
    ApplicationEntries: [
        (() => {
            const icon = <img src={new URL('../assets/icon-logo.png', import.meta.url).toString()} />
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
