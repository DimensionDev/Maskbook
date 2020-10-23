import React, { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { noop } from 'lodash-es'
import { makeStyles, Theme, createStyles, Typography, Grid } from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import type { Trade } from '@uniswap/sdk'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import BigNumber from 'bignumber.js'
import type { Token } from '../../../../web3/types'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { MaskbookWalletMessages, WalletMessageCenter } from '../../../Wallet/messages'
import { useTokenBalance } from '../../../../web3/hooks/useTokenBalance'
import { ApproveState } from '../../../../web3/hooks/useTokenApproveCallback'
import { useChainId } from '../../../../web3/hooks/useChainState'
import { TradeStrategy, TokenPanelType } from '../../types'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        form: {
            width: 350,
            margin: `${theme.spacing(2)}px auto`,
        },
        section: {
            textAlign: 'center',
            margin: `${theme.spacing(1)}px auto`,
        },
        account: {
            textAlign: 'right',
            margin: theme.spacing(0, 0, 2),
        },
        divider: {
            marginTop: theme.spacing(-0.5),
            marginBottom: theme.spacing(-1),
        },
        reverseIcon: {
            cursor: 'pointer',
        },
        button: {
            marginTop: theme.spacing(2),
            paddingTop: 12,
            paddingBottom: 12,
        },
        ethereumChainChip: {
            borderRadius: 8,
            marginRight: theme.spacing(1),
        },
        ethereumAccountChip: {
            borderRadius: 12,
        },
    })
})

export interface TradeFormProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    approveState: ApproveState
    strategy: TradeStrategy
    trade: Trade | null
    inputToken?: Token
    outputToken?: Token
    inputAmount: string
    outputAmount: string
    onInputAmountChange: (amount: string) => void
    onOutputAmountChange: (amount: string) => void
    onReverseClick?: () => void
    onTokenChipClick?: (token: TokenPanelType) => void
    onApprove: () => void
    onSwap: () => void
}

export function TradeForm(props: TradeFormProps) {
    const {
        approveState,
        strategy,
        trade,
        inputToken,
        outputToken,
        inputAmount,
        outputAmount,
        onInputAmountChange,
        onOutputAmountChange,
        onReverseClick = noop,
        onTokenChipClick = noop,
        onApprove,
        onSwap,
    } = props
    const classes = useStylesExtends(useStyles(), props)

    //#region UI
    const account = useAccount()
    const chainId = useChainId()
    //#endregion

    //#region loading balance
    const { value: inputTokenBalance, loading: loadingInputToken } = useTokenBalance(inputToken)
    const { value: outputTokenBalance, loading: loadingOutputToken } = useTokenBalance(outputToken)
    const inputTokenTradeAmount = new BigNumber(inputAmount)
    const outputTokenTradeAmount = new BigNumber(outputAmount)
    const inputTokenBalanceAmount = new BigNumber(inputTokenBalance ?? '0')
    const outputTokenBalanceAmount = new BigNumber(outputTokenBalance ?? '0')
    //#endregion

    //#region remote controlled select provider dialog
    const [, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectProviderDialogUpdated'>(
        WalletMessageCenter,
        'selectProviderDialogUpdated',
    )
    const onConnect = useCallback(() => {
        setOpen({
            open: true,
        })
    }, [setOpen])
    //#endregion

    //#region form controls
    const isExactIn = strategy === TradeStrategy.ExactIn
    const inputPanelLabel = 'From' + (!isExactIn && inputTokenTradeAmount.isGreaterThan(0) ? ' (estimated)' : '')
    const outputPanelLabel = 'To' + (isExactIn && outputTokenTradeAmount.isGreaterThan(0) ? ' (estimated)' : '')
    const sections = [
        {
            key: 'input',
            children: (
                <TokenAmountPanel
                    label={inputPanelLabel}
                    amount={inputAmount}
                    balance={inputTokenBalanceAmount.toFixed()}
                    token={inputToken}
                    onAmountChange={onInputAmountChange}
                    TextFieldProps={{
                        disabled: !inputToken,
                    }}
                    SelectTokenChip={{
                        loading: loadingInputToken,
                        ChipProps: {
                            onClick: () => onTokenChipClick(TokenPanelType.Input),
                        },
                    }}
                />
            ),
        },
        {
            key: 'divider',
            children: (
                <Typography color="primary">
                    <ArrowDownwardIcon className={classes.reverseIcon} onClick={onReverseClick} />
                </Typography>
            ),
        },
        {
            key: 'output',
            children: (
                <TokenAmountPanel
                    label={outputPanelLabel}
                    amount={outputAmount}
                    balance={outputTokenBalanceAmount.toFixed()}
                    token={outputToken}
                    onAmountChange={onOutputAmountChange}
                    MaxChipProps={{ style: { display: 'none' } }}
                    TextFieldProps={{
                        disabled: !outputToken,
                    }}
                    SelectTokenChip={{
                        loading: loadingOutputToken,
                        ChipProps: {
                            onClick: () => onTokenChipClick(TokenPanelType.Output),
                        },
                    }}
                />
            ),
        },
    ] as {
        key: 'input' | 'output' | 'divider'
        children?: React.ReactNode
    }[]
    //#endregion

    //#region UI logic
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING

    // validate form return a message if an error exists
    const validationMessage = useMemo(() => {
        if (inputTokenTradeAmount.isZero() && outputTokenTradeAmount.isZero()) return 'Enter an amount'
        if (!inputToken || !outputToken) return 'Select a token'
        if (inputTokenBalanceAmount.isLessThan(inputTokenTradeAmount))
            return `Insufficient ${inputToken?.symbol} balance`
        if (!trade) return 'Insufficient liquidity for this trade.'
        return ''
    }, [isExactIn, inputToken, outputToken, inputTokenTradeAmount, outputTokenTradeAmount])
    //#endregion

    return (
        <form className={classes.form} noValidate autoComplete="off">
            {sections.map(({ key, children }) => (
                <div className={classNames(classes.section, key === 'divider' ? classes.divider : '')} key={key}>
                    {children}
                </div>
            ))}
            <div className={classes.section}>
                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                    {approveRequired ? (
                        <Grid item xs={6}>
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={approveState === ApproveState.PENDING}
                                onClick={onApprove}>
                                {approveState === ApproveState.NOT_APPROVED
                                    ? `Approve ${trade?.inputAmount.currency.symbol}`
                                    : ''}
                                {approveState === ApproveState.PENDING
                                    ? `Approve... ${trade?.inputAmount.currency.symbol}`
                                    : ''}
                            </ActionButton>
                        </Grid>
                    ) : null}
                    <Grid item xs={approveRequired ? 6 : 12}>
                        {account ? (
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={!!validationMessage || approveRequired}
                                onClick={onSwap}>
                                {validationMessage || 'Swap'}
                            </ActionButton>
                        ) : (
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={onConnect}>
                                Connect a Wallet
                            </ActionButton>
                        )}
                    </Grid>
                </Grid>
            </div>
        </form>
    )
}
