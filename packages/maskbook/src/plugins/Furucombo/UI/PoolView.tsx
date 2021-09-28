import { makeStyles } from '@masknet/theme'
import { Button, Divider, Grid, Typography, Container } from '@material-ui/core'
import { FurucomboIcon } from '../../../resources/FurucomboIcon'
import { useI18N } from '../../../utils'
import { BASE_URL } from '../constants'
import { UnknownIcon } from '../resources/UnknownIcon'
import { WmaticIcon } from '../resources/wmatic'
import type { Angel, Investable } from '../types'
import { apyFormatter, liquidityFormatter } from '../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,Arial,"sans-serif" !important',
        backgroundColor: '#232535',
        color: 'white',
        padding: theme.spacing(2),
    },
    deck: {
        padding: theme.spacing(4),
        gap: theme.spacing(4),
    },
    meta: {
        padding: theme.spacing(4),
    },
    name: {
        fontSize: 20,
        fontFamily: 'inherit',
    },
    protocol: {
        color: '#9e9fa6',
        fontFamily: 'inherit',
        textTransform: 'capitalize',
    },
    title: {
        fontSize: 12,
        fontFamily: 'inherit',
        color: '#9e9fa6',
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 24,
        fontFamily: 'inherit',
    },
    divider: {
        backgroundColor: '#393b4a',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    invest: {
        maxWidth: theme.spacing(12),
        fontSize: 16,
        fontFamily: 'inherit',
        fontWeight: 400,
        backgroundColor: 'white',
        border: '1px solid #393b4a',
        borderRadius: '6px',
        color: '#212529',
        paddingRight: theme.spacing(4),
        paddingLeft: theme.spacing(4),
        '&:hover': {
            backgroundColor: 'white',
            color: '#212529',
            border: '1px solid #393b4a',
        },
    },
    icons: {
        height: 24,
        width: 24,
    },
    unknown: {
        padding: theme.spacing(0.35),
        height: 19,
        width: 19,
    },
    tooltip: {
        backgroundColor: 'white',
    },
}))

interface PoolProps {
    investable: Investable
}

export function Poolview(props: PoolProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const {
        category,
        chainId,
        token: { address },
        name,
        protocol,
        liquidity,
        apy,
        angels,
    } = props.investable

    return (
        <div className={classes.root}>
            <Container>
                <Grid
                    container
                    wrap="nowrap"
                    className={classes.deck}
                    justifyContent="space-around"
                    alignItems="center">
                    <Grid container item direction="column">
                        <Grid item>
                            <Typography className={classes.name}>{name}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography className={classes.protocol}>{protocol}</Typography>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Button
                            size="small"
                            className={classes.invest}
                            variant="outlined"
                            href={`${BASE_URL}/${category}/${chainId}/${address}`}
                            target="_blank">
                            Invest
                        </Button>
                    </Grid>
                </Grid>
            </Container>
            <Divider className={classes.divider} />
            <Grid container wrap="nowrap" justifyItems="center" className={classes.meta}>
                <Grid container item direction="column" alignItems="center">
                    <Grid item>
                        <Typography className={classes.title}>{t('plugin_furucombo_liquidity')}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography className={classes.value}>{liquidityFormatter(liquidity, 1)}</Typography>
                    </Grid>
                </Grid>
                <Grid container item direction="column" alignItems="center">
                    <Grid item>
                        <Typography className={classes.title}>{t('plugin_furucombo_apy')}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography className={classes.value}>{apyFormatter(apy)}</Typography>
                    </Grid>
                </Grid>
                {category === 'farm' ? (
                    <Grid container item direction="column" alignItems="center" spacing={1}>
                        <Grid item>
                            <Typography className={classes.title}>{t('plugin_furucombo_rewards')}</Typography>
                        </Grid>
                        <Grid container item direction="row" justifyContent="center">
                            {angels.map((angel: Angel) => {
                                if (angel.rewardToken.symbol === 'WMATIC')
                                    return (
                                        <Grid item>
                                            <WmaticIcon />
                                        </Grid>
                                    )
                                if (angel.rewardToken.symbol === 'COMBO')
                                    return (
                                        <Grid item>
                                            <FurucomboIcon className={classes.icons} />
                                        </Grid>
                                    )
                                return (
                                    <Grid item>
                                        <UnknownIcon className={classes.unknown} />
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </Grid>
                ) : null}
            </Grid>
        </div>
    )
}
