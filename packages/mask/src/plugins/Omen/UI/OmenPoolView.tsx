import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import {
    Button,
    Grid,
    Typography,
    Divider,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
} from '@mui/material'
import { useI18N } from '../../../utils'
import { bigNumberToString } from '../utils'
import { useFetchToken } from '../hooks/useToken'
import { STANDARD_DECIMALS, OMEN_BASE_URL } from '../constants'
import type { tokenData } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    meta: {
        padding: theme.spacing(4),
    },
    line: {
        display: 'flex',
        margin: theme.spacing(1),
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        maxWidth: theme.spacing(12),
        fontSize: 16,
        fontFamily: 'inherit',
        fontWeight: 500,
        backgroundColor: 'white',
        border: `1px solid ${theme.palette.divider}`,
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
    headerLeft: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        border: 'none',
        backgroundColor: MaskColorVar.primaryBackground,
        textAlign: 'left',
    },
    headerCenter: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        border: 'none',
        backgroundColor: MaskColorVar.primaryBackground,
        textAlign: 'center',
    },
    headerRight: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        border: 'none',
        backgroundColor: MaskColorVar.primaryBackground,
        textAlign: 'right',
    },
    inputCell: {
        margin: theme.spacing(1),
    },
    outputCell: {
        margin: theme.spacing(1),
        width: '200px',
        marginLeft: '5px',
        marginTop: '20px',
    },
    outputCellTitle: {
        marginLeft: '25px',
        marginTop: '15px',
        textAlign: 'left',
    },
    outputCellValue: {
        textAlign: 'right',
        marginTop: '15px',
        marginLeft: '20px',
    },
    tCellLeft: {
        marginLeft: '10px',
        textAlign: 'left',
    },
    tCellCenter: {
        textAlign: 'center',
    },
    tCellRight: {
        textAlign: 'right',
    },
    calculatedAmount: {
        margin: theme.spacing(1),
    },
    buttonCol: {
        marginRight: '75px',
    },
    divider: {
        backgroundColor: theme.palette.divider,
        width: 'inherit',
        marginTop: '15px',
    },
}))

interface OmenPoolViewProps {
    marketId: string
    marketOutcomes: string[]
    marketOutcomePrices: BigNumber[]
    marketFee: BigNumber
    tokenId: string
}

export function OmenPoolView(props: OmenPoolViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [inputAmount, setInputAmount] = useState<BigNumber>(new BigNumber(0))
    const { marketId, marketOutcomes, marketOutcomePrices, tokenId } = props
    const tokenDataRes = useFetchToken(tokenId)
    const tokenObj: tokenData | null | undefined = tokenDataRes ? tokenDataRes.value : undefined
    const marketFee = props.marketFee ? new BigNumber(props.marketFee) : new BigNumber(0)
    const collateralToken = tokenObj?.registeredToken
    const tokenSymbol = collateralToken ? collateralToken.symbol : ''
    const earnTradingFee = bigNumberToString(marketFee.multipliedBy(Math.pow(10, 2)), STANDARD_DECIMALS)

    let outcomeValSum = 0
    const outcomePricesFormatted: number[] = []
    for (const outcomeObj of marketOutcomePrices) {
        const tempOutputPrice = new BigNumber(outcomeObj)
        const outcomePrice = Number(tempOutputPrice.toFixed(4))
        outcomePricesFormatted.push(outcomePrice)
        outcomeValSum += tempOutputPrice.toNumber()
    }

    // #region the pool dialog
    // const { setDialog: openPoolDialog } = useRemoteControlledDialog(PluginOmenMessages.PoolDialogUpdated)
    const onPoolRequest = useCallback(
        (txType: string) => {
            if (marketId === '' || txType === '' || !inputAmount) return
            console.log('onPoolRequest marketId: ', marketId)
            console.log('onPoolRequest txType: ', txType)
            console.log('onPoolRequest inputAmount: ', inputAmount)
            // openPoolDialog({
            //     open: true,
            //     marketId: marketId,
            //     txType: txType,
            //     inputAmount: inputAmount,
            // })
        },
        [marketId, inputAmount],
    )
    // #endregion

    return (
        <div className={classes.root}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell key="Outcome" align="center" variant="head" className={classes.headerLeft}>
                            {t('plugin_omen_market_outcome')}
                        </TableCell>
                        <TableCell key="Probability" align="center" variant="head" className={classes.headerCenter}>
                            {t('plugin_omen_market_probability')}
                        </TableCell>
                        <TableCell key="Price" align="center" variant="head" className={classes.headerRight}>
                            {t('plugin_omen_market_price')} ({tokenSymbol})
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {marketOutcomes.map((outcomeName, index) => (
                        <TableRow key={index}>
                            <TableCell align="left">
                                <Typography className={classes.tCellLeft}>{outcomeName}</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography className={classes.tCellCenter}>
                                    {outcomeValSum > 0
                                        ? (outcomePricesFormatted[index] / outcomeValSum).toFixed()
                                        : '0'}
                                    %
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography className={classes.tCellRight}>
                                    {outcomePricesFormatted[index].toFixed()} {tokenSymbol}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Divider />
            <Grid container item direction="row" alignItems="center">
                <Grid item className={classes.inputCell}>
                    <Grid container item direction="row" wrap="nowrap" justifyItems="center">
                        <Grid item>
                            <Grid container item direction="column" alignItems="center" className={classes.buttonCol}>
                                <Grid item alignSelf="left" xs={4} textAlign="center">
                                    <Button
                                        className={classes.button}
                                        variant="outlined"
                                        fullWidth
                                        color="primary"
                                        href={`${OMEN_BASE_URL}${marketId}/pool`}
                                        target="_blank">
                                        {t('plugin_omen_deposit')}
                                    </Button>
                                </Grid>
                                <Grid item alignSelf="right" xs={4} textAlign="center">
                                    <Button
                                        className={classes.button}
                                        variant="outlined"
                                        fullWidth
                                        color="primary"
                                        href={`${OMEN_BASE_URL}${marketId}/pool`}
                                        target="_blank">
                                        {t('plugin_omen_withdraw')}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Paper variant="outlined" className={classes.outputCell}>
                            <Grid container item direction="column">
                                <Grid container item direction="row">
                                    <Grid item textAlign="left">
                                        <Typography className={classes.outputCellTitle}>
                                            {t('plugin_omen_market_earn_trading_fee')}
                                        </Typography>
                                    </Grid>
                                    <Grid item textAlign="right">
                                        <Typography className={classes.outputCellValue}>
                                            {Number(earnTradingFee.toFixed(4))}%
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Divider className={classes.divider} />
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}

// // Total Liquidity
// totalPoolShares = marketLiquidity.sharesAmount
// `${bigNumberToString(totalPoolShares, baseCollateral.decimals)} ${baseCollateral.symbol}`
//
// // Your Liquidity
// `${bigNumberToString(totalUserLiquidity, baseCollateral.decimals)} ${baseCollateral.symbol}`
//
// // Total Earnings
// `${bigNumberToString(totalEarnings || new BigNumber(0), baseCollateral.decimals)} ${baseCollateral.symbol}`
//
// // Your Earnings
// `${bigNumberToString(userEarnings, baseCollateral.decimals)} ${baseCollateral.symbol}`
// // ${userEarnings.gt(parseUnits('0.01', baseCollateral.decimals)) ? '+' : ''}
//
// // Current APR
// `${currentApr === Infinity ? '--' : formatNumber(String(currentApr))}%`
//
// // Total Rewards
// `${formatNumber(String(totalRewards))} OMN`
//
// // Rewards left
// `${formatNumber(String(remainingRewards))} OMN`
//
// // Your Rewards (if earnedRewards > 0 ? color=green : undefined)
// `${formatNumber(String(earnedRewards))} OMN`

// <TableCell key="Shares" align="right" variant="head" className={classes.header}>
//     {t('plugin_omen_market_my_shares')}
// </TableCell>
// <TableCell>
//     <Typography>
//         {/* MY SHARES */}
//     </Typography>
// </TableCell>

// <Grid item>
//     <Typography className={classes.title}>
//         {t('plugin_omen_market_pool_tokens')}
//     </Typography>
//     <Typography className={classes.title}>
//         {poolTokens}
//     </Typography>
// </Grid>

// <Grid item>
// <FormControl variant="outlined" className={classes.line}>
//     <TextField
//         label={t('plugin_omen_pool')}
//         variant="filled"
//         onChange={(e) => {
//             setInputAmount(new BigNumber((e.target as HTMLInputElement)?.value))
//         }}
//     />
// </FormControl>
// </Grid>
