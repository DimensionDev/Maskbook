import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { CyberConnectIcon } from '@masknet/icons'
import { Trans } from 'react-i18next'
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
            category: 'dapp',
            marketListSortingPriority: 17,
            description: <Trans i18nKey="plugin_cyber_connect_description" />,
            name: <Trans i18nKey="plugin_cyber_connect_name" />,
            icon: <CyberConnectIcon />,
            tutorialLink: 'https://cyberconnect.me/',
        },
    ],
}

export default sns
