import type { PluginConfig } from '../plugin'
import { PreviewCard } from './PreviewCard'
import React, { Suspense, useMemo, useState } from 'react'
import { SnackbarContent } from '@material-ui/core'
import useSWR from 'swr'
import { parseURL } from '../../utils/utils'
import Services from '../../extension/service'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../extension/background-script/CryptoServices/utils'
import { Result, Ok, Err } from 'ts-results'
import { DonateDialog, DonatePayload } from './DonateDialog'
import { useWalletDataSource } from '../shared/useWallet'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { useObservableValues } from '../../utils/hooks/useObservableMapSet'
import type { GitcoinGrantMetadata } from './Services'
import BigNumber from 'bignumber.js'
import { EthereumTokenType } from '../Wallet/database/types'
import { isNumber } from 'lodash-es'
import { DonateSuccessDialog, DonateFailDialog } from './Dialogs'
import { getNetworkSettings } from '../Wallet/UI/Developer/EthereumNetworkSettings'

const isGitcoin = (x: string): boolean => x.startsWith('https://gitcoin.co/grants')
export const GitcoinPluginDefine: PluginConfig = {
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
                <Gitcoin url={props.url} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}

function shouldActivate(post: string): Result<void, void> {
    const has = post.includes('https://gitcoin.co/grants/')
    if (has) return Ok.EMPTY
    return Err.EMPTY
}

function Gitcoin(props: { url: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [wallets, tokens, onRequireNewWallet] = useWalletDataSource()
    const url = props.url
    const { revalidate, data, isValidating } = useSWR(url, {
        fetcher(url: string) {
            return Services.Plugin.invokePlugin('co.gitcoin', 'fetchMetadata', url)
        },
    })
    const {
        amount,
        contributors,
        finalAmount,
        title,
        permalink,
        image,
        description,
        address: donationAddress,
    } = data?.ok ? data.val : ({} as GitcoinGrantMetadata)
    const grantTitle = title ?? 'A Gitcoin grant'

    const [status, setStatus] = useState<'succeed' | 'failed' | 'initial'>('initial')
    const [donateError, setDonateError] = useState<Error | null>(null)
    const [donatePayload, setDonatePayload] = useState<DonatePayload | null>(null)
    const onDonate = async (payload: DonatePayload) => {
        const { amount, address, token, tokenType } = payload
        if (!donationAddress) return
        const power = tokenType === EthereumTokenType.ETH ? 18 : token!.decimals
        try {
            setLoading(true)
            await Services.Plugin.invokePlugin('co.gitcoin', 'donateGrant', {
                donation_address: donationAddress,
                donation_total: new BigNumber(amount).multipliedBy(new BigNumber(10).pow(power)),
                donor_address: address,
                network: getNetworkSettings().networkType,
                token_type: tokenType,
                token: token,
            })
            setOpen(false)
            setDonatePayload(payload)
            setStatus('succeed')
        } catch (e) {
            setDonateError(e)
            setStatus('failed')
        } finally {
            setLoading(false)
        }
    }
    const onClose = () => setStatus('initial')

    return (
        <>
            <PreviewCard
                onRequestGrant={() => (wallets.length === 0 ? onRequireNewWallet() : setOpen(true))}
                requestPermission={() => {}}
                hasPermission={true}
                loading={isValidating}
                logo={image}
                title={grantTitle}
                line1={isNumber(finalAmount) ? `${finalAmount} DAI` : ''}
                line2="ESTIMATED"
                line3={isNumber(amount) ? `${amount} DAI` : ''}
                line4={isNumber(contributors) ? `${contributors} contributors` : ''}
                address={donationAddress}
                originalURL={url ?? ''}
            />
            {wallets.length ? (
                <DonateDialog
                    loading={loading}
                    address={donationAddress}
                    onRequireNewWallet={onRequireNewWallet}
                    wallets={wallets}
                    tokens={tokens}
                    open={!!(open && donationAddress?.length)}
                    title={grantTitle}
                    description={description ?? ''}
                    onDonate={onDonate}
                    onClose={() => setOpen(false)}
                />
            ) : null}
            <DonateSuccessDialog
                open={status === 'succeed'}
                title={grantTitle}
                url={permalink ?? ''}
                amount={donatePayload?.amount!}
                token={donatePayload?.token!}
                tokenType={donatePayload?.tokenType!}
                onClose={onClose}></DonateSuccessDialog>
            <DonateFailDialog
                open={status === 'failed'}
                message={donateError?.message}
                onClose={onClose}></DonateFailDialog>
        </>
    )
}
