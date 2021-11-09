import {
    EthereumTokenType,
    formatAmount,
    formatBalance,
    isSameAddress,
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
import { WalletMessages } from '../../Wallet/messages'
import { RefreshIcon } from '@masknet/icons'
import {
    Button,
    Checkbox,
    DialogContent,
    FormControl,
    FormControlLabel,
    Grid,
    InputAdornment,
    OutlinedInput,
    Typography,
} from '@mui/material'
import { useUserDeposit } from '../hooks/useUserDeposit'
import type { Card, Market } from '../types'
import { useBaseToken } from '../hooks/useBaseToken'
import { useRentCallback } from '../hooks/useRentCallback'
import { useExitCallback } from '../hooks/useExitCallback'
import { MINIMUM_ACCEPTED_PRICE } from '../constants'
import { DepositDialog } from './depositDialog'
import { PricePanel } from './pricePanel'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'

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

interface InputBoxProps {
    label: string
    value: string
    onChange: (value: string) => void
}

function InputBox(props: InputBoxProps) {
    const { label, value, onChange } = props

    return (
        <FormControl sx={{ m: 0.5 }} variant="outlined">
            <OutlinedInput
                id="outlined-adornment-weight"
                type=""
                value={value}
                onChange={(e) => {
                    e.target.value.match(/^\d*$/) ? onChange(e.target.value) : null
                }}
                endAdornment={<InputAdornment position="end">{label}</InputAdornment>}
                aria-describedby="outlined-weight-helper-text"
                placeholder="0"
                inputProps={{
                    'aria-label': 'weight',
                    autoComplete: 'off',
                    autoCorrect: 'off',
                    inputMode: 'decimal',
                    spellCheck: false,
                }}
            />
        </FormControl>
    )
}

interface CardDialogProps {
    open: boolean
    onClose: () => void
    market: Market
    card: Card
}

export function CardDialog(props: CardDialogProps) {
    const { open, onClose, card, market } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    //#region context
    const account = useAccount()
    const token = useBaseToken()

    const [depositDialogOpen, setDepositDialogOpen] = useState(false)
    const [inputPrice, setInputPrice] = useState('')
    const [duration, setDuration] = useState(0)
    const [limitedOwnership, setLimitedOwnership] = useState(false)
    const [minutes, setMinutes] = useState('')
    const [hours, setHours] = useState('')
    const [days, setDays] = useState('')

    const isOwner = useMemo(() => {
        return isSameAddress(card.originalNft.owner.id, account)
    }, [card.originalNft.owner.id, account])
    //#endregion

    useEffect(() => {
        setDuration(
            limitedOwnership
                ? Number.parseInt(minutes || '0', 10) * 60 +
                      Number.parseInt(hours || '0', 10) * 60 * 60 +
                      Number.parseInt(days || '0', 10) * 60 * 60 * 24
                : 0,
        )
    }, [days, hours, minutes, limitedOwnership])

    const onDialogClose = () => {
        setInputPrice('')
        onClose()
    }

    //#region balance
    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: tokenBalanceRetry,
    } = useUserDeposit()
    //#endregion

    //#region priceHourly
    const priceHourly = new BigNumber(formatAmount(new BigNumber(inputPrice ?? 0), token.decimals))
    const pricePerMinute = useMemo(() => {
        return priceHourly.div(60)
    }, [priceHourly])

    const pricePerDay = useMemo(() => {
        return priceHourly.multipliedBy(24)
    }, [priceHourly])

    const minHourlyPrice = useMemo(() => {
        return new BigNumber(card.price)
            .multipliedBy(100 + parseFloat(market.minimumPriceIncreasePercent))
            .dividedBy(100)
            .dividedBy(24)
    }, [card.price, market.minimumPriceIncreasePercent])

    const maxOwnershipSeconds = useMemo(() => {
        return new BigNumber(tokenBalance).dividedBy(priceHourly).multipliedBy(60 * 60)
    }, [tokenBalance, priceHourly])

    const maxRentalAmount = useMemo(() => {
        if (limitedOwnership) {
            return BigNumber.min(pricePerMinute.dividedBy(60).multipliedBy(duration), tokenBalance).toFixed(0)
        } else {
            return tokenBalance
        }
    }, [limitedOwnership, tokenBalance, pricePerMinute, duration])

    const minRentalDurationSecond = useMemo(() => {
        return new BigNumber(market.minRentalDayDivisor).dividedBy(24)
    }, [market.minRentalDayDivisor])
    //#endregion

    //#region blocking
    const [rentState, rentCallback, resetRentCallback] = useRentCallback(market, pricePerDay.toString(), card, duration)
    const [exitState, exitCallback, resetExitCallback] = useExitCallback(market, card)
    //#endregion

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    tokenBalanceRetry()
                    if (rentState.type === TransactionStateType.HASH || exitState.type === TransactionStateType.HASH)
                        onDialogClose()
                }
                if (rentState.type === TransactionStateType.HASH) setInputPrice('')
                if (exitState.type === TransactionStateType.HASH) onDialogClose()

                resetRentCallback()
                resetExitCallback()
            },
            [rentState, onDialogClose, exitState],
        ),
    )

    // open the transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            token
                ? [
                      t('plugin_realitycards_share_message', {
                          outcome: card.outcomeName,
                          amount: inputPrice,
                          symbol: token.symbol,
                          cashTag,
                      }),
                      isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                          ? t('plugin_realitycards_follow_message', {
                                handle: isTwitter(activatedSocialNetworkUI)
                                    ? t('twitter_account')
                                    : t('facebook_account'),
                            })
                          : '',
                      '#mask_io',
                  ].join('\n')
                : '',
        )
        .toString()

    useEffect(() => {
        if (!token || !open) return
        if (rentState.type === TransactionStateType.UNKNOWN) return

        setTransactionDialogOpen({
            open: true,
            state: rentState,
            shareLink,
            summary: t('plugin_realitycards_rent_summary', {
                outcome: card.outcomeName,
                amount: inputPrice,
                symbol: token.symbol,
            }),
        })
    }, [rentState, card.outcomeName, inputPrice, token.symbol])

    useEffect(() => {
        if (!token) return
        if (exitState.type === TransactionStateType.UNKNOWN) return
        if (exitState.type === TransactionStateType.FAILED) {
            setTransactionDialogOpen({ open: false })
            return
        }

        setTransactionDialogOpen({
            open: true,
            state: exitState,
            summary: t('plugin_realitycards_exit_summary', {
                outcome: card.outcomeName,
            }),
        })
    }, [exitState, card.outcomeName])
    //#endregion

    //#region validation
    const priceValidationMessage = useMemo(() => {
        if (!priceHourly || priceHourly.isZero() || priceHourly.isNaN())
            return t('wallet_transfer_error_amount_absence')
        if (priceHourly.isLessThan(MINIMUM_ACCEPTED_PRICE))
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
    }, [account, priceHourly, token, tokenBalance])

    const durationValidationMessage = useMemo(() => {
        if (!limitedOwnership) return ''
        if (minRentalDurationSecond.isGreaterThan(duration)) return t('plugin_realitycards_error_minimum_duration')
        if (maxOwnershipSeconds.isLessThan(duration))
            return t('plugin_realitycards_error_maximum_ownership_time', {
                minutes: maxOwnershipSeconds.dividedBy(60).toFixed(0, BigNumber.ROUND_DOWN),
            })
        return ''
    }, [account, priceHourly, token, tokenBalance])
    //#endregion

    if (!token) return null
    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onDialogClose}
            title={market.name + ' -> ' + card.outcomeName}
            maxWidth="xs">
            <DialogContent>
                {errorTokenBalance ? (
                    <Typography className={classes.message} color="textPrimary">
                        {t('plugin_dhedge_smt_wrong')}
                        <RefreshIcon className={classes.refresh} color="primary" onClick={tokenBalanceRetry} />
                    </Typography>
                ) : (
                    <>
                        {isOwner ? (
                            <Typography color="green" variant="h6" align="center">
                                ✅ {t('plugin_realitycards_currently_own_card')}
                            </Typography>
                        ) : null}

                        <form className={classes.form} noValidate autoComplete="off">
                            <PricePanel
                                label={t('plugin_realitycards_hourly_rental_price')}
                                amount={inputPrice}
                                minAmount={minHourlyPrice.toString()}
                                balance={tokenBalance ?? '0'}
                                token={token}
                                onAmountChange={setInputPrice}
                            />
                            {priceValidationMessage ? (
                                <Typography color="red" variant="body2">
                                    {priceValidationMessage}
                                </Typography>
                            ) : null}
                        </form>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={limitedOwnership}
                                    onChange={(e, checked) => setLimitedOwnership(checked)}
                                    name="checkedB"
                                    color="primary"
                                />
                            }
                            label={t('plugin_realitycards_limit_ownership')}
                        />
                        {limitedOwnership ? (
                            <Grid container sx={{ marginY: 1 }}>
                                <Grid item xs={4}>
                                    <InputBox
                                        label={t('plugin_realitycards_length_days')}
                                        value={days}
                                        onChange={setDays}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <InputBox
                                        label={t('plugin_realitycards_length_hours')}
                                        value={hours}
                                        onChange={setHours}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <InputBox
                                        label={t('plugin_realitycards_length_minutes')}
                                        value={minutes}
                                        onChange={setMinutes}
                                    />
                                </Grid>
                            </Grid>
                        ) : null}
                        {durationValidationMessage ? (
                            <Typography color="red" variant="body2">
                                {durationValidationMessage}
                            </Typography>
                        ) : null}

                        <EthereumWalletConnectedBoundary>
                            <EthereumERC20TokenApprovedBoundary
                                amount={priceHourly.toString()}
                                spender={market.id}
                                token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!priceValidationMessage || !!durationValidationMessage}
                                    onClick={rentCallback}
                                    variant="contained"
                                    loading={loadingTokenBalance}
                                    sx={{ textTransform: 'uppercase' }}>
                                    {isOwner
                                        ? t('plugin_realitycards_increase_price')
                                        : priceHourly.isGreaterThanOrEqualTo(minHourlyPrice)
                                        ? t('plugin_realitycards_rent_card')
                                        : t('plugin_realitycards_place_bid')}
                                </ActionButton>

                                {isOwner ? (
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        disabled={!isOwner}
                                        onClick={exitCallback}
                                        variant="contained"
                                        style={{ backgroundColor: 'maroon' }}
                                        loading={false}>
                                        {t('plugin_realitycards_exit_position')}
                                    </ActionButton>
                                ) : null}
                            </EthereumERC20TokenApprovedBoundary>
                        </EthereumWalletConnectedBoundary>

                        <Grid container direction="column" sx={{ marginY: 1, alignItems: 'center' }}>
                            <Grid item xs={12}>
                                <Typography color="textSecondary" variant="body2" align="center" sx={{ m: 1 }}>
                                    {t('plugin_realitycards_max_total_rent_amount', {
                                        amount: formatBalance(maxRentalAmount, token.decimals, 3),
                                        symbol: token.symbol,
                                    })}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="text"
                                    onClick={() => setDepositDialogOpen(true)}
                                    sx={{ textTransform: 'uppercase' }}>
                                    {t('plugin_realitycards_deposit')}
                                </Button>
                            </Grid>
                        </Grid>
                    </>
                )}
                <DepositDialog open={depositDialogOpen} onClose={() => setDepositDialogOpen(false)} />
            </DialogContent>
        </InjectedDialog>
    )
}
