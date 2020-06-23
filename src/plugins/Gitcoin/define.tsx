import type { PluginConfig } from '../plugin'
import { PreviewCard } from './PreviewCard'
import React, { Suspense, useMemo, useState } from 'react'
import { SnackbarContent } from '@material-ui/core'
import useSWR from 'swr'
import { parseURL } from '../../utils/utils'
import Services from '../../extension/service'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../extension/background-script/CryptoServices/utils'
import { DonateDialog, DonatePayload } from './DonateDialog'
import { useWalletDataSource } from '../shared/useWallet'
import type { GitcoinGrantMetadata } from './Services'
import BigNumber from 'bignumber.js'
import { EthereumTokenType } from '../Wallet/database/types'
import { isNumber } from 'lodash-es'
import { DonateSuccessDialog, DonateFailDialog } from './Dialogs'
import { getNetworkSettings } from '../Wallet/UI/Developer/EthereumNetworkSettings'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'

const isGitcoin = (x: string): boolean => x.startsWith('https://gitcoin.co/grants')

export const GitcoinPluginDefine: PluginConfig = {
    identifier: 'co.gitcoin',
    successDecryptionInspector: function Component(props): JSX.Element | null {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isGitcoin)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    postInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails('postMetadataMentionedLinks')
            .concat(usePostInfoDetails('postMentionedLinks'))
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

function Gitcoin(props: { url: string }) {
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

    const [status, setStatus] = useState<'succeed' | 'failed' | 'undetermined' | 'initial'>('initial')
    const loading = status === 'undetermined'
    const [donateError, setDonateError] = useState<Error | null>(null)
    const [donatePayload, setDonatePayload] = useState<DonatePayload | null>(null)
    const onDonate = async (payload: DonatePayload) => {
        const { amount, address, token, tokenType } = payload
        if (!donationAddress) return
        const power = tokenType === EthereumTokenType.ETH ? 18 : token!.decimals
        try {
            setStatus('undetermined')
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
