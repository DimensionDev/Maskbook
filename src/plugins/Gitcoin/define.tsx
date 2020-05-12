import type { PluginConfig } from '../plugin'
import { PreviewCard } from './PreviewCard'
import React, { Suspense, useMemo } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { useExtensionPermission } from '../../components/DataSource/useExtensionPermission'
import useSWR from 'swr'
import { parseURL } from '../../utils/utils'
import Services from '../../extension/service'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'

export const GitCoinConfig: PluginConfig = {
    shouldActivate(post) {
        return post.includes('https://gitcoin.co/grants/')
    },
    Renderer(props) {
        return (
            <MaskbookPluginWrapper pluginName="Gitcoin">
                <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                    <PreviewCardLogic {...props} />
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
}

function PreviewCardLogic(props: { post: string }) {
    const { hasPermission, request } = useExtensionPermission({ origins: ['https://gitcoin.co/grants/**/*'] })
    const url = useMemo(() => parseURL(props.post).find((x) => x.startsWith('https://gitcoin.co/grants')) ?? null, [
        props.post,
    ])
    const { revalidate, data, isValidating } = useSWR(url, {
        fetcher(url: string) {
            return Services.Plugin.invokePlugin('co.gitcoin', 'fetchMetadata', url)
        },
    })
    if (!data || data.err) return null
    const { amount, contributors, finalAmount, title, image, width } = data.val
    return (
        <PreviewCard
            requestPermission={request}
            hasNoPermission={!hasPermission}
            loading={isValidating}
            image={image ? <img src={image} width={Math.min(width ?? 130, 130)} /> : null}
            line1={`${finalAmount ?? 'Many'} DAI`}
            line2="ESTIMATED"
            line3={`${amount ?? 'Many'} DAI`}
            line4={`${contributors ?? 'Many'} contributors`}
            title={title ?? 'A Gitcoin grant'}
        />
    )
}
