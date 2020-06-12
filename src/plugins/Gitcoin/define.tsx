import type { PluginConfig } from '../plugin'
import { PreviewCard } from './PreviewCard'
import React, { Suspense, useMemo, useState } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { useExtensionPermission } from '../../components/DataSource/useExtensionPermission'
import useSWR from 'swr'
import { parseURL } from '../../utils/utils'
import Services from '../../extension/service'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../extension/background-script/CryptoServices/utils'
import { Result, Ok, Err } from 'ts-results'
import { DonateCard } from './DonateCard'
import { useWalletDataSource } from '../shared/useWallet'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { useObservableValues } from '../../utils/hooks/useObservableMapSet'

const isGitcoin = (x: string): boolean => x.startsWith('https://gitcoin.co/grants')
export const GitCoinConfig: PluginConfig = {
    identifier: 'co.gitcoin',
    shouldActivateInSuccessDecryption(post) {
        const text = extractTextFromTypedMessage(post)
        // https://github.com/vultix/ts-results/issues/8
        if (text.ok) return shouldActivate(text.val).ok
        return false
    },
    SuccessDecryptionComponent(props) {
        const text = extractTextFromTypedMessage(props.message)
        if (text.err) return null
        const gitcoin = parseURL(text.val).find(isGitcoin)
        if (gitcoin) return Renderer({ url: gitcoin })
        return null
    },
    postInspector: function Comp(props) {
        const post = useValueRef(props.postContent)
        const link = useObservableValues(props.postMetadata.mentionedLinks)
            .concat(useMemo(() => parseURL(post), [post]))
            .find(isGitcoin)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    return (
        <MaskbookPluginWrapper pluginName="Gitcoin">
            <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                <PreviewCardLogic url={props.url} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}

function shouldActivate(post: string): Result<void, void> {
    const has = post.includes('https://gitcoin.co/grants/')
    if (has) return Ok.EMPTY
    return Err.EMPTY
}

function PreviewCardLogic(props: { url: string }) {
    const [open, setOpen] = useState(false)
    const [wallets, tokens, onRequireNewWallet] = useWalletDataSource()
    const { hasPermission, request } = useExtensionPermission({ origins: ['https://gitcoin.co/grants/**/*'] })
    const url = props.url
    const { revalidate, data, isValidating } = useSWR(url, {
        fetcher(url: string) {
            return Services.Plugin.invokePlugin('co.gitcoin', 'fetchMetadata', url)
        },
    })
    if (!data || data.err || !url) return null
    const { amount, contributors, finalAmount, title, image, description, address } = data.val
    return (
        <>
            <PreviewCard
                onRequestGrant={() => setOpen(true)}
                requestPermission={request}
                hasNoPermission={!hasPermission}
                loading={isValidating}
                image={image ? <img src={image} width="100%" /> : null}
                line1={`${finalAmount ?? 'Many'} DAI`}
                line2="ESTIMATED"
                line3={`${amount ?? 'Many'} DAI`}
                line4={`${contributors ?? 'Many'} contributors`}
                title={title ?? 'A Gitcoin grant'}
                address={address}
                originalURL={url}
            />
            <DonateCard
                {...{ wallets, tokens, onRequireNewWallet, address }}
                open={!!(open && address?.length)}
                onClose={() => setOpen(false)}
                title={title ?? 'A Gitcoin grant'}
                description={description ?? ''}
                onDonate={() => {}}
            />
        </>
    )
}
