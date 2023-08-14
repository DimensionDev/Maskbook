import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { base } from '../base.js'
import WalletConnectDialog, { ConnectContext } from './WalletConnectDialog.js'
import { CrossIsolationMessages, PluginID } from '@masknet/shared-base'

const site: Plugin.SiteAdaptor.Definition = {
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
            const icon = <Icons.Game size={36} />
            const name = <Trans i18nKey="plugin_game_name" ns={PluginID.Game} />
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled, ...props }) {
                    const { openDialog } = useRemoteControlledDialog(CrossIsolationMessages.events.gameDialogUpdated)

                    return (
                        <ApplicationEntry
                            {...props}
                            disabled
                            title={name}
                            icon={icon}
                            secondTitle="More coming"
                            onClick={props.onClick ? () => props.onClick?.(openDialog) : openDialog}
                        />
                    )
                },
                appBoardSortingDefaultPriority: 16,
                marketListSortingPriority: 12,
                icon,
                description: <Trans i18nKey="plugin_game_description" ns={PluginID.Game} />,
                name,
                tutorialLink: 'https://twitter.com/NonFFriend',
                category: 'other',
            }
        })(),
    ],
}

export default site
