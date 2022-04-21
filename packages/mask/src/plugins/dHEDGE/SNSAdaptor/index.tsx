import { useMemo } from 'react'
import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { DHEDGEIcon } from '@masknet/icons'
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
            icon: <DHEDGEIcon />,
            marketListSortingPriority: 11,
            tutorialLink:
                'https://realmasknetwork.notion.site/Invest-in-your-favourite-fund-manager-via-dHEDGE-on-Twitter-ETH-and-Polygon-fb00ff2e626949279c83b59ed9207b9a',
        },
    ],
}

export default sns

function Renderer(props: React.PropsWithChildren<{ link: string; address: string }>) {
    usePluginWrapper(true)
    return <PoolView address={props.address} link={props.link} />
}
