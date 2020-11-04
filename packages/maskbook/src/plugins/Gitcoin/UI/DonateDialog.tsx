import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { makeStyles, createStyles, Theme, Typography, DialogContent, Link } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { Trans } from 'react-i18next'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import type { EthereumTokenType, Token } from '../../../web3/types'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { createEetherToken } from '../../../web3/helpers'
import { useChainId } from '../../../web3/hooks/useChainState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useDonateCallback } from '../hooks/useDonateCallback'
import { useERC20TokenApproveCallback, ApproveState } from '../../../web3/hooks/useERC20TokenApproveCallback'
import { GITCOIN_CONSTANT } from '../constants'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { formatBalance } from '../../Wallet/formatter'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import type { ERC20TokenRecord } from '../../Wallet/database/types'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletMessageCenter } from '../../Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useShareLink } from '../../../utils/hooks/useShareLink'
import { usePostLink } from '../../../components/DataSource/usePostInfo'

const useStyles = makeStyles((theme: Theme) =>
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

export interface DonatePayload {
    amount: number
    address: string
    token: ERC20TokenRecord
    tokenType: EthereumTokenType
}

interface DonateDialogUIProps extends withClasses<never> {
    title: string
    address?: string
    open: boolean
    onClose?: () => void
}

function DonateDialogUI(props: DonateDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const { title, address } = props

    // context
    const account = useAccount()
    const chainId = useChainId()

    //#region select token
    const [token, setToken] = useState<Token>(createEetherToken(chainId))
    const [openSelectERC20TokenDialog, setOpenSelectERC20TokenDialog] = useState(false)
    const onTokenChipClick = useCallback(() => {
        setOpenSelectERC20TokenDialog(true)
    }, [])
    const onSelectERC20TokenDialogClose = useCallback(() => {
        setOpenSelectERC20TokenDialog(false)
    }, [])
    const onSelectERC20TokenDialogSubmit = useCallback(
        (token: Token) => {
            setToken(token)
            onSelectERC20TokenDialogClose()
        },
        [onSelectERC20TokenDialogClose],
    )
    //#endregion

    //#region amount
    const [amount, setAmount] = useState('0')
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(token)
    //#endregion

    //#region approve ERC20
    const BulkCheckoutAddress = useConstant(GITCOIN_CONSTANT, 'BULK_CHECKOUT_ADDRESS')
    const [approveState, approveCallback] = useERC20TokenApproveCallback(token, amount, BulkCheckoutAddress)
    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveCallback, approveState])
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    //#endregion

    //#region blocking
    const [donateState, donateCallback, resetDonateCallback] = useDonateCallback(address ?? '', amount, token)
    //#endregion

    //#region remote controlled transaction dialog
    const postLink = usePostLink()
    const shareLink = useShareLink(
        [
            `I just donated ${title} with ${formatBalance(new BigNumber(amount), token.decimals, token.decimals)} ${
                token.symbol
            }. Follow @realMaskbook (mask.io) to donate Gitcoin grants.`,
            '#mask_io',
            postLink,
        ].join('\n'),
    )

    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessageCenter,
        'transactionDialogUpdated',
        (ev) => {
            if (ev.open) return
            setAmount('0')
            resetDonateCallback()
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (donateState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state: donateState,
            summary: `Donating ${formatBalance(new BigNumber(amount), token.decimals, token.decimals)} ${
                token.symbol
            } for ${title}`,
        })
    }, [donateState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!address) return 'Grant not available'
        if (!account) return t('connect_a_wallet')
        if (!token.address) return 'Select a token'
        if (new BigNumber(amount).isZero()) return 'Enter an amount'
        if (new BigNumber(amount).isGreaterThan(new BigNumber(tokenBalance)))
            return `Insufficient ${token.symbol} balance`
        return ''
    }, [address, account, amount, token, tokenBalance])
    //#endregion

    if (!props.address) return null
    return (
        <div className={classes.root}>
            <InjectedDialog open={props.open} onExit={props.onClose} title={title}>
                <DialogContent>
                    <EthereumStatusBar classes={{ root: classes.root }} />
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Amount"
                            amount={amount}
                            balance={tokenBalance ?? '0'}
                            token={token}
                            onAmountChange={setAmount}
                            SelectTokenChip={{
                                loading: loadingTokenBalance,
                                ChipProps: {
                                    onClick: onTokenChipClick,
                                },
                            }}
                        />
                    </form>
                    <Typography className={classes.tip} variant="body1">
                        <Trans
                            i18nKey="plugin_gitcoin_readme"
                            components={{
                                fund: <Link target="_blank" href={t('plugin_gitcoin_readme_fund_link')} />,
                            }}
                        />
                    </Typography>

                    {approveRequired ? (
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={approveState === ApproveState.PENDING}
                            onClick={onApprove}>
                            {approveState === ApproveState.NOT_APPROVED ? `Approve ${token.symbol}` : ''}
                            {approveState === ApproveState.PENDING ? `Approve... ${token.symbol}` : ''}
                        </ActionButton>
                    ) : (
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={Boolean(validationMessage)}
                            onClick={donateCallback}>
                            {validationMessage || 'Donate'}
                        </ActionButton>
                    )}
                </DialogContent>
            </InjectedDialog>
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                excludeTokens={[token.address]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </div>
    )
}

export interface DonateDialogProps extends DonateDialogUIProps {}

export function DonateDialog(props: DonateDialogProps) {
    return <DonateDialogUI {...props} />
}
