import { Trans } from 'react-i18next'
import type { Plugin } from '@masknet/plugin-infra'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { BuyTokenDialog } from './BuyTokenDialog.js'
import { PluginTransakMessages } from '../messages.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <BuyTokenDialog />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Transak size={36} />
            const name = <Trans i18nKey="plugin_transak_name" />
            const iconFilterColor = 'rgba(69, 110, 255, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const { openDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

                    return (
                        <ApplicationEntry
                            title={name}
                            icon={icon}
                            iconFilterColor={iconFilterColor}
                            {...EntryComponentProps}
                            onClick={
                                EntryComponentProps.onClick
                                    ? () => EntryComponentProps.onClick?.(openDialog)
                                    : openDialog
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 8,
                marketListSortingPriority: 6,
                tutorialLink: 'https://transak.com/',
                icon,
                description: <Trans i18nKey="plugin_transak_description" />,
                name,
                category: 'dapp',
                iconFilterColor,
            }
        })(),
    ],
}

export default sns
