import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { unreachable } from '@masknet/kit'
import type {
    FormattedTransactionSnackbarFailedDescription,
    FormattedTransactionSnackbarSuccessDescription,
    FormattedTransactionDescription,
    FormattedTransactionTitle,
    FormattedTransactionSnackbarSuccessTitle,
} from '@masknet/web3-shared-base'
import { useCallback } from 'react'

const map: Record<
    (
        | FormattedTransactionTitle
        | FormattedTransactionDescription
        | FormattedTransactionSnackbarSuccessTitle
        | FormattedTransactionSnackbarFailedDescription
        | FormattedTransactionSnackbarSuccessDescription
    ) &
        string,
    MessageDescriptor
> = {
    '': null!,
    'Claim Lucky Drop successfully.': msg`Claim Lucky Drop successfully.`,
    'Claim NFT Lucky Drop successfully.': msg`Claim NFT Lucky Drop successfully.`,
    'Claim your Lucky Drop.': msg`Claim your Lucky Drop.`,
    'Claim your NFT Lucky Drop': msg`Claim your NFT Lucky Drop`,
    'Create NFT Lucky Drop successfully.': msg`Create NFT Lucky Drop successfully.`,
    'Create your Lucky Drop.': msg`Create your Lucky Drop.`,
    'Create your NFT Lucky Drop.': msg`Create your NFT Lucky Drop.`,
    'Created a SmartPay wallet on Polygon network.': msg`Created a SmartPay wallet on Polygon network.`,
    'Deploy a SmartPay wallet on Polygon network.': msg`Deploy a SmartPay wallet on Polygon network.`,
    'Failed to claim Lucky Drop.': msg`Failed to claim Lucky Drop.`,
    'Failed to create Lucky Drop.': msg`Failed to create Lucky Drop.`,
    'Failed to deposit token.': msg`Failed to deposit token.`,
    'Failed to purchase Maskbox NFT.': msg`Failed to purchase Maskbox NFT.`,
    'Failed to refund Lucky Drop.': msg`Failed to refund Lucky Drop.`,
    'Failed to revoke token contract.': msg`Failed to revoke token contract.`,
    'Failed to send token.': msg`Failed to send token.`,
    'Failed to transfer NFT.': msg`Failed to transfer NFT.`,
    'Failed to unlock NFT contract.': msg`Failed to unlock NFT contract.`,
    'Failed to unlock token contract.': msg`Failed to unlock token contract.`,
    'Owner changed successfully.': msg`Owner changed successfully.`,
    'Purchase Maskbox NFT.': msg`Purchase Maskbox NFT.`,
    'Purchase Maskbox NFT successfully.': msg`Purchase Maskbox NFT successfully.`,
    'Refund Lucky Drop successfully.': msg`Refund Lucky Drop successfully.`,
    'Refund your expired Lucky Drop.': msg`Refund your expired Lucky Drop.`,
    'Revoke the approval for token': msg`Revoke the approval for token`,
    'Revoke the approval successfully.': msg`Revoke the approval successfully.`,
    'Transaction failed': msg`Transaction failed`,
    'Transaction submitted.': msg`Transaction submitted.`,
    'Transaction was Rejected!': msg`Transaction was Rejected!`,
    'Unlock token': msg`Unlock token`,
    'Unlock token successfully': msg`Unlock token successfully`,

    'Cancel Transaction': msg`Cancel Transaction`,
    'Change Owner': msg`Change Owner`,
    'Claim Lucky Drop': msg`Claim Lucky Drop`,
    'Claim NFT Lucky Drop': msg`Claim NFT Lucky Drop`,
    'Claim your Airdrop': msg`Claim your Airdrop`,
    'Contract Deployment': msg`Contract Deployment`,
    'Contract Interaction': msg`Contract Interaction`,
    'Create Lucky Drop': msg`Create Lucky Drop`,
    'Create NFT Lucky Drop': msg`Create NFT Lucky Drop`,
    'Create Smart Pay wallet': msg`Create Smart Pay wallet`,
    'Deploy Smarty Pay wallet': msg`Deploy Smarty Pay wallet`,
    'Deposit token': msg`Deposit token`,
    'Follow User': msg`Follow User`,
    'Purchase Maskbox NFT': msg`Purchase Maskbox NFT`,
    'Refund Lucky drop': msg`Refund Lucky drop`,
    'Revoke Token': msg`Revoke Token`,
    'Transfer NFT': msg`Transfer NFT`,
    'Transfer Token': msg`Transfer Token`,
    'Unlock NFT Contract': msg`Unlock NFT Contract`,
    'Unlock Token': msg`Unlock Token`,
    'Withdraw token': msg`Withdraw token`,
    Donate: msg`Donate`,
}
export function useFormatMessage() {
    const { _ } = useLingui()
    return useCallback(
        (
            message:
                | FormattedTransactionTitle
                | FormattedTransactionDescription
                | FormattedTransactionSnackbarSuccessTitle
                | FormattedTransactionSnackbarFailedDescription
                | FormattedTransactionSnackbarSuccessDescription
                | undefined,
        ) => {
            if (!message) return message
            if (typeof message === 'string') return _(map[message])
            switch (message.key) {
                case 'Failed to deposit {symbol}.':
                    return _(msg`Failed to deposit ${message.symbol}.`)
                case 'Failed to withdraw {symbol}.':
                    return _(msg`Failed to withdraw ${message.symbol}.`)
                case 'Failed to {action} NFT contract.':
                    return _(msg`Failed to ${message.action} NFT contract.`)
                case '{token} were successfully claimed':
                    return _(msg`${message.token} were successfully claimed`)
                case 'Claim 1 {symbol} NFT Lucky Drop successfully.':
                    return _(msg`Claim 1 ${message.symbol} NFT Lucky Drop successfully.`)
                case 'Claim Lucky Drop with {token} successfully.':
                    return _(msg`Claim Lucky Drop with ${message.token} successfully.`)
                case 'Create Lucky drop with {token} successfully.':
                    return _(msg`Create Lucky drop with ${message.token} successfully.`)
                case 'Create {symbol} NFT Lucky Drop successfully.':
                    return _(msg`Create ${message.symbol} NFT Lucky Drop successfully.`)
                case 'Deposit {token} successfully.':
                    return _(msg`Deposit ${message.token} successfully.`)
                case 'Purchase Maskbox NFT with {token} successfully.':
                    return _(msg`Purchase Maskbox NFT with ${message.token} successfully.`)
                case 'Refund Lucky Drop with {token} successfully.':
                    return _(msg`Refund Lucky Drop with ${message.token} successfully.`)
                case 'Send {token} successfully.':
                    return _(msg`Send ${message.token} successfully.`)
                case 'Transfer {symbol} NFT successfully.':
                    return _(msg`Transfer ${message.symbol} NFT successfully.`)
                case 'Unlock {symbol} NFT contract successfully.':
                    return _(msg`Unlock ${message.symbol} NFT contract successfully.`)
                case 'Unlock {symbol} successfully':
                    return _(msg`Unlock ${message.symbol} successfully`)
                case 'Withdraw {token} successfully.':
                    return _(msg`Withdraw ${message.token} successfully.`)
                case "You didn't approve {symbol} successfully. Please do not set spending cap as 0 and try it again.":
                    return _(
                        msg`You didn't approve ${message.symbol} successfully. Please do not set spending cap as 0 and try it again.`,
                    )
                case 'You have donated {amount} {symbol}':
                    return _(msg`You have donated ${message.amount} ${message.symbol}`)
                case "You've approved {token} for {spender}. If you want to revoke that token, please keep custom spending cap amount as 0 and try it again.":
                    return _(
                        msg`You've approved ${message.token} for ${message.spender}. If you want to revoke that token, please keep custom spending cap amount as 0 and try it again.`,
                    )
                case '{action} {symbol} NFT contract successfully.':
                    return _(msg`${message.action} ${message.symbol} NFT contract successfully.`)
                case '{action} {symbol} approval successfully.':
                    return _(msg`${message.action} ${message.symbol} approval successfully.`)
                case 'Contract Deployment {token}':
                    return _(msg`Contract Deployment ${message.token}`)
                case 'Deposit {token} for savings.':
                    return _(msg`Deposit ${message.token} for savings.`)
                case 'Revoke the approval for {symbol}.':
                    return _(msg`Revoke the approval for ${message.symbol}.`)
                case 'Send {token}':
                    return _(msg`Send ${message.token}`)
                case 'Transfer {symbol} NFT.':
                    return _(msg`Transfer ${message.symbol} NFT.`)
                case 'Unlock {symbol} NFT contract.':
                    return _(msg`Unlock ${message.symbol} NFT contract.`)
                case 'Unlock {symbol}.':
                    return _(msg`Unlock ${message.symbol}.`)
                case 'Withdraw {token} for savings.':
                    return _(msg`Withdraw ${message.token} for savings.`)
                case '{action} {symbol} NFT contract.':
                    return _(msg`${message.action} ${message.symbol} NFT contract.`)
                case '{data}':
                    return message.data
                case '{action} NFT contract':
                    return _(msg`${message.action} NFT contract`)
                default:
                    unreachable(message)
            }
        },
        [_],
    )
}
