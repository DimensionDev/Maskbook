import { useState } from 'react'
import { makeStyles, Typography, Grid, Switch, SwitchClassKey, SwitchProps, withStyles } from '@material-ui/core'
import { Trans } from 'react-i18next'

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

export const MarketBuySell = () => {
    const classes = useStyles()
    const [buySell, setBuySell] = useState(false)
    const [selected, setSelected] = useState(1)

    const handleChangeBuySell = () => {
        setBuySell(!buySell)
    }

    const handleSelect = (item: number) => {
        setSelected(item)
    }

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
                            <AugurSwitch checked={buySell} onChange={handleChangeBuySell} name="buySell" />
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
                                1.50%
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item container direction="column" className={`${classes.spacing} ${classes.predictions}`}>
                    <Grid
                        item
                        container
                        justifyContent="space-between"
                        className={selected === 1 ? classes.selected : undefined}
                        onClick={() => handleSelect(1)}>
                        <Typography variant="body2">Team1</Typography>
                        <Typography variant="body2">$0.49</Typography>
                    </Grid>
                    <Grid
                        item
                        container
                        justifyContent="space-between"
                        className={selected === 2 ? classes.selected : undefined}
                        onClick={() => handleSelect(2)}>
                        <Typography variant="body2">Team2</Typography>
                        <Typography variant="body2">$0.49</Typography>
                    </Grid>
                    <Grid
                        item
                        container
                        justifyContent="space-between"
                        className={selected === 0 ? classes.selected : undefined}
                        onClick={() => handleSelect(0)}>
                        <Typography variant="body2">
                            <Trans i18nKey="plugin_augur_no_contest" />
                        </Typography>
                        <Typography variant="body2">$0.02</Typography>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}
