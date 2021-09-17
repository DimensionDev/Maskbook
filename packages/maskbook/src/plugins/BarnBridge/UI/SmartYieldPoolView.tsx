import { Typography, Grid } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useChainId } from '@masknet/web3-shared'
import { useState } from 'react'
import { useI18N } from '../../../utils'
import {
    COLOR_SY_SENIOR_TEXT,
    COLOR_SY_JUNIOR_TEXT,
    COLOR_BARNBRIDGE_ORANGE,
    COLOR_BARNBRIDGE_BACKGROUND_DARK,
    COLOR_BARNBRIDGE_BACKGROUND_CARD_DARK,
} from '../constants'
import {
    BarnBridgeSmartYieldCompoundToken,
    BarnBridgeSmartYieldAAVEToken,
    BarnBridgeSmartYieldCREAMToken,
} from '../BarnBridgeIcon'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1, 2),
        maxWidth: 455,
        alignItems: 'stretch',
        backgroundColor: COLOR_BARNBRIDGE_BACKGROUND_CARD_DARK,
        margin: theme.spacing(1, 1),
        borderRadius: theme.spacing(1),
        fontSize: 14,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: theme.spacing(1),
        justifyContent: 'inherit',
        alignItems: 'center',
    },
    headerText: {
        color: '#fff',
        margin: theme.spacing(0, 1),
        backgroundColor: COLOR_BARNBRIDGE_BACKGROUND_DARK,
        borderRadius: theme.spacing(2),
        padding: theme.spacing(0.5, 0.5),
    },
    coinText: {
        color: '#fff',
        margin: theme.spacing(0, 2),
        padding: theme.spacing(0, 0.5),
    },
    seniorAPYText: {
        color: COLOR_SY_SENIOR_TEXT,
        margin: theme.spacing(0, 2),
        padding: theme.spacing(0, 0.5),
    },
    juniorAPYText: {
        color: COLOR_SY_JUNIOR_TEXT,
        margin: theme.spacing(0, 2),
        padding: theme.spacing(0, 0.5),
    },
    coinPadding: {
        marginBottom: theme.spacing(1),
        justifyContent: 'inherit',
        alignItems: 'center',
    },
    coinContainer: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        borderRadius: theme.spacing(1),
        backgroundColor: COLOR_BARNBRIDGE_BACKGROUND_DARK,
        justifyContent: 'flex-start',
        alignItems: 'center',
        maxWidth: '50%',
        '&:hover': {
            backgroundColor: COLOR_BARNBRIDGE_ORANGE,
            cursor: 'pointer',
        },
    },
    protocolName: {
        paddingBottom: theme.spacing(2.0),
        paddingLeft: theme.spacing(1.0),
    },
}))

const protocolNameToIcon: { [id: string]: JSX.Element } = {
    'C.R.E.A.M FINANCE': <BarnBridgeSmartYieldCREAMToken />,
    Compound: <BarnBridgeSmartYieldCompoundToken />,
    AAVE: <BarnBridgeSmartYieldAAVEToken />,
}

function GenerateProtocolName(props: SYProtocolNameProps) {
    const { classes } = useStyles()
    return (
        <Grid container direction="row">
            {props.protocolName in protocolNameToIcon ? protocolNameToIcon[props.protocolName] : null}
            <Typography fontSize={20} variant="h2" className={classes.protocolName}>
                {props.protocolName}
            </Typography>
        </Grid>
    )
}

function GenerateHeader() {
    const { classes } = useStyles()
    const { t } = useI18N()

    const poolURL = ''
    const chainId = useChainId()

    return (
        <Grid container spacing={1} direction="row" className={classes.headerContainer}>
            <Grid container item xs>
                <Grid item className={classes.headerText}>
                    <Typography fontSize={13} variant="subtitle2">
                        Token Name
                    </Typography>
                </Grid>
                <Grid item />
            </Grid>
            <Grid container item xs>
                <Grid item className={classes.headerText}>
                    <Typography fontSize={13} variant="subtitle2">
                        Senior Liquidity
                    </Typography>
                </Grid>
                <Grid item />
            </Grid>
            <Grid container item xs>
                <Grid item className={classes.headerText}>
                    <Typography fontSize={13} variant="subtitle2">
                        Senior APY
                    </Typography>
                </Grid>
                <Grid item />
            </Grid>
            <Grid container item xs>
                <Grid item className={classes.headerText}>
                    <Typography fontSize={13} variant="subtitle2">
                        Junior Liquidity
                    </Typography>
                </Grid>
                <Grid item />
            </Grid>
            <Grid container item xs>
                <Grid item className={classes.headerText}>
                    <Typography fontSize={13} variant="subtitle2">
                        Junior APY
                    </Typography>
                </Grid>
                <Grid item />
            </Grid>
        </Grid>
    )
}

function onClickPoolCell(clickUrl: string) {
    window.open(clickUrl)
}

function GeneratePoolCell(props: SYCoinProps) {
    const { classes } = useStyles()
    const { t } = useI18N()

    const poolURL = ''
    const chainId = useChainId()
    const [prize, setPrize] = useState('TBD')
    const [period, setPeriod] = useState('Custom Period')

    return (
        <Grid
            item
            container
            direction="row"
            onClick={() => onClickPoolCell(props.redirectUrl)}
            className={classes.coinContainer}>
            <Grid container spacing={0} direction="row" className={classes.coinPadding}>
                <Grid container item xs={true}>
                    <Grid item className={classes.coinText}>
                        <Typography fontSize={13} variant="subtitle2">
                            {props.coinName}
                        </Typography>
                    </Grid>
                    <Grid item />
                </Grid>
                <Grid container item xs={true}>
                    <Grid item className={classes.coinText}>
                        <Typography fontSize={13} variant="subtitle2">
                            {props.seniorLiquidity}
                        </Typography>
                    </Grid>
                    <Grid item />
                </Grid>
                <Grid container item xs={true}>
                    <Grid item className={classes.seniorAPYText}>
                        <Typography fontSize={13} variant="subtitle2">
                            {props.seniorAPY + '%'}
                        </Typography>
                    </Grid>
                    <Grid item />
                </Grid>
                <Grid container item xs={true}>
                    <Grid item className={classes.coinText}>
                        <Typography fontSize={13} variant="subtitle2">
                            {props.juniorLiquidity}
                        </Typography>
                    </Grid>
                    <Grid item />
                </Grid>
                <Grid container item xs={true}>
                    <Grid item className={classes.juniorAPYText}>
                        <Typography fontSize={13} variant="subtitle2">
                            {props.juniorAPY + '%'}
                        </Typography>
                    </Grid>
                    <Grid item />
                </Grid>
            </Grid>
        </Grid>
    )
}

export interface SYPoolProps {
    protocolName: string
    coins: SYCoinProps[]
}
export interface SYCoinProps {
    coinName: string
    seniorLiquidity: string
    seniorAPY: number
    juniorLiquidity: string
    juniorAPY: number
    redirectUrl: string
}

interface SYProtocolNameProps {
    protocolName: string
}

export function SmartYieldPoolView(props: SYPoolProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const chainId = useChainId()
    const coins = props.coins

    return (
        <Grid container direction="column" className={classes.root}>
            <GenerateProtocolName protocolName={props.protocolName} />
            <GenerateHeader />
            {props.coins.map((coin) => (
                <GeneratePoolCell
                    coinName={coin.coinName}
                    seniorLiquidity={coin.seniorLiquidity}
                    seniorAPY={coin.seniorAPY}
                    juniorLiquidity={coin.juniorLiquidity}
                    juniorAPY={coin.juniorAPY}
                    redirectUrl={coin.redirectUrl}
                />
            ))}
        </Grid>
    )
}
