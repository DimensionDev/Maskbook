import React, { useState, useCallback } from 'react'
import Services from '../../../extension/service'
import useSWR from 'swr'
import type { GitcoinGrantMetadata } from '../service'
import { DonateDialog } from './DonateDialog'
import { PreviewCard } from './PreviewCard'
import BigNumber from 'bignumber.js'
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

    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog<
        MaskbookWalletMessages,
        'selectProviderDialogUpdated'
    >(WalletMessageCenter, 'selectProviderDialogUpdated')
    const onRequest = useCallback(() => {
        if (account) {
            setOpen(true)
            return
        }
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [account, setOpen, setSelectProviderDialogOpen])

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
                address={donationAddress}
                open={!!(open && donationAddress?.length)}
                title={grantTitle}
                onClose={() => setOpen(false)}
            />
        </>
    )
}
