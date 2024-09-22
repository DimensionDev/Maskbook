import { Icons } from '@masknet/icons'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { parseURLs } from '@masknet/shared-base'
import { MaskLightTheme } from '@masknet/theme'
import { ThemeProvider } from '@mui/material'
import { base } from '../base.js'
import { PLUGIN_META_KEY, PLUGIN_NAME } from '../constants.js'
import { PreviewCard } from './PreviewCard.js'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { useMemo } from 'react'
import { Trans } from '@lingui/macro'

const isGitcoin = (x: string): boolean => {
    return /^https:\/\/explorer\.gitcoin\.co\/#\/projects\/0x[\dA-Fa-f]{64}/.test(x)
}

function Renderer(props: { id: string; link: string }) {
    usePluginWrapper(true)

    return (
        <ThemeProvider theme={MaskLightTheme}>
            <PreviewCard grantId={props.id} link={props.link} />
        </ThemeProvider>
    )
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    DecryptedInspector(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.isNone()) return null
            return parseURLs(x.value).find(isGitcoin)
        }, [props.message])
        const id = link?.match(/0x[\dA-Fa-f]{64}/)?.[0]
        if (!id) return null
        return <Renderer id={id} link={link} />
    },
    CompositionDialogMetadataBadgeRender: new Map([[PLUGIN_META_KEY, () => PLUGIN_NAME]]),
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()

        const link = links.find(isGitcoin)
        const id = link?.match(/0x[\dA-Fa-f]{64}/)?.[0]

        if (!id) return null
        return <Renderer id={id} link={link} />
    },
    ApplicationEntries: [
        {
            hiddenInList: false,
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: (
                <Trans>
                    Display specific information of Gitcoin projects, donate to a project directly on social media.
                </Trans>
            ),
            name: <Trans>Gitcoin</Trans>,
            icon: <Icons.Gitcoin size={36} />,
            marketListSortingPriority: 9,
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
