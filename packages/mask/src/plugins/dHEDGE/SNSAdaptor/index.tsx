import { useMemo } from 'react'
import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { DhedgeIcon } from '@masknet/icons'
import { base } from '../base'
import { PoolView } from '../UI/PoolView'
import { Trans } from 'react-i18next'
import { InvestDialog } from '../UI/InvestDialog'
import { createMatchLink } from '../constants'

function getPoolFromLink(link: string) {
    const matchLink = createMatchLink()
    const [, , address] = matchLink ? link.match(matchLink) ?? [] : []
    return {
        link,
        address,
    }
}

function getPoolFromLinks(links: string[]) {
    return links.map(getPoolFromLink).find(Boolean)
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const links = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val)
        }, [props.message])
        if (!links) return null
        const pool = getPoolFromLinks(links)
        if (!pool?.address) return null
        return <Renderer link={pool.link} address={pool.address} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const pool = getPoolFromLinks(links)
        if (!pool?.address) return null
        return <Renderer link={pool.link} address={pool.address} />
    },
    GlobalInjection: function Component() {
        return <InvestDialog />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans i18nKey="plugin_dhedge_description" />,
            name: <Trans i18nKey="plugin_dhedge_name" />,
            icon: <DhedgeIcon />,
            marketListSortingPriority: 11,
            tutorialLink: 'https://realmasknetwork.notion.site/fb00ff2e626949279c83b59ed9207b9a',
        },
    ],
    wrapperProps: {
        icon: (
            <DhedgeIcon
                style={{ width: 24, height: 24, filter: 'drop-shadow(0px 6px 12px rgba(27, 144, 238, 0.2))' }}
            />
        ),
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(0, 150, 202, 0.2) 100%), #FFFFFF;',
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ link: string; address: string }>) {
    usePluginWrapper(true)
    return <PoolView address={props.address} link={props.link} />
}
