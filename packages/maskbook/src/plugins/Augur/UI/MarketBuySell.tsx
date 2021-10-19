import { useMemo, useState } from 'react'
import {
    makeStyles,
    Typography,
    Grid,
    Switch,
    SwitchClassKey,
    SwitchProps,
    withStyles,
    Button,
    CircularProgress,
    Link,
} from '@material-ui/core'
import { Trans } from 'react-i18next'
import type { AMMOutcome, Market } from '../types'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginAugurMessages } from '../messages'
import { useCallback } from 'react'
import { FungibleTokenDetailed, useTokensBalance } from '@masknet/web3-shared'
import { RefreshIcon } from '@masknet/icons'
import BigNumber from 'bignumber.js'

interface Styles extends Partial<Record<SwitchClassKey, string>> {
    focusVisible?: string
}

interface Props extends SwitchProps {
    classes: Styles
}

const AugurSwitch = withStyles((theme) => ({
    root: {
        width: 170,
        height: 50,
        padding: 0,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderRadius: '.5rem',
        border: `solid 1px ${theme.palette.divider}`,
        fontSize: '1.25rem',
    },
    switchBase: {
        padding: 0,
        color: '#15171a',
        borderColor: 'transparent',
        marginLeft: 1,
        marginTop: 1,
        '&:after': {
            content: "'Buy'",
            color: '#fff',
            position: 'absolute',
        },
        '&$checked': {
            '&:after': {
                content: "'Sell'",
                color: '#fff',
                position: 'absolute',
            },
            color: '#15171a',
            transform: 'translateX(100%)',
            marginLeft: -1,
            '& + $track': {
                backgroundColor: 'transparent',
            },
        },
    },
    thumb: {
        width: 84,
        height: 46,
        borderRadius: '.5rem',
    },
    track: {
        borderRadius: '.5rem',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        opacity: 0.5,
        '&:before': {
            content: "'Buy'",
        },
        '&:after': {
            content: "'Sell'",
        },
    },

    checked: {},
    focusVisible: {},
}))(({ classes, ...props }: Props) => {
    return (
        <Switch
            focusVisibleClassName={classes.focusVisible}
            disableRipple
            classes={{
                root: classes.root,
                switchBase: classes.switchBase,
                thumb: classes.thumb,
                track: classes.track,
                checked: classes.checked,
            }}
            {...props}
        />
    )
})

const useStyles = makeStyles((theme) => ({
    root: {
        alignItems: 'center',
    },
    spacing: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    card: {
        border: `solid .0625rem ${theme.palette.divider}`,
        borderRadius: '1rem',
        gridGap: '1.1rem',
    },
    head: {
        borderBottom: `solid .0625rem ${theme.palette.divider}`,
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    predictions: {
        gridGap: '.5rem',
        marginBottom: theme.spacing(1),
        '& > .MuiGrid-item': {
            cursor: 'pointer',
            padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
            border: `solid .0625rem ${theme.palette.divider}`,
            borderRadius: '.5rem',
        },
    },
    selected: {
        border: 'solid .0625rem #05b169',
        backgroundColor: 'rgba(5,177,105,.15)',
    },
    message: {
        textAlign: 'center',
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 'inherit',
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
    },
    actions: {
        display: 'flex',
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(0),
    },
    retry: {
        fontSize: 'inherit',
        margin: 'auto',
    },
    link: {
        textAlign: 'center',
        padding: theme.spacing(2),
        paddingTop: theme.spacing(0),
        paddingBottom: theme.spacing(1),
    },
}))

interface MarketBuySellProps {
    market: Market
    ammOutcomes: AMMOutcome[]
    cashToken: FungibleTokenDetailed
}

export const MarketBuySell = (props: MarketBuySellProps) => {
    const { market, ammOutcomes, cashToken } = props

    const { t } = useI18N()
    const classes = useStyles()
    const [isBuy, setIsBuy] = useState(true)
    const [selectedOutcome, setSelectedOutcome] = useState<AMMOutcome>()

    const { value: rawBalances, loading, error, retry } = useTokensBalance(market.outcomes.map((x) => x.shareToken))
    const balances = rawBalances?.map((x: string) => new BigNumber(x))

    const { setDialog: openBuyDialog } = useRemoteControlledDialog(PluginAugurMessages.events.BuyDialogUpdated)
    const onBuy = useCallback(() => {
        if (!selectedOutcome) return
        openBuyDialog({
            open: true,
            market: market,
            outcome: selectedOutcome,
            cashToken: cashToken,
        })
    }, [market, openBuyDialog, selectedOutcome, isBuy])

    const { setDialog: openSellDialog } = useRemoteControlledDialog(PluginAugurMessages.events.SellDialogUpdated)
    const onSell = useCallback(() => {
        if (!selectedOutcome || !rawBalances) return
        openSellDialog({
            open: true,
            market: market,
            outcome: selectedOutcome,
            userBalances: rawBalances,
            cashToken: cashToken,
        })
    }, [market, openBuyDialog, selectedOutcome, isBuy, rawBalances])

    const validationMessage = useMemo(() => {
        if (!error && !selectedOutcome) return t('plugin_augur_select_outcome')
        if (isBuy) {
            if (
                !market.ammExchange ||
                !market.ammExchange.totalLiquidity ||
                market.ammExchange.totalLiquidity.isLessThanOrEqualTo(0)
            )
                return t('plugin_trader_error_insufficient_lp')
        } else {
            if (error) return t('plugin_augur_smt_wrong')
            if (
                selectedOutcome &&
                !!balances &&
                (!market.ammExchange?.shareFactor ||
                    balances[selectedOutcome.id].isLessThanOrEqualTo(
                        new BigNumber(market.ammExchange?.shareFactor).multipliedBy(10),
                    )) // output should be greater than share factor, so multipliedBy 10 to cancel out price effect
            )
                return t('error_insufficient_balance')
        }
        return ''
    }, [isBuy, market, selectedOutcome, balances])

    return (
        <div className={`${classes.root} ${classes.spacing}`}>
            <Grid container direction="column" className={classes.card}>
                <Grid
                    item
                    container
                    direction="row"
                    wrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                    className={`${classes.head} ${classes.spacing}`}>
                    <Grid item>
                        <Typography variant="h6" color="textPrimary">
                            <AugurSwitch checked={!isBuy} onChange={() => setIsBuy((x) => !x)} name="buySell" />
                        </Typography>
                    </Grid>
                    <Grid item container direction="column" alignItems="flex-end">
                        <Grid item>
                            <Typography variant="body2" color="textSecondary">
                                <Trans i18nKey="plugin_augur_fee" />
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" color="textPrimary">
                                {market.swapFee}%
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item container direction="column" className={`${classes.spacing} ${classes.predictions}`}>
                    {ammOutcomes
                        .sort((x, y) => y.id - x.id)
                        .map((outcome) => {
                            return (
                                <Grid
                                    item
                                    container
                                    justifyContent="space-between"
                                    key={outcome.shareToken}
                                    className={
                                        selectedOutcome?.shareToken === outcome.shareToken
                                            ? classes.selected
                                            : undefined
                                    }
                                    onClick={() => setSelectedOutcome(outcome)}>
                                    <Typography variant="body2">{outcome.name}</Typography>
                                    <Typography variant="body2">
                                        {outcome.rate.isZero() && !market.hasWinner
                                            ? '-'
                                            : '$' + outcome.rate.toFixed(2)}
                                    </Typography>
                                </Grid>
                            )
                        })}
                </Grid>
                {!isBuy && loading ? (
                    <div className={classes.message}>
                        <CircularProgress className={classes.progress} color="primary" size={15} />
                    </div>
                ) : (isBuy && !market.hasWinner) || !isBuy ? (
                    <Grid item className={classes.actions}>
                        <Button
                            variant="contained"
                            fullWidth
                            color="primary"
                            disabled={!!validationMessage}
                            onClick={isBuy ? onBuy : onSell}>
                            {validationMessage ? validationMessage : isBuy ? t('buy') : t('sell')}
                        </Button>
                        {!isBuy && <RefreshIcon className={classes.retry} color="primary" onClick={retry} />}
                    </Grid>
                ) : null}
                {!market.hasWinner && (
                    <Grid item className={classes.link}>
                        <Link color="primary" target="_blank" rel="noopener noreferrer" href={market.link}>
                            <Typography color="textPrimary">{t('augur_add_liquidity')}</Typography>
                        </Link>
                    </Grid>
                )}
            </Grid>
        </div>
    )
}
