import { t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { Spinner, TokenIcon } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { dividedBy, formatCompact } from '@masknet/web3-shared-base'
import { alpha, Box, Button, Typography } from '@mui/material'
import { memo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Warning } from '../../components/Warning.js'
import { RoutePaths } from '../../constants.js'
import { useSwap } from '../contexts/index.js'
import { useLiquidityResources } from '../hooks/useLiquidityResources.js'
import { useSwappable } from '../hooks/useSwappable.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
        boxSizing: 'border-box',
        padding: theme.spacing(2),
        gap: theme.spacing(3),
        scrollbarWidth: 'none',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    spinner: {
        width: 60,
    },
    title: {
        lineHeight: '24px',
        fontSize: 20,
        fontWeight: 700,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
    },
    countdown: {
        fontWeight: 700,
        color: theme.palette.maskColor.success,
    },
    note: {
        fontSize: 14,
        lineHeight: '18px',
    },
    box: {
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 12,
        padding: theme.spacing(1.5),
    },
    token: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
    },
    tokenTitle: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
    },
    tokenIcon: {
        height: 30,
        width: 30,
    },
    tokenInfo: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    tokenValue: {
        display: 'flex',
        lineHeight: '18px',
        flexDirection: 'column',
    },
    value: {
        fontSize: 14,
        fontWeight: 700,
    },
    fromToken: {
        fontSize: 13,
        fontWeight: 400,
        lineHeight: '18px',
    },
    network: {
        fontSize: 13,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
    toToken: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
        color: theme.palette.maskColor.success,
    },
    infoList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    infoRow: {
        display: 'flex',
        width: '100%',
        alignItems: 'flex-start',
        color: theme.palette.maskColor.main,
        justifyContent: 'space-between',
    },
    rowName: {
        fontSize: 14,
        display: 'flex',
        gap: theme.spacing(0.5),
        color: theme.palette.maskColor.second,
        alignItems: 'center',
        flexGrow: 1,
        marginRight: 'auto',
    },
    rowValue: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '18px',
        gap: theme.spacing(0.5),
        fontSize: 14,
    },
    link: {
        cursor: 'pointer',
        textDecoration: 'none',
        textAlign: 'right',
        color: theme.palette.maskColor.main,
    },
    footer: {
        flexShrink: 0,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
        boxSizing: 'content-box',
        display: 'flex',
        backgroundColor: alpha(theme.palette.maskColor.bottom, 0.8),
        backdropFilter: 'blur(16px)',
        padding: theme.spacing(2),
        borderRadius: '0 0 12px 12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        maxHeight: 40,
    },
}))

export const Transaction = memo(function Transaction() {
    const { classes, cx, theme } = useStyles()
    const navigate = useNavigate()
    const { fromToken, toToken, quote, chainId, disabledDexIds } = useSwap()
    const isLoading = true
    const [status, setStatus] = useState<'success' | 'failed'>('success')

    const { data: liquidityRes } = useLiquidityResources(chainId)
    const liquidityList = liquidityRes?.code === 0 ? liquidityRes.data : EMPTY_LIST
    const dexIdsCount = liquidityList.filter((x) => !disabledDexIds.includes(x.id)).length

    const [forwardCompare, setForwardCompare] = useState(true)
    const [baseToken, targetToken] =
        forwardCompare ? [quote?.fromToken, quote?.toToken] : [quote?.toToken, quote?.fromToken]
    const rate =
        quote ?
            forwardCompare && quote ?
                dividedBy(quote.toTokenAmount, quote.fromTokenAmount)
            :   dividedBy(quote.fromTokenAmount, quote.toTokenAmount)
        :   null

    const rateNode =
        baseToken && targetToken ?
            <>
                1 {baseToken.tokenSymbol} ≈ {formatCompact(rate!.toNumber())} {targetToken.tokenSymbol}
                <Icons.Cached
                    size={16}
                    color={theme.palette.maskColor.main}
                    onClick={() => setForwardCompare((v) => !v)}
                />
            </>
        :   null

    const [isSwappable, errorMessage] = useSwappable()

    return (
        <div className={classes.container}>
            <div className={classes.content}>
                {isLoading ?
                    <div className={classes.header}>
                        <Spinner className={classes.spinner} variant="loading" />
                        <Typography className={classes.title}>Swapping</Typography>
                        <Typography component="div" className={classes.subtitle}>
                            Your transaction should be done in{' '}
                            <Typography className={classes.countdown} component="span">
                                08:09
                            </Typography>
                        </Typography>
                    </div>
                : status === 'success' ?
                    <div className={classes.header}>
                        <Icons.FillSuccess size={72} />
                        <Typography className={classes.title}>
                            <Trans>Complete</Trans>
                        </Typography>
                    </div>
                :   <div className={classes.header}>
                        <Icons.BaseClose color={theme.palette.maskColor.danger} size={72} />
                        <Typography className={classes.title} color={theme.palette.maskColor.danger}>
                            <Trans>Failed</Trans>
                        </Typography>
                    </div>
                }
                <Typography className={cx(classes.box, classes.note)}>
                    <Trans>The swap is in progress. You can check its status in History after exiting this page.</Trans>
                </Typography>
                <div className={classes.box}>
                    <div className={classes.token}>
                        <Typography className={classes.tokenTitle}>
                            <Trans>From</Trans>
                        </Typography>
                        <div className={classes.tokenInfo}>
                            <TokenIcon
                                className={classes.tokenIcon}
                                chainId={fromToken?.chainId}
                                address={fromToken?.address || ''}
                                logoURL={fromToken?.logoURL}
                            />
                            <div className={classes.tokenValue}>
                                <Typography className={cx(classes.fromToken, classes.value)}>
                                    -0.99293 USDC.e3
                                </Typography>
                                <Typography className={classes.network}>Polygon</Typography>
                            </div>
                        </div>
                    </div>
                    <div className={classes.token}>
                        <Typography className={classes.tokenTitle}>
                            <Trans>To</Trans>
                        </Typography>
                        <div className={classes.tokenInfo}>
                            <TokenIcon
                                className={classes.tokenIcon}
                                chainId={toToken?.chainId}
                                address={toToken?.address || ''}
                                logoURL={toToken?.logoURL}
                            />
                            <div className={classes.tokenValue}>
                                <Typography className={cx(classes.toToken, classes.value)}>-0.99293 USDC.e3</Typography>
                                <Typography className={classes.network}>Polygon</Typography>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={classes.infoList}>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Trading mode</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>
                            <Trans>Aggregator</Trans>
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Rate</Trans>
                            <Icons.Questions size={16} />
                        </Typography>
                        <Typography className={classes.rowValue}>{rateNode}</Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>Network fee</Typography>
                        <Link className={cx(classes.rowValue, classes.link)} to={RoutePaths.NetworkFee}>
                            <Box display="flex" flexDirection="column">
                                <Typography>0.007155 MATIC ≈ $0.004434 </Typography>
                                <Typography>
                                    <Trans>Average</Trans>
                                </Typography>
                            </Box>
                            <Icons.ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Slippage</Trans>
                            <Icons.Questions size={16} />
                        </Typography>
                        <Typography className={classes.rowValue}>
                            0.5%
                            <Icons.ArrowRight size={20} />
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>Select liquidity</Typography>
                        <Typography
                            className={cx(classes.rowValue, classes.link)}
                            onClick={() => {
                                navigate(RoutePaths.SelectLiquidity)
                            }}>
                            {dexIdsCount}/{liquidityList.length}
                            <Icons.ArrowRight size={20} />
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Quote route</Trans>
                            <Icons.Questions size={16} />
                        </Typography>
                        <Typography className={classes.rowValue}>
                            🎉1.24
                            <Icons.ArrowRight />
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Trans>
                            <Typography className={classes.rowName}>
                                Powered by
                                <Icons.Questions size={16} />
                            </Typography>
                            <Typography className={classes.rowValue}>OKX</Typography>
                        </Trans>
                    </div>
                    <Warning description={t`Quote expired. Update to receive a new quote.`} />
                </div>
            </div>
            <div className={classes.footer}>
                <Button
                    fullWidth
                    onClick={() => {
                        //
                    }}>
                    <Icons.Connect />
                    <Trans>Check on Explorer</Trans>
                </Button>
            </div>
        </div>
    )
})
