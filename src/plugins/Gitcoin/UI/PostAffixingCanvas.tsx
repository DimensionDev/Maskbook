import React, { useState } from 'react'
import { useWallets, useTokens } from '../../shared/useWallet'
import useSWR from 'swr'
import Services from '../../../extension/service'
import type { GitcoinGrantMetadata } from '../Services'
import { EthereumTokenType } from '../../Wallet/database/types'
import { DonatePayload, DonateDialog } from './DonateDialog'
import BigNumber from 'bignumber.js'
import { getNetworkSettings } from '../../Wallet/UI/Developer/EthereumNetworkSettings'
import { PreviewCard } from './PreviewCard'
import { isNumber } from 'lodash-es'
import { formatBalance } from '../../Wallet/formatter'
import { DonateSuccessDialog, DonateFailDialog } from './Dialogs'

function fetcher(key: string, url: string) {
    return Services.Plugin.invokePlugin('co.gitcoin', 'fetchMetadata', url)
}

export interface PostAffixingCanvasProps {
    url: string
}

export function PostAffixingCanvas({ url }: PostAffixingCanvasProps) {
    const [open, setOpen] = useState(false)
    const { data: wallets } = useWallets()
    const { data: tokens } = useTokens()
    const { data, isValidating } = useSWR(['co.gitcoin', url], { fetcher })
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
                onClose={onClose}
            />
            <DonateFailDialog open={status === 'failed'} message={donateError?.message} onClose={onClose} />
        </>
    )
}
