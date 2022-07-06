import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PluginGameMessages } from '../messages'
import { Trans } from 'react-i18next'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationEntry } from '@masknet/shared'
import WalletConnectDialog, { ConnectContext } from './WalletConnectDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection() {
        return (
            <ConnectContext.Provider>
                <WalletConnectDialog />
            </ConnectContext.Provider>
        )
    },
    ApplicationEntries: [
        (() => {
            const icon = <img src={new URL('../assets/game.png', import.meta.url).toString()} />
            const name = <Trans i18nKey="plugin_game_name" />
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const { openDialog } = useRemoteControlledDialog(PluginGameMessages.events.gameDialogUpdated)

                    return <ApplicationEntry disabled={disabled} title={name} icon={icon} onClick={openDialog} />
                },
                appBoardSortingDefaultPriority: 11,
                marketListSortingPriority: 12,
                icon,
                description: <Trans i18nKey="plugin_game_description" />,
                name,
                tutorialLink: 'https://twitter.com/NonFFriend',
                category: 'dapp',
            }
        })(),
    ],
}

export default sns
