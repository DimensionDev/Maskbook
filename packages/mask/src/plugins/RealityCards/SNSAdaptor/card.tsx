import {
    EthereumTokenType,
    formatAmount,
    formatBalance,
    TransactionStateType,
    useAccount,
} from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { WalletMessages } from '../../Wallet/messages'
import { RefreshIcon } from '@masknet/icons'
import { Button, DialogContent, Grid, Typography } from '@mui/material'
import { useUserDeposit } from '../hooks/useUserDeposit'
import type { Card, Event } from '../types'
import { useBaseToken } from '../hooks/useBaseToken'
import { useRentCallback } from '../hooks/useRentCallback'
import { MINIMUM_ACCEPTED_PRICE } from '../constants'

const useStyles = makeStyles()((theme) => ({
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },
    root: {
        margin: theme.spacing(2, 0),
    },
    button: {
        margin: theme.spacing(1.5, 0, 0),
        padding: 12,
    },
    label: {
        flex: 1,
        textAlign: 'left',
    },
    message: {
        textAlign: 'center',
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 'inherit',
    },
}))

interface CardDialogProps {
    open: boolean
    onClose: () => void
    market: Event
    card: Card
}

export function CardDialog(props: CardDialogProps) {
    const { open, onClose, card, market } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const [inputPrice, setInputPrice] = useState('')
    const [duration, setDuration] = useState('0')

    const onDialogClose = () => {
        setInputPrice('')
        onClose()
    }

    //#region context
    const account = useAccount()
    const token = useBaseToken()
    //#endregion

    //#region balance
    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: tokenBalanceRetry,
    } = useUserDeposit()

    useEffect(() => {
        tokenBalanceRetry()
    }, [open])
    //#endregion

    //#region price
    const price = new BigNumber(formatAmount(new BigNumber(inputPrice ?? 0), token.decimals))
    const pricePerMinute = useMemo(() => {
        return price.div(60)
    }, [price])
    const pricePerDay = useMemo(() => {
        return price.multipliedBy(24)
    }, [pricePerMinute])

    const minHourlyPrice = useMemo(() => {
        return new BigNumber(card.price)
            .multipliedBy(100 + parseFloat(market.minimumPriceIncreasePercent))
            .dividedBy(100)
            .dividedBy(24)
    }, [card.price, market.minimumPriceIncreasePercent])

    //#endregion

    //#region blocking
    const [rentState, rentCallback, resetRentCallback] = useRentCallback(market, pricePerDay.toString(), card, duration)
    //#endregion

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    tokenBalanceRetry()
                    if (rentState.type === TransactionStateType.HASH) onDialogClose()
                }
                if (rentState.type === TransactionStateType.HASH) setInputPrice('')
                resetRentCallback()
            },
            [rentState, tokenBalanceRetry, onDialogClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token) return
        if (rentState.type === TransactionStateType.UNKNOWN || rentState.type === TransactionStateType.FAILED) {
            return
        }

        setTransactionDialogOpen({
            open: true,
            state: rentState,
            summary: `Renting "${card.outcomeName}" for ${inputPrice} ${token.symbol}/hour.`,
        })
    }, [rentState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!price) return t('wallet_transfer_error_amount_absence')
        if (price.isLessThan(MINIMUM_ACCEPTED_PRICE))
            return t('plugin_realitycards_error_minimum_accepted_price', {
                amount: formatBalance(MINIMUM_ACCEPTED_PRICE, token.decimals),
                symbol: token.symbol,
            })
        if (pricePerMinute.isGreaterThan(tokenBalance))
            return t('plugin_realitycards_error_minimum_deposit', {
                amount: new BigNumber(formatBalance(pricePerMinute, token.decimals)).toFixed(0, BigNumber.ROUND_UP),
                symbol: token.symbol,
            })
        return ''
    }, [account, price, token, tokenBalance])
    //#endregion
    console.log('validationMessage', validationMessage)

    if (!token) return null
    return (
        <InjectedDialog className={classes.root} open={open} onClose={onDialogClose} title={market.name} maxWidth="xs">
            <DialogContent>
                <Typography color="textPrimary" variant="h5">
                    {card.outcomeName}
                </Typography>

                <Grid container direction="row" spacing={12}>
                    <Grid item xs={9}>
                        <Typography color="textPrimary" variant="subtitle2">
                            {t('plugin_realitycards_enter_hourly_rental_price')}
                        </Typography>
                        <Button onClick={() => setInputPrice(formatBalance(minHourlyPrice, token.decimals))}>
                            {t('plugin_realitycards_set_min_rental_price')}
                        </Button>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography color="textPrimary" variant="subtitle2">
                            {formatBalance(tokenBalance, token.decimals, 3)} {token.symbol}
                        </Typography>
                    </Grid>
                </Grid>
                {errorTokenBalance ? (
                    <Typography className={classes.message} color="textPrimary">
                        {t('plugin_dhedge_smt_wrong')}
                        <RefreshIcon className={classes.refresh} color="primary" onClick={tokenBalanceRetry} />
                    </Typography>
                ) : (
                    <>
                        <form className={classes.form} noValidate autoComplete="off">
                            <TokenAmountPanel
                                label="Amount"
                                amount={inputPrice}
                                disableBalance={true}
                                balance={tokenBalance ?? '0'}
                                token={token}
                                onAmountChange={setInputPrice}
                            />
                            {validationMessage ? (
                                <Typography color="textPrimary" variant="subtitle2">
                                    {validationMessage}
                                    <Button onClick={() => {}}>
                                        <Typography color="textPrimary" variant="subtitle2">
                                            {t('plugin_realitycards_deposit')}
                                        </Typography>
                                    </Button>
                                </Typography>
                            ) : null}
                        </form>

                        <EthereumWalletConnectedBoundary>
                            {/* <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    // onClick={openSwap}
                                    variant="contained"
                                    loading={loadingTokenBalance}>
                                    {t('plugin_pooltogether_deposit', { symbol: token.symbol })}
                                </ActionButton> */}
                            <EthereumERC20TokenApprovedBoundary
                                amount={price.toString()}
                                spender={market.id}
                                token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage}
                                    onClick={rentCallback}
                                    variant="contained"
                                    loading={loadingTokenBalance}>
                                    {validationMessage || price.isGreaterThanOrEqualTo(minHourlyPrice)
                                        ? t('plugin_realitycards_rent_card')
                                        : t('plugin_realitycards_place_bid')}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        </EthereumWalletConnectedBoundary>
                    </>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
