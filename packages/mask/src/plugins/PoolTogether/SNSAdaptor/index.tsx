import { PoolTogether } from '@masknet/icons'
import { usePluginWrapper, usePostInfoDetails, type Plugin } from '@masknet/plugin-infra/content-script'
import { parseURL } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { useMemo } from 'react'
import { Trans } from 'react-i18next'
import { base } from '../base'
import { URL_PATTERN } from '../constants'
import { DepositDialog } from '../UI/DepositDialog'
import { PoolTogetherView } from '../UI/PoolTogetherView'

const isPoolTogetherUrl = (url: string) => URL_PATTERN.test(url)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isPoolTogetherUrl)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = links.find(isPoolTogetherUrl)

        if (!link) return null
        return <Renderer url={link} />
    },
    GlobalInjection: function Component() {
        return <DepositDialog />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans i18nKey="plugin_pooltogether_description" />,
            name: <Trans i18nKey="plugin_pooltogether_name" />,
            marketListSortingPriority: 14,
            tutorialLink: 'https://realmasknetwork.notion.site/377597e14aff441ab645ecba5ea690f1',
            icon: <PoolTogether />,
        },
    ],
    wrapperProps: {
        icon: <PoolTogether size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(70, 39, 155, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(70, 39, 155, 0.2) 100%), #FFFFFF;',
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    usePluginWrapper(true)
    return <PoolTogetherView />
}
