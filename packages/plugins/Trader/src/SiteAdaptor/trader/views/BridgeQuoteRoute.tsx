import { t } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { EmptyStatus } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNativeToken, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { leftShift } from '@masknet/web3-shared-base'
import { formatAmount, type ChainId } from '@masknet/web3-shared-evm'
import { Box, Radio, Typography } from '@mui/material'
import { sortBy } from 'lodash-es'
import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatTime } from '../../../helpers/formatTime.js'
import { bridges, RoutePaths } from '../../constants.js'
import { useTrade } from '../contexts/index.js'

const useStyles = makeStyles<void, 'active' | 'label' | 'fastestTag' | 'maxTag'>()((theme, _, refs) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing(0, 2),
        boxSizing: 'border-box',
        gap: theme.spacing(1),
    },
    active: {},
    box: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1.5),
        border: `1px solid ${theme.palette.maskColor.line}`,
        cursor: 'pointer',
        [`&.${refs.active}`]: {
            border: `1px solid ${theme.palette.maskColor.main}`,
        },
        position: 'relative',
    },
    radio: {
        marginLeft: 'auto',
    },
    control: {
        padding: 0,
    },
    boxTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    infoRow: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
        justifyContent: 'space-between',
    },
    rowName: {
        fontSize: 14,
        display: 'flex',
        gap: theme.spacing(0.5),
        alignItems: 'center',
        flexGrow: 1,
        marginRight: 'auto',
    },
    tags: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
    },
    labels: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    tag: {
        fontSize: 12,
        lineHeight: '16px',
        display: 'inline-flex',
        gap: theme.spacing(0.5),
        padding: theme.spacing(0.5),
        borderRadius: theme.spacing(0.5),
        backgroundColor: theme.palette.maskColor.bg,
        color: theme.palette.maskColor.main,
        textDecoration: 'none',
        [`&.${refs.label}`]: {
            padding: theme.spacing(0.5, 1),
        },
    },
    fastestTag: {},
    maxTag: {},
    label: {
        [`&.${refs.fastestTag}`]: {
            backgroundColor: theme.palette.maskColor.main,
            color: theme.palette.maskColor.bottom,
        },
        [`&.${refs.maxTag}`]: {
            backgroundColor: theme.palette.maskColor.bg,
            color: theme.palette.maskColor.main,
        },
    },
}))

export const BridgeQuoteRoute = memo(function BridgeQuoteRoute() {
    const { classes, theme, cx } = useStyles()
    const { bridgeQuote, fromToken, toToken, mode } = useTrade()
    const [bridgeId = bridgeQuote?.routerList[0].router.bridgeId, setBridgeId] = useState<number>()
    const chainId = fromToken?.chainId as ChainId
    const { data: price = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })

    if (!bridgeQuote?.routerList.length)
        return (
            <Box className={classes.container} justifyContent="center">
                <EmptyStatus />
            </Box>
        )
    const fastestItem = sortBy(bridgeQuote.routerList, (router) => -router.estimateTime)[0]
    const maxAmountItem = sortBy(bridgeQuote.routerList, (router) => -router.minimumReceived)[0]

    return (
        <div className={classes.container}>
            {bridgeQuote.routerList.map((router) => {
                const currBridgeId = router.router.bridgeId
                const logoUrl = bridges.find((x) => x.id === currBridgeId)?.logoUrl

                const gasValue = leftShift(router.fromChainNetworkFee, nativeToken?.decimals || 18)
                    .times(price)
                    .toFixed(2)
                return (
                    <div
                        className={cx(classes.box, bridgeId === currBridgeId ? classes.active : null)}
                        key={router.router.bridgeId}
                        onClick={() => {
                            setBridgeId(currBridgeId)
                        }}>
                        <Typography className={classes.boxTitle}>
                            <img src={logoUrl} width={16} height={16} />
                            {router.router.bridgeName}
                            <Radio
                                className={classes.radio}
                                classes={{ root: classes.control }}
                                checked={bridgeId === currBridgeId}
                                icon={<Icons.RadioButtonUnChecked size={18} />}
                                checkedIcon={
                                    <Icons.RadioButtonChecked
                                        size={18}
                                        color={theme.palette.maskColor.main}
                                        sx={{
                                            '--stroke-color': theme.palette.maskColor.bottom,
                                        }}
                                    />
                                }
                            />
                        </Typography>

                        <div className={classes.infoRow}>
                            <Typography className={classes.rowName} fontWeight={700}>
                                {formatAmount(router.toTokenAmount, -(toToken?.decimals || 0))}{' '}
                                {toToken?.symbol || '--'}
                            </Typography>
                        </div>
                        <div className={classes.labels}>
                            {router === fastestItem ?
                                <Typography
                                    className={cx(
                                        classes.tag,
                                        classes.label,
                                        classes.fastestTag,
                                    )}>{t`Fastest`}</Typography>
                            :   null}
                            {router === maxAmountItem ?
                                <Typography
                                    className={cx(
                                        classes.tag,
                                        classes.label,
                                        classes.maxTag,
                                    )}>{t`Max amount`}</Typography>
                            :   null}
                        </div>
                        <div className={classes.tags}>
                            <Typography className={classes.tag}>
                                <Icons.Time size={16} />
                                {formatTime(+router.estimateTime)}
                            </Typography>
                            <Typography className={classes.tag}>
                                <Icons.Gas size={16} />${gasValue}
                            </Typography>
                            <Typography
                                component={Link}
                                className={classes.tag}
                                to={{
                                    pathname: RoutePaths.TradingRoute,
                                    search: `?router-bridge-id=${currBridgeId}&mode=${mode}`,
                                }}>
                                Route info <Icons.ArrowRight size={16} />
                            </Typography>
                        </div>
                    </div>
                )
            })}
        </div>
    )
})
