import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { CyberConnect as CyberConnectIcon } from '@masknet/icons'
import { useMemo } from 'react'
import { parseURL } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import Profile from './Profile'

const isCyberConnectUrl = (x: string): boolean => x.includes('app.cyberconnect.me')

function Renderer({ url }: { url: string }) {
    usePluginWrapper(true)
    return <Profile url={url} />
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props): JSX.Element | null {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isCyberConnectUrl)
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
            description: {
                i18nKey: '__plugin_description',
                fallback: 'Decentralized social graph protocol for user-centric Web3.',
            },
            name: { i18nKey: '__plugin_name', fallback: 'CyberConnect' },
            icon: <CyberConnectIcon size={36} />,
            tutorialLink: 'https://cyberconnect.me/',
        },
    ],
    wrapperProps: {
        icon: <CyberConnectIcon size={24} sx={{ filter: 'drop-shadow(0px 6px 12px rgba(27, 144, 238, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF;',
    },
}

export default sns
