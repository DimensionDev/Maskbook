import { useState, useCallback, useMemo, useEffect } from 'react'
import { makeStyles, createStyles, Typography, DialogContent, Link, Grid } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { Trans } from 'react-i18next'
import { v4 as uuid } from 'uuid'

import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { ChainId, EthereumTokenType, EtherTokenDetailed, ERC20TokenDetailed } from '../../../web3/types'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useDonateCallback } from '../hooks/useDonateCallback'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import { GITCOIN_CONSTANT } from '../constants'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { formatBalance } from '../../Wallet/formatter'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useShareLink } from '../../../utils/hooks/useShareLink'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { Flags } from '../../../utils/flags'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { getActivatedUI } from '../../../social-network/ui'
import { PluginGitcoinMessages } from '../messages'
import { EthereumMessages } from '../../Ethereum/messages'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'

const useStyles = makeStyles((theme) =>
    createStyles({
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
            margin: theme.spacing(2, 0),
            padding: 12,
        },
    }),
)

export interface DonateDialogProps extends withClasses<never> {}

export function DonateDialog(props: DonateDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [title, setTitle] = useState('')
    const [address, setAddress] = useState('')

    // context
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    //#region remote controlled dialog
    const [open, setDonationDialogOpen] = useRemoteControlledDialog(
        PluginGitcoinMessages.events.donationDialogUpdated,
        (ev) => {
            if (ev.open) {
                setTitle(ev.title)
                setAddress(ev.address)
            }
        },
    )
    const onClose = useCallback(() => {
        setDonationDialogOpen({
            open: false,
        })
    }, [setDonationDialogOpen])
    //#endregion

    //#region select token
    const { value: etherTokenDetailed } = useEtherTokenDetailed()
    const [token = etherTokenDetailed, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>()
    const [id] = useState(uuid())
    const [, setSelectTokenDialogOpen] = useRemoteControlledDialog(
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
        setSelectTokenDialogOpen({
            open: true,
            uuid: id,
            disableEther: false,
            FixedTokenListProps: {
                selectedTokens: token ? [token.address] : [],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(new BigNumber(10).pow(token?.decimals ?? 0))
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )
    //#endregion

    //#region connect wallet
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    //#region approve
    const BULK_CHECKOUT_ADDRESS = useConstant(GITCOIN_CONSTANT, 'BULK_CHECKOUT_ADDRESS')
    const [approveState, , approveCallback] = useERC20TokenApproveCallback(
        token?.type === EthereumTokenType.ERC20 ? token.address : '',
        amount.toFixed(),
        BULK_CHECKOUT_ADDRESS,
    )

    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState, approveCallback])
    const onExactApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback(true)
    }, [approveState, approveCallback])
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    //#endregion

    //#region blocking
    const [donateState, donateCallback, resetDonateCallback] = useDonateCallback(address ?? '', amount.toFixed(), token)
    //#endregion

    //#region transaction dialog
    const cashTag = getActivatedUI()?.networkIdentifier === 'twitter.com' ? '$' : ''
    const postLink = usePostLink()
    const shareLink = useShareLink(
        token
            ? [
                  `I just donated ${title} with ${formatBalance(
                      amount,
                      token.decimals ?? 0,
                      token.decimals ?? 0,
                  )} ${cashTag}${token.symbol}. Follow @realMaskbook (mask.io) to donate Gitcoin grants.`,
                  '#mask_io',
                  postLink,
              ].join('\n')
            : '',
    )

    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
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
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state: donateState,
            summary: `Donating ${formatBalance(amount, token.decimals ?? 0, token.decimals ?? 0)} ${
                token.symbol
            } for ${title}.`,
        })
    }, [donateState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!token) return t('plugin_gitcoin_select_a_token')
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!address) return t('plugin_gitcoin_grant_not_available')
        if (Flags.wallet_network_strict_mode_enabled && chainId !== ChainId.Mainnet)
            return t('plugin_wallet_wrong_network')
        if (!amount || amount.isZero()) return t('plugin_gitcoin_enter_an_amount')
        if (amount.isGreaterThan(new BigNumber(tokenBalance)))
            return t('plugin_gitcoin_insufficient_balance', {
                symbol: token.symbol,
            })
        return ''
    }, [account, address, amount.toFixed(), chainId, token, tokenBalance])
    //#endregion

    if (!token || !address) return null

    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={onClose} title={title} DialogProps={{ maxWidth: 'xs' }}>
                <DialogContent>
                    <EthereumStatusBar classes={{ root: classes.root }} />
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Amount"
                            amount={rawAmount}
                            balance={tokenBalance ?? '0'}
                            token={token}
                            onAmountChange={setRawAmount}
                            SelectTokenChip={{
                                loading: loadingTokenBalance,
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

                    <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                        {approveRequired ? (
                            approveState === ApproveState.PENDING ? (
                                <Grid item xs={12}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={approveState === ApproveState.PENDING}>
                                        {`Unlocking ${token.symbol ?? 'Token'}…`}
                                    </ActionButton>
                                </Grid>
                            ) : (
                                <>
                                    <Grid item xs={6}>
                                        <ActionButton
                                            className={classes.button}
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={onExactApprove}>
                                            {approveState === ApproveState.NOT_APPROVED
                                                ? t('plugin_wallet_token_unlock', {
                                                      balance: formatBalance(amount, token.decimals ?? 0, 2),
                                                      symbol: token.symbol ?? 'Token',
                                                  })
                                                : ''}
                                        </ActionButton>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ActionButton
                                            className={classes.button}
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={onApprove}>
                                            {approveState === ApproveState.NOT_APPROVED
                                                ? t('plugin_wallet_token_infinite_unlock')
                                                : ''}
                                        </ActionButton>
                                    </Grid>
                                </>
                            )
                        ) : (
                            <Grid item xs={12}>
                                {!account ? (
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={onConnect}>
                                        {t('plugin_wallet_connect_a_wallet')}
                                    </ActionButton>
                                ) : !chainIdValid ? (
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        disabled
                                        variant="contained"
                                        size="large">
                                        {t('plugin_wallet_invalid_network')}
                                    </ActionButton>
                                ) : validationMessage ? (
                                    <ActionButton className={classes.button} fullWidth variant="contained" disabled>
                                        {validationMessage}
                                    </ActionButton>
                                ) : (
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        onClick={donateCallback}
                                        variant="contained">
                                        {t('plugin_gitcoin_donate')}
                                    </ActionButton>
                                )}
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
