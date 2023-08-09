import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { ThemeProvider } from '@mui/material'
import { MaskLightTheme } from '@masknet/theme'
import { base } from '../base.js'
import { Icons } from '@masknet/icons'
import { useMemo } from 'react'
import { parseURLs } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import Profile from './Profile.js'
import { Trans } from 'react-i18next'

const isCyberConnectUrl = (x: string): boolean => !!x.match(/app\.cyberconnect\.me\/.+\/(0x[\dA-Fa-f]{40}|\w+.eth)/)

function Renderer({ url }: { url: string }) {
    usePluginWrapper(true)

    return (
        <ThemeProvider theme={MaskLightTheme}>
            <Profile url={url} />
        </ThemeProvider>
    )
}

const sns: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props): JSX.Element | null {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURLs(x.val).find(isCyberConnectUrl)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails.mentionedLinks().find(isCyberConnectUrl)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 17,
            description: (
                <Trans
                    i18nKey="__plugin_description"
                    defaults="Decentralized social graph protocol for user-centric Web3."
                    ns={base.ID}
                />
            ),
            name: <Trans i18nKey="__plugin_name" fallback="CyberConnect" ns={base.ID} />,
            icon: <Icons.CyberConnect size={36} />,
            tutorialLink: 'https://cyberconnect.me/',
        },
    ],
    wrapperProps: {
        icon: (
            <Icons.CyberConnect
                variant="light"
                style={{ width: 24, height: 24, filter: 'drop-shadow(0px 6px 12px rgba(27, 144, 238, 0.2))' }}
            />
        ),
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF;',
    },
}

export default sns
