import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import {
    Typography,
    Button,
    Grid,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
    LinearProgress,
} from '@mui/material'
import { useI18N } from '../../../utils'
import { OMEN_BASE_URL } from '../constants'
import { formatToShortNumber } from '../utils'
import { useFetchToken } from '../hooks/useToken'
import type { tokenData } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
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
            border: `1px solid ${theme.palette.divider}`,
        },
    },
    headerLeft: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        border: 'none',
        backgroundColor: MaskColorVar.primaryBackground,
        textAlign: 'left',
    },
    headerRight: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        border: 'none',
        backgroundColor: MaskColorVar.primaryBackground,
        textAlign: 'right',
    },
    buttonRow: {
        marginLeft: '75px',
    },
    progressBar: {
        marginTop: '20px',
        marginLeft: theme.spacing(4),
        width: '100%',
    },
    tokenAmount: {
        textAlign: 'right',
    },
}))

interface OmenSwapViewProps {
    marketId: string
    marketOutcomes: string[]
    marketOutcomePrices: BigNumber[]
    tokenId: string
}

export function OmenSwapView(props: OmenSwapViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { marketId, marketOutcomes, marketOutcomePrices, tokenId } = props
    const tokenDataRes = useFetchToken(tokenId)
    const tokenObj: tokenData | null | undefined = tokenDataRes ? tokenDataRes.value : undefined
    const collateralToken = tokenObj?.registeredToken
    const tokenSymbol = collateralToken ? collateralToken.symbol : ''
    let outcomeValSum = 0
    const outcomePricesFormatted: number[] = []
    for (const outcomeObj of marketOutcomePrices) {
        const tempOutputPrice = new BigNumber(outcomeObj)
        const outcomePrice = Number(tempOutputPrice.toFixed(3))
        outcomePricesFormatted.push(outcomePrice)
        outcomeValSum += tempOutputPrice.toNumber()
    }

    // #region the swap dialog
    // const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginOmenMessages.SwapDialogUpdated)
    const onSwapRequest = useCallback(
        (txType: string) => {
            if (!marketId || txType === '') return
            console.log('onSwapRequest txType: ', txType)
            console.log('onSwapRequest marketData: ', marketId)
            // openSwapDialog({
            //     open: true,
            //     marketId: marketId,
            //     txType: txType,
            // })
        },
        [marketId],
    )
    // #endregion

    return (
        <div className={classes.root}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell
                            key="Outcome-Probability"
                            align="center"
                            variant="head"
                            className={classes.headerLeft}>
                            {t('plugin_omen_market_outcome')}/{t('plugin_omen_market_probability')}
                        </TableCell>
                        <TableCell key="Price" align="center" variant="head" className={classes.headerRight}>
                            {t('plugin_omen_market_price')} ({tokenSymbol})
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {marketOutcomes.map((outcomeName: string, index: number) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Grid container item direction="row" wrap="nowrap" justifyItems="center">
                                    <Grid item>
                                        <Grid container item direction="column">
                                            <Grid item alignSelf="left" xs={4} textAlign="center">
                                                <Typography>{outcomeName}</Typography>
                                            </Grid>
                                            <Grid item alignSelf="right" xs={4} textAlign="center">
                                                <Typography>
                                                    {outcomeValSum > 0
                                                        ? formatToShortNumber(
                                                              new BigNumber(outcomePricesFormatted[index])
                                                                  .dividedBy(outcomeValSum)
                                                                  .toNumber(),
                                                          )
                                                        : 0}
                                                    %
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item width="100%">
                                        <LinearProgress
                                            variant="determinate"
                                            value={outcomePricesFormatted[index] * 100}
                                            className={classes.progressBar}
                                        />
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell className={classes.tokenAmount}>
                                <Typography>
                                    {outcomePricesFormatted[index]} {tokenSymbol}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Grid container item direction="row" className={classes.buttonRow}>
                <Grid item xs={4} textAlign="center">
                    <Button
                        className={classes.button}
                        variant="contained"
                        fullWidth
                        color="primary"
                        href={`${OMEN_BASE_URL}${marketId}/buy`}
                        target="_blank"
                    >
                        {t('plugin_omen_buy')}
                    </Button>
                </Grid>
                <Grid item xs={4} textAlign="center">
                    <Button
                        className={classes.button}
                        variant="contained"
                        fullWidth
                        color="primary"
                        href={`${OMEN_BASE_URL}${marketId}/sell`}
                        target="_blank"
                    >
                        {t('plugin_omen_sell')}
                    </Button>
                </Grid>
            </Grid>
        </div>
    )
}
