import { useState } from 'react'
import {
    makeStyles,
    Typography,
    Grid,
    Switch,
    SwitchClassKey,
    SwitchProps,
    withStyles,
    Button,
} from '@material-ui/core'
import { Trans } from 'react-i18next'
import { AMMOutcome, BuySell, Market } from '../types'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginAugurMessages } from '../messages'
import { useCallback } from 'react'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'

interface Styles extends Partial<Record<SwitchClassKey, string>> {
    focusVisible?: string
}

interface Props extends SwitchProps {
    classes: Styles
}

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
}))

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

interface MarketBuySellProps {
    market: Market
    ammOutcomes: AMMOutcome[]
    cashToken: FungibleTokenDetailed
}

export const MarketBuySell = (props: MarketBuySellProps) => {
    const { market, ammOutcomes, cashToken } = props

    const { t } = useI18N()
    const classes = useStyles()
    const [buySell, setBuySell] = useState(BuySell.BUY)
    const [selectedOutcome, setSelectedOutcome] = useState<AMMOutcome>()

    const { setDialog: openBuyDialog } = useRemoteControlledDialog(PluginAugurMessages.events.ConfirmDialogUpdated)
    const onBuy = useCallback(() => {
        if (!selectedOutcome) return
        openBuyDialog({
            open: true,
            market: market,
            outcome: selectedOutcome,
            cashToken: cashToken,
        })
    }, [market, openBuyDialog, selectedOutcome, buySell])

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
                            <AugurSwitch
                                checked={!!buySell}
                                onChange={() => setBuySell(buySell === BuySell.BUY ? BuySell.SELL : BuySell.BUY)}
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
                <Grid item>
                    <Button
                        variant="contained"
                        fullWidth
                        color="primary"
                        disabled={!selectedOutcome}
                        onClick={buySell === BuySell.BUY ? onBuy : () => {}}>
                        {t('plugin_augur_confirm')}
                    </Button>
                </Grid>
            </Grid>
        </div>
    )
}
