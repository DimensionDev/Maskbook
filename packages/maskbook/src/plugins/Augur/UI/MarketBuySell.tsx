import { useMemo, useState } from 'react'
import { Typography, Grid, SwitchClassKey, SwitchProps, Button, Switch } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { Trans } from 'react-i18next'
import type { AmmOutcome, Market } from '../types'
import { useI18N } from '../../../utils'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { BuyDialog } from '../SNSAdaptor/BuyDialog'
import { SellDialog } from '../SNSAdaptor/SellDialog'
import { LiquidityDialog } from '../SNSAdaptor/LiquidityDialog'

interface Styles extends Partial<Record<SwitchClassKey, string>> {
    focusVisible?: string
}

interface Props extends SwitchProps {
    classes: Styles
}

const useSwitchStyle = makeStyles()((theme) => {
    return {
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
        },
        thumb: {
            width: 84,
            height: 46,
            borderRadius: '.5rem',
            backgroundColor: '#15171a',
        },
        track: {
            borderRadius: '.5rem',
            backgroundColor: 'transparent !important',
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
        checked: {
            '&:after': {
                content: "'Sell'",
                color: '#fff',
                position: 'absolute',
            },
            color: '#15171a',
            transform: 'translateX(100%) !important',
            marginLeft: -1,
        },
    }
})

const useStyles = makeStyles()((theme) => ({
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
    label: {
        flexDirection: 'column',
    },
}))

interface MarketBuySellProps {
    market: Market
    ammOutcomes: AmmOutcome[]
    cashToken: FungibleTokenDetailed
}

export const MarketBuySell = (props: MarketBuySellProps) => {
    const { market, ammOutcomes, cashToken } = props

    const { t } = useI18N()
    const { classes } = useStyles()
    const { classes: switchClasses } = useSwitchStyle()
    const [isBuy, setIsBuy] = useState(true)
    const [selectedOutcome, setSelectedOutcome] = useState<AmmOutcome>()
    const [buyDialogOpen, setBuyDialogOpen] = useState(false)
    const [sellDialogOpen, setSellDialogOpen] = useState(false)
    const [liquidityDialogOpen, setLiquidityDialogOpen] = useState(false)

    const validationMessage = useMemo(() => {
        if (!selectedOutcome) return t('plugin_augur_select_outcome')
        if (isBuy) {
            if (
                !market.ammExchange ||
                !market.ammExchange.totalLiquidity ||
                market.ammExchange.totalLiquidity.isLessThanOrEqualTo(0)
            )
                return t('plugin_trader_error_insufficient_lp')
        }
        return ''
    }, [isBuy, market, selectedOutcome])

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
                            <Switch
                                disableRipple
                                classes={{
                                    root: switchClasses.root,
                                    switchBase: switchClasses.switchBase,
                                    checked: switchClasses.checked,
                                    thumb: switchClasses.thumb,
                                    track: switchClasses.track,
                                }}
                                checked={!isBuy}
                                onChange={() => setIsBuy((x) => !x)}
                                name="buySell"
                            />
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
                {!market.hasWinner ? (
                    <Grid item className={classes.actions}>
                        <Button
                            variant="contained"
                            fullWidth
                            color="primary"
                            disabled={!!validationMessage}
                            onClick={isBuy ? () => setBuyDialogOpen(true) : () => setSellDialogOpen(true)}>
                            {validationMessage ? validationMessage : isBuy ? t('buy') : t('sell')}
                        </Button>
                    </Grid>
                ) : null}
                <Grid item className={classes.link}>
                    <Button
                        variant="outlined"
                        fullWidth
                        classes={{ label: classes.label }}
                        onClick={() => setLiquidityDialogOpen(true)}>
                        <Typography color="primary">
                            {!market.hasWinner ? t('plugin_augur_add_liquidity') : t('plugin_augur_remove_liquidity')}
                        </Typography>
                        <Typography color="textSecondary" variant="caption">
                            {t('plugin_augur_liquidity_button_caption')}
                        </Typography>
                    </Button>
                </Grid>
            </Grid>
            <BuyDialog
                open={buyDialogOpen}
                market={market}
                outcome={selectedOutcome}
                token={cashToken}
                onClose={() => setBuyDialogOpen(false)}
            />
            <SellDialog
                open={sellDialogOpen}
                market={market}
                outcome={selectedOutcome}
                cashToken={cashToken}
                onClose={() => setSellDialogOpen(false)}
            />
            <LiquidityDialog
                open={liquidityDialogOpen}
                outcome={selectedOutcome}
                onClose={() => setLiquidityDialogOpen(false)}
            />
        </div>
    )
}
