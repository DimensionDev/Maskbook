import BigNumber from 'bignumber.js'
import { makeStyles } from '@masknet/theme'
import { Card, CardContent, Typography, Grid, Box } from '@mui/material'
import { useFetchToken } from '../hooks/useToken'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { fpmmLiquidity, tokenData } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        marginTop: theme.spacing(2),
    },
    card: {
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        alignItems: 'center',
    },
    gridRow: {
        width: '100%',
        marginLeft: theme.spacing(2),
    },
    gridCol: {
        margin: theme.spacing(1),
    },
    gridItemTitle: {
        margin: '3px',
        fontSize: 12,
    },
    gridItemValue: {
        fontSize: 12,
    },
}))

interface OmenDetailsCardProps {
    liquidityData: fpmmLiquidity[]
    tokenId: string
    usdRunningDailyVolume: number
    closingTimestamp: Date
    collateralVolume: BigNumber
}

export function OmenDetailsCard(props: OmenDetailsCardProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { liquidityData, tokenId, usdRunningDailyVolume, closingTimestamp, collateralVolume } = props
    const tokenDataRes = useFetchToken(tokenId)
    const tokenObj: tokenData | null | undefined = tokenDataRes ? tokenDataRes.value : undefined
    const collateralToken = tokenObj?.registeredToken
    const collateralDecimals = collateralToken ? collateralToken.decimals : 0
    let sharesAmount = new BigNumber(0)
    const liquidityArr = Object.values(liquidityData)
    for (const liquidityObj of liquidityArr) {
        const tempSum = new BigNumber(sharesAmount)
        const nextVal = new BigNumber(liquidityObj.sharesAmount)
        sharesAmount = tempSum.plus(nextVal)
    }
    const liquidityAmount = Number(new BigNumber(sharesAmount).shiftedBy(-collateralDecimals).toFixed(4))
    const totalVolume = Number(new BigNumber(collateralVolume).shiftedBy(-collateralDecimals).toFixed(4))
    const dailyVolume = Number(usdRunningDailyVolume).toFixed(3)

    return (
        <Box className={classes.root}>
            <Card className={classes.card}>
                <CardContent>
                    <Grid container item direction="row" alignItems="center" className={classes.gridRow}>
                        <Grid item className={classes.gridItemTitle}>
                            <Grid container item direction="column" alignItems="center" className={classes.gridCol}>
                                <Grid item>
                                    <Typography className={classes.gridItemTitle}>
                                        {t('plugin_omen_liquidity')}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography className={classes.gridItemValue}>{liquidityAmount}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item className={classes.gridItemTitle}>
                            <Grid container item direction="column" alignItems="center" className={classes.gridCol}>
                                <Grid item>
                                    <Typography className={classes.gridItemTitle}>
                                        {t('plugin_omen_total_volume')}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography className={classes.gridItemValue}>{totalVolume}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item className={classes.gridItemTitle}>
                            <Grid container item direction="column" alignItems="center" className={classes.gridCol}>
                                <Grid item>
                                    <Typography className={classes.gridItemTitle}>
                                        {t('plugin_omen_daily_volume')}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography className={classes.gridItemValue}>${dailyVolume}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item className={classes.gridItemTitle}>
                            <Grid container item direction="column" alignItems="center" className={classes.gridCol}>
                                <Grid item>
                                    <Typography className={classes.gridItemTitle}>
                                        {t('plugin_omen_closing_date')}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography className={classes.gridItemValue}>
                                        {closingTimestamp.toDateString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    )
}
