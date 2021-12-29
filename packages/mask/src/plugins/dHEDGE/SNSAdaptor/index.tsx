import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared-base'
import { SnackbarContent } from '@mui/material'
import { base } from '../base'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { PoolView } from '../UI/PoolView'
import { InvestDialog } from '../UI/InvestDialog'
import { escapeRegExp } from 'lodash-unified'
import { BASE_URL, STAGING_URL } from '../constants'

function createMatchLink() {
    return new RegExp(`(${escapeRegExp(BASE_URL)}|${escapeRegExp(STAGING_URL)})/pool/(\\w+)`)
}

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
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const links = useMemo(() => parseURL(text.val || ''), [text.val])
        const pool = getPoolFromLinks(links)
        if (!text.ok) return null
        if (!pool?.address) return null
        return <Renderer link={pool.link} address={pool.address} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks())
        const pool = getPoolFromLinks(links)
        if (!pool?.address) return null
        return <Renderer link={pool.link} address={pool.address} />
    },
    GlobalInjection: function Component() {
        return <InvestDialog />
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ link: string; address: string }>) {
    return (
        <MaskPluginWrapper pluginName="dHEDGE">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <PoolView address={props.address} link={props.link} />
            </Suspense>
        </MaskPluginWrapper>
    )
}
