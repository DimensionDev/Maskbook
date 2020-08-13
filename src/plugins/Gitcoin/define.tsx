import type { PluginConfig } from '../plugin'
import { PreviewCard } from './PreviewCard'
import React, { Suspense, useMemo, useState } from 'react'
import { SnackbarContent } from '@material-ui/core'
import useSWR from 'swr'
import { parseURL } from '../../utils/utils'
import Services from '../../extension/service'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../protocols/typed-message'
import { DonateDialog, DonatePayload } from './DonateDialog'
import { useTokens, useWallets } from '../shared/useWallet'
import type { GitcoinGrantMetadata } from './Services'
import BigNumber from 'bignumber.js'
import { EthereumTokenType } from '../Wallet/database/types'
import { isNumber } from 'lodash-es'
import { DonateSuccessDialog, DonateFailDialog } from './Dialogs'
import { getNetworkSettings } from '../Wallet/UI/Developer/EthereumNetworkSettings'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { formatBalance } from '../Wallet/formatter'

const isGitcoin = (x: string): boolean => x.startsWith('https://gitcoin.co/grants')

export const GitcoinPluginDefine: PluginConfig = {
    pluginName: 'Gitcoin',
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
    postDialogMetadataBadge: new Map([['abc', (meta) => 'Wow my meta']]),
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

function fetcher(url: string) {
    return Services.Plugin.invokePlugin('co.gitcoin', 'fetchMetadata', url)
}
function Gitcoin(props: { url: string }) {
    const [open, setOpen] = useState(false)
    const { data: wallets } = useWallets()
    const { data: tokens } = useTokens()
    const url = props.url
    const { data, isValidating } = useSWR(url, { fetcher })
    const {
        transactions,
        daiAmount,
        estimatedAmount,
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
    const onRequest = () => {
        if (!wallets) return
        if (wallets.length === 0) Services.Provider.requestConnectWallet()
        else setOpen(true)
    }
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
                network: getNetworkSettings(await Services.Plugin.getCurrentEthChain()).networkType,
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
                onRequestGrant={onRequest}
                requestPermission={() => {}}
                hasPermission={true}
                loading={isValidating}
                logo={image}
                title={grantTitle}
                line1={BigNumber.isBigNumber(estimatedAmount) ? `${estimatedAmount.toFixed(2)} USD` : ''}
                line2="ESTIMATED"
                line3={BigNumber.isBigNumber(daiAmount) ? `${formatBalance(daiAmount, 18)} DAI` : ''}
                line4={isNumber(transactions) ? `${transactions} transactions` : ''}
                address={donationAddress}
                originalURL={url ?? ''}
            />
            {wallets?.length ? (
                <DonateDialog
                    loading={loading}
                    address={donationAddress}
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
