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
    const url = props.url
    const { data } = useSWR(['co.gitcoin', url], { fetcher })
    const { transactions, daiAmount, estimatedAmount, title, image, address: donationAddress } = data?.ok
        ? data.val
        : ({} as GitcoinGrantMetadata)
    const grantTitle = title ?? 'A Gitcoin Grant'

    //#region the donate dialog
    const account = useAccount()
    const [open, setOpen] = useState(false)
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
    //#endregion

    return (
        <>
            <PreviewCard
                logo={image}
                title={grantTitle}
                line1={BigNumber.isBigNumber(estimatedAmount) ? `${estimatedAmount.toFixed(2)} USD` : ''}
                line2="ESTIMATED"
                line3={BigNumber.isBigNumber(daiAmount) ? `${formatBalance(daiAmount, 18)} DAI` : ''}
                line4={isNumber(transactions) ? `${transactions} transactions` : ''}
                address={donationAddress}
                originalURL={url}
                onRequestGrant={onRequest}
            />
            <DonateDialog
                address={donationAddress}
                title={grantTitle}
                open={!!(open && donationAddress?.length)}
                onClose={() => setOpen(false)}
            />
        </>
    )
}
