import {
    EthereumTokenType,
    formatAmount,
    formatBalance,
    FungibleTokenDetailed,
    pow10,
    useTokenBalance,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo, useState } from 'react'
import { DialogContent, DialogContentText, DialogActions, Typography, Grid, Divider } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import type { AmmOutcome, Market } from '../types'
import { MINIMUM_BALANCE, OUTCOME_PRICE_PRECISION, SHARE_DECIMALS } from '../constants'
import { useAmmExchange } from '../hooks/useAmmExchange'
import { useEstimateAddLiquidityPool } from '../hooks/useEstimateAddLiquidity'
import { significantOfAmount } from '../utils'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { Trans } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },
    root: {
        margin: theme.spacing(2, 0),
    },
    section: {
        margin: `${theme.spacing(1)} auto`,
    },
    spacing: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    predictions: {
        gridGap: '.5rem',
        marginBottom: theme.spacing(1),
        '& > .MuiGrid-item': {
            padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
            border: `solid .0625rem ${theme.palette.divider}`,
            borderRadius: '.5rem',
        },
    },
    inputBase: {
        height: 16,
    },
    input: {
        textAlign: 'right',
    },
    divider: {
        marginTop: `-${theme.spacing(1)}`,
        marginBottom: `-${theme.spacing(1)}`,
    },
    button: {
        margin: theme.spacing(1.5, 0),
        padding: 12,
    },
    footer: {
        marginTop: theme.spacing(1.5),
    },
}))

interface LiquidityDialogProps {
    open: boolean
    onClose: () => void
    market: Market
    token: FungibleTokenDetailed
    ammOutcomes: AmmOutcome[]
}

export function LiquidityDialog(props: LiquidityDialogProps) {
    const { open, market, token, ammOutcomes, onClose } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    const [inputAmount, setInputAmount] = useState('')
    const [significant, setSignificant] = useState(4)
    const amount = new BigNumber(formatAmount(inputAmount || '0', token?.decimals ?? 0))

    const { value: ammExchange, loading: loadingAmm, error: errorAmm, retry: retryAmm } = useAmmExchange(market)

    const chainInputAmount = formatAmount(inputAmount || '0', token.decimals)
    console.log(chainInputAmount)

    const {
        value: estimatedResult,
        loading: loadingEstimatedResult,
        error: errorEstimatedResult,
        retry: retryEstimatedResult,
    } = useEstimateAddLiquidityPool(market, ammExchange, chainInputAmount)
    console.log(estimatedResult, errorEstimatedResult)
    const formattedLpTokens = formatBalance(
        estimatedResult?.amount ?? '0',
        SHARE_DECIMALS,
        significantOfAmount(new BigNumber(estimatedResult?.amount ?? 0).dividedBy(pow10(SHARE_DECIMALS))),
    )
    //#region amount
    const {
        value: _tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: retryTokenBalance,
    } = useTokenBalance(token.type, token.address ?? '')
    // Reduce balance accuracy to $BALANCE_DECIMALS
    const tokenBalance = useMemo(() => {
        const formattedBalance = new BigNumber(formatBalance(_tokenBalance, token?.decimals ?? 0))
        if (formattedBalance.isLessThan(MINIMUM_BALANCE)) return '0'
        return _tokenBalance
    }, [_tokenBalance])
    //#endregion

    // calc the significant
    useEffect(() => {
        const formattedBalance = new BigNumber(formatBalance(tokenBalance, token?.decimals ?? 0))
        setSignificant(significantOfAmount(formattedBalance))
    }, [tokenBalance])
    //#endregion

    const onDialogClose = () => {
        setInputAmount('')
        onClose()
    }

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (errorEstimatedResult) return t('plugin_augur_smt_wrong')
        // if (!loadingAmm && !isTradeable) return t('plugin_trader_error_insufficient_lp')
        if (amount.isGreaterThan(tokenBalance))
            return t('plugin_dhedge_insufficient_balance', {
                symbol: token?.symbol,
            })
        return ''
    }, [amount.toFixed(), token, tokenBalance, ammExchange, estimatedResult])
    //#endregion
    console.log(significantOfAmount(new BigNumber(estimatedResult?.amount ?? '0')))
    console.log(ammOutcomes)
    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onDialogClose}
            title={t('plugin_augur_add_liquidity')}
            maxWidth="xs">
            <DialogContent>
                <>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label={t('wallet_transfer_amount')}
                            amount={inputAmount}
                            balance={tokenBalance ?? '0'}
                            token={token}
                            onAmountChange={setInputAmount}
                            significant={significant}
                        />
                    </form>
                    <div className={classes.section}>
                        <Typography variant="body1" color="textPrimary">
                            {t('plugin_augur_current_prices')}
                        </Typography>
                        <Grid container direction="column" className={`${classes.spacing} ${classes.predictions}`}>
                            <Grid item container justifyContent="space-between">
                                {ammOutcomes.map((v, i) => (
                                    <Grid item container key={v.id}>
                                        <Grid item flex={7}>
                                            <Typography variant="body2">{market.outcomes[v.id].name}</Typography>
                                        </Grid>
                                        <Divider orientation="vertical" flexItem classes={{ root: classes.divider }} />
                                        <Grid item flex={1}>
                                            <Typography variant="body2" className={classes.input}>
                                                {'$' + v.rate.toFixed(OUTCOME_PRICE_PRECISION)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        <Typography variant="body1" color="textPrimary">
                            {t('plugin_augur_you_receive')}
                        </Typography>
                        <Grid item container justifyContent="space-between">
                            {estimatedResult?.minAmounts
                                ?.filter((v) => !v.hide)
                                .map((v, i) => (
                                    <Grid item container key={v.outcomeId}>
                                        <Grid item flex={7}>
                                            <Typography variant="body2">{market.outcomes[v.outcomeId].name}</Typography>
                                        </Grid>
                                        <Divider orientation="vertical" flexItem classes={{ root: classes.divider }} />
                                        <Grid item flex={1}>
                                            <Typography variant="body2" className={classes.input}>
                                                {formatBalance(
                                                    v.amount,
                                                    SHARE_DECIMALS,
                                                    significantOfAmount(
                                                        new BigNumber(v.amount).dividedBy(pow10(SHARE_DECIMALS)),
                                                    ),
                                                )}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                ))}
                        </Grid>
                        <Grid container justifyContent="space-between">
                            <Grid item>
                                <Typography variant="body1" color="textPrimary">
                                    {t('plugin_augur_lp_tokens')}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" color="textPrimary  ">
                                    {estimatedResult?.amount ? formattedLpTokens : '-'}
                                </Typography>
                            </Grid>
                        </Grid>
                        <DialogActions>
                            <EthereumWalletConnectedBoundary>
                                <EthereumERC20TokenApprovedBoundary
                                    amount={amount.toFixed()}
                                    spender={ammExchange?.address}
                                    token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        disabled={!!validationMessage}
                                        onClick={errorEstimatedResult ? retryEstimatedResult : retryEstimatedResult}
                                        variant="contained"
                                        loading={loadingTokenBalance || loadingAmm || loadingEstimatedResult}>
                                        {validationMessage || t('buy')}
                                    </ActionButton>
                                </EthereumERC20TokenApprovedBoundary>
                            </EthereumWalletConnectedBoundary>
                        </DialogActions>
                        <Divider />
                        <DialogContentText classes={{ root: classes.footer }}>
                            <Trans i18nKey="plugin_augur_add_liquidity_footer" />
                        </DialogContentText>
                    </div>
                </>
            </DialogContent>
        </InjectedDialog>
    )
}
