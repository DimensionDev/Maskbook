import {
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    pow10,
    TransactionStateType,
    useAccount,
    useChainId,
    useGitcoinConstants,
    useNativeTokenDetailed,
    useFungibleTokenBalance,
} from '@masknet/web3-shared-evm'
import { DialogContent, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { v4 as uuid } from 'uuid'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { useDonateCallback } from '../hooks/useDonateCallback'
import { PluginGitcoinMessages } from '../messages'

const useStyles = makeStyles()((theme) => ({
    paper: {
        width: '450px !important',
    },
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },
    root: {
        margin: theme.spacing(2, 0),
    },
    tip: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        padding: theme.spacing(2, 2, 0, 2),
    },
    button: {
        margin: theme.spacing(1.5, 0, 0),
        padding: 12,
    },
}))

export interface DonateDialogProps extends withClasses<never> {}

export function DonateDialog(props: DonateDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [title, setTitle] = useState('')
    const [address, setAddress] = useState('')

    // context
    const account = useAccount()
    const chainId = useChainId()
    const nativeTokenDetailed = useNativeTokenDetailed()
    const { BULK_CHECKOUT_ADDRESS } = useGitcoinConstants()

    //#region remote controlled dialog
    const { open, closeDialog: closeDonationDialog } = useRemoteControlledDialog(
        PluginGitcoinMessages.donationDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setTitle(ev.title)
            setAddress(ev.address)
        },
    )
    //#endregion

    //#region the selected token
    const [token = nativeTokenDetailed.value, setToken] = useState<FungibleTokenDetailed | undefined>(
        nativeTokenDetailed.value,
    )
    const tokenBalance = useFungibleTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    //#endregion

    //#region select token dialog
    const [id] = useState(uuid())
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setToken(ev.token)
            },
            [id],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        setSelectTokenDialog({
            open: true,
            uuid: id,
            disableNativeToken: false,
            FixedTokenListProps: {
                selectedTokens: token ? [token.address] : [],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(token?.decimals ?? 0))
    //#endregion

    //#region blocking
    const [donateState, donateCallback, resetDonateCallback] = useDonateCallback(address ?? '', amount.toFixed(), token)
    //#endregion

    //#region transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            token
                ? [
                      `I just donated ${title} with ${formatBalance(amount, token.decimals)} ${cashTag}${
                          token.symbol
                      }. ${
                          isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                              ? `Follow @${
                                    isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')
                                } (mask.io) to donate Gitcoin grants.`
                              : ''
                      }`,
                      '#mask_io',
                  ].join('\n')
                : '',
        )
        .toString()

    // close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (donateState.type === TransactionStateType.HASH) setRawAmount('')
            resetDonateCallback()
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token) return
        if (donateState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            shareLink,
            state: donateState,
            summary: `Donating ${formatBalance(amount, token.decimals)} ${token.symbol} for ${title}.`,
        })
    }, [donateState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!token) return t('plugin_gitcoin_select_a_token')
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!address) return t('plugin_gitcoin_grant_not_available')
        if (!amount || amount.isZero()) return t('plugin_gitcoin_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance.value ?? '0'))
            return t('plugin_gitcoin_insufficient_balance', {
                symbol: token.symbol,
            })
        return ''
    }, [account, address, amount.toFixed(), chainId, token, tokenBalance.value ?? '0'])
    //#endregion

    if (!token || !address) return null

    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={closeDonationDialog} title={title} maxWidth="xs">
                <DialogContent>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Amount"
                            amount={rawAmount}
                            balance={tokenBalance.value ?? '0'}
                            token={token}
                            onAmountChange={setRawAmount}
                            SelectTokenChip={{
                                loading: tokenBalance.loading,
                                ChipProps: {
                                    onClick: onSelectTokenChipClick,
                                },
                            }}
                        />
                    </form>
                    <Typography className={classes.tip} variant="body1">
                        <Trans
                            i18nKey="plugin_gitcoin_readme"
                            components={{
                                fund: (
                                    <Link
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={t('plugin_gitcoin_readme_fund_link')}
                                    />
                                ),
                            }}
                        />
                    </Typography>
                    <EthereumWalletConnectedBoundary>
                        <EthereumERC20TokenApprovedBoundary
                            amount={amount.toFixed()}
                            spender={BULK_CHECKOUT_ADDRESS}
                            token={token.type === EthereumTokenType.ERC20 ? token : undefined}>
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                size="large"
                                disabled={!!validationMessage}
                                onClick={donateCallback}
                                variant="contained">
                                {validationMessage || t('plugin_gitcoin_donate')}
                            </ActionButton>
                        </EthereumERC20TokenApprovedBoundary>
                    </EthereumWalletConnectedBoundary>
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
