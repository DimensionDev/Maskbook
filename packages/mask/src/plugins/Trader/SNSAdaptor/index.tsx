import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { TraderDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Trans } from 'react-i18next'
import { TagInspector } from './trending/TagInspector'
import { enhanceTag } from './cashTag'
import { ApplicationEntry } from '@masknet/shared'
import { SwapIcon } from '@masknet/icons'
import { PluginTraderMessages } from '../messages'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchResultBox: SearchResultInspector,
    GlobalInjection: function Component() {
        return (
            <>
                <TagInspector />
                <TraderDialog />
            </>
        )
    },
    enhanceTag,
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled, AppIcon, title }) {
                const { openDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

                return <ApplicationEntry disabled={disabled} title={title} AppIcon={AppIcon} onClick={openDialog} />
            },
            appBoardSortingDefaultPriority: 9,
            marketListSortingPriority: 5,
            AppIcon: <SwapIcon />,
            category: 'dapp',
            name: <Trans i18nKey="plugin_trader_swap" />,
            tutorialLink:
                'https://realmasknetwork.notion.site/Trade-cryptos-on-Twitter-via-Uniswap-Sushi-0x-Support-ETH-BSC-Polygon-Arbitrum-f2e7d081ee38487ca1db958393ac1edc',
            description: <Trans i18nKey="plugin_trader_swap_description" />,
        },
    ],
}

export default sns
