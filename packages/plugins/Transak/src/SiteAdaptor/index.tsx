import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { base } from '../base.js'
import { PluginTransakMessages } from '../messages.js'
import { BuyTokenGlobalInjection } from './BuyTokenGlobalInjection.js'
import { Trans } from '@lingui/macro'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection: BuyTokenGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Transak size={36} />
            const name = <Trans>Fiat On-Ramp</Trans>
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
                                EntryComponentProps.onClick ?
                                    () => EntryComponentProps.onClick?.(openDialog)
                                :   openDialog
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 8,
                marketListSortingPriority: 6,
                tutorialLink: 'https://transak.com/',
                icon,
                description: (
                    <Trans>Fiat On-Ramp Aggregator on X. Buy crypto in 60+ countries with Transak support.</Trans>
                ),
                name,
                category: 'dapp',
                iconFilterColor,
            }
        })(),
    ],
}

export default site
