import type { PluginConfig } from '../plugin'
import { PreviewCard } from './PreviewCard'
import React, { Suspense } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { useExtensionPermission } from '../../components/DataSource/useExtensionPermission'

export const GitCoinConfig: PluginConfig = {
    shouldActivate(post) {
        return post.includes('https://gitcoin.co/grants/')
    },
    Renderer(props) {
        return (
            <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                <PreviewCardLogic {...props} />
            </Suspense>
        )
    },
}

function PreviewCardLogic(props: { post: string }) {
    const { hasPermission, request } = useExtensionPermission({ origins: ['https://gitcoin.co/grants/**/*'] })
    return (
        <PreviewCard
            requestPermission={request}
            hasNoPermission={!hasPermission}
            image=""
            line1="content1"
            line2="content2"
            line3="content3"
            line4="content4"
            title="title"
        />
    )
}
