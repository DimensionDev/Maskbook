import React, { useState, useCallback } from 'react'
import Services from '../../../extension/service'
import useSWR from 'swr'
import type { GitcoinGrantMetadata } from '../service'
import { useChainId } from '../../../web3/hooks/useChainId'
import { DonatePayload, DonateDialog } from './DonateDialog'
import { EthereumTokenType } from '../../../web3/types'
import { PreviewCard } from './PreviewCard'
import BigNumber from 'bignumber.js'
import { DonateSuccessDialog, DonateFailDialog } from './Dialogs'
import { isNumber } from 'lodash-es'
import { formatBalance } from '../../Wallet/formatter'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { MaskbookWalletMessages, WalletMessageCenter } from '../../Wallet/messages'

function fetcher(key: string, url: string) {
    return Services.Plugin.invokePlugin('co.gitcoin', 'fetchMetadata', url)
}

export interface GitcoinProps {
    url: string
}

export function Gitcoin(props: GitcoinProps) {
    const [open, setOpen] = useState(false)

    const url = props.url
    const { data, isValidating } = useSWR(['co.gitcoin', url], { fetcher })
    const { transactions, daiAmount, estimatedAmount, title, permalink, image, address: donationAddress } = data?.ok
        ? data.val
        : ({} as GitcoinGrantMetadata)
    const grantTitle = title ?? 'A Gitcoin Grant'

    const account = useAccount()
    const chainId = useChainId()
    const [status, setStatus] = useState<'succeed' | 'failed' | 'undetermined' | 'initial'>('initial')
    const loading = status === 'undetermined'
    const [donateError, setDonateError] = useState<Error | null>(null)
    const [donatePayload, setDonatePayload] = useState<DonatePayload | null>(null)

    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog<
        MaskbookWalletMessages,
        'selectProviderDialogUpdated'
    >(WalletMessageCenter, 'selectProviderDialogUpdated')
    const onRequest = useCallback(() => {
        if (account) setOpen(true)
        else
            setSelectProviderDialogOpen({
                open: true,
            })
    }, [account, setOpen, setSelectProviderDialogOpen])
    const onDonate = useCallback(
        async (payload: DonatePayload) => {
            const { amount, address, token, tokenType } = payload
            if (!donationAddress) return
            const power = tokenType === EthereumTokenType.Ether ? 18 : token!.decimals
            try {
                setStatus('undetermined')
                // await Services.Plugin.invokePlugin('co.gitcoin', 'donateGrant', {
                //     donation_address: donationAddress,
                //     donation_total: new BigNumber(amount).multipliedBy(new BigNumber(10).pow(power)),
                //     donor_address: address,
                //     chainId,
                //     token_type: tokenType,
                //     token: token,
                // })
                setOpen(false)
                setDonatePayload(payload)
                setStatus('succeed')
            } catch (e) {
                setDonateError(e)
                setStatus('failed')
            }
        },
        [chainId, donationAddress],
    )
    const onClose = useCallback(() => setStatus('initial'), [])

    return (
        <>
            <PreviewCard
                onRequestGrant={onRequest}
                loading={isValidating}
                logo={image}
                title={grantTitle}
                line1={BigNumber.isBigNumber(estimatedAmount) ? `${estimatedAmount.toFixed(2)} USD` : ''}
                line2="ESTIMATED"
                line3={BigNumber.isBigNumber(daiAmount) ? `${formatBalance(daiAmount, 18)} DAI` : ''}
                line4={isNumber(transactions) ? `${transactions} transactions` : ''}
                address={donationAddress}
                originalURL={url}
            />
            <DonateDialog
                loading={loading}
                address={donationAddress}
                open={!!(open && donationAddress?.length)}
                title={grantTitle}
                onDonate={onDonate}
                onClose={() => setOpen(false)}
            />
            <DonateSuccessDialog
                open={status === 'succeed'}
                title={grantTitle}
                url={permalink}
                amount={donatePayload?.amount!}
                token={donatePayload?.token!}
                tokenType={donatePayload?.tokenType!}
                onClose={onClose}
            />
            <DonateFailDialog open={status === 'failed'} message={donateError?.message} onClose={onClose} />
        </>
    )
}
