import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { type Plugin, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { PluginID } from '@masknet/shared-base'
import { MaskLightTheme } from '@masknet/theme'
import { ThemeProvider } from '@mui/material'
import { base } from '../base.js'
import { PLUGIN_META_KEY, PLUGIN_NAME } from '../constants.js'
import { PreviewCard } from './PreviewCard.js'
import { Modals } from './modals/index.js'

const isGitcoin = (x: string): boolean => /^https:\/\/gitcoin.co\/grants\/\d+/.test(x)

function Renderer(props: { id: string }) {
    usePluginWrapper(true)

    return (
        <ThemeProvider theme={MaskLightTheme}>
            <PreviewCard grantId={props.id} />
        </ThemeProvider>
    )
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(_, context) {},
    GlobalInjection() {
        return <Modals />
    },
    CompositionDialogMetadataBadgeRender: new Map([[PLUGIN_META_KEY, () => PLUGIN_NAME]]),
    ApplicationEntries: [
        {
            hiddenInList: true,
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans ns={PluginID.Gitcoin} i18nKey="description" />,
            name: <Trans ns={PluginID.Gitcoin} i18nKey="name" />,
            icon: <Icons.Gitcoin size={36} />,
            marketListSortingPriority: 9,
            tutorialLink: 'https://realmasknetwork.notion.site/98ed83784ed4446a8a13fa685c7bddfb',
        },
    ],
    wrapperProps: {
        icon: (
            <Icons.Gitcoin
                variant="light"
                size={24}
                style={{ filter: 'drop-shadow(0px 6px 12px rgba(255, 159, 10, 0.2))' }}
            />
        ),
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(41, 228, 253, 0.2) 100%), #FFFFFF',
    },
}

export default site
