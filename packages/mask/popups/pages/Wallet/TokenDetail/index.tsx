import { Icons } from '@masknet/icons'
import {
    CoinMetadataTable,
    CoinMetadataTableSkeleton,
    EmptyStatus,
    FormattedBalance,
    FormattedCurrency,
    FungibleCoinMarketTable,
    FungibleCoinMarketTableSkeleton,
    PriceChange,
    PriceChartRange,
    ProgressiveText,
    ReloadStatus,
    TokenIcon,
} from '@masknet/shared'
import { Days, EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { MaskDarkTheme, MaskLightTheme, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useAccount, useFungibleTokenBalance, useWeb3State } from '@masknet/web3-hooks-base'
import { TokenType, formatBalance, formatCurrency, leftShift } from '@masknet/web3-shared-base'
import { type ChainId, SchemaType, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, ThemeProvider, Typography } from '@mui/material'
import React, { memo, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { PageTitleContext, useTitle, useTokenParams } from '../../../hooks/index.js'
import { ConfirmModal } from '../../../modals/modal-controls.js'
import { ActionGroup } from '../components/index.js'
import { useAsset } from '../hooks/index.js'
import { DIMENSION, TrendingChart } from './TrendingChart.js'
import { useCoinTrendingStats } from './useCoinTrendingStats.js'
import { useTokenPrice } from './useTokenPrice.js'
import { useTrending } from './useTrending.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles<{ valueAlign: 'left' | 'center' }>()((theme, { valueAlign }) => {
    return {
        assetValue: {
            fontSize: 24,
            fontWeight: 700,
            textAlign: 'center',
            display: 'flex',
            justifyContent: valueAlign,
        },
        priceChange: {
            fontSize: 16,
        },
        tokenIcon: {
            marginRight: 4,
            fontSize: 12,
        },
        label: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.maskColor.second,
            textTransform: 'capitalize',
        },
        value: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
        },
        trending: {
            display: 'flex',
            boxSizing: 'border-box',
            margin: theme.spacing(2, 'auto', 0),
        },
        info: {
            backgroundColor: theme.palette.maskColor.bottom,
            borderRadius: '20px 20px 0 0',
            padding: theme.spacing(2),
            boxShadow: theme.palette.maskColor.bottomBg,
            backdropFilter: 'blur(8px)',
        },
    }
})
const usePageStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        page: {
            position: 'relative',
            height: '100%',
            overflow: 'auto',
            // space for action group.
            paddingBottom: 68,
            zIndex: 3,
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        deleteButton: {
            padding: 0,
            minWidth: 'auto',
            width: 'auto',
        },
        actions: {
            position: 'fixed',
            bottom: 0,
            right: 0,
            left: 0,
        },
        halo: {
            position: 'relative',
            zIndex: 1,
            overflowX: 'hidden',
            height: '100%',
            '&:before': {
                position: 'absolute',
                left: '-10%',
                top: 240,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage:
                    isDark ?
                        'radial-gradient(50% 50.00% at 50% 50.00%, #443434 0%, rgba(68, 52, 52, 0.00) 100%)'
                    :   'radial-gradient(50% 50.00% at 50% 50.00%, #FFE9E9 0%, rgba(255, 233, 233, 0.00) 100%)',
            },
            '&:after': {
                position: 'absolute',
                left: '70%',
                top: 240,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage:
                    isDark ?
                        'radial-gradient(50% 50.00% at 50% 50.00%, #605675 0%, rgba(56, 51, 67, 0.00) 100%)'
                    :   'radial-gradient(50% 50.00% at 50% 50.00%, #F0E9FF 0%, rgba(240, 233, 255, 0.00) 100%)',
            },
        },
    }
})

export const Component = memo(function TokenDetailPage() {
    const { classes, theme } = usePageStyles()
    const t = useMaskSharedTrans()
    const { chainId, address } = useTokenParams()
    const navigate = useNavigate()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const isNativeToken = isNativeTokenAddress(address)
    const asset = useAsset(chainId, address, account)

    useTitle(asset ? `${asset.symbol}(${asset.name})` : 'Loading Asset...')
    const { showSnackbar } = usePopupCustomSnackbar()
    const { setExtension } = useContext(PageTitleContext)
    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    useEffect(() => {
        if (!asset || isNativeToken) return
        setExtension(
            <Button
                variant="text"
                className={classes.deleteButton}
                onClick={async () => {
                    const result = await ConfirmModal.openAndWaitForClose({
                        title: <Trans>Hide {asset.symbol}</Trans>,
                        message: (
                            <Trans>
                                Confirm to hide {asset.symbol}? You can redisplay it by re-adding this token at any
                                time.
                            </Trans>
                        ),
                    })
                    if (!result) return
                    // Actually, blocking.
                    await Token?.blockToken?.(account, {
                        id: asset.address,
                        chainId,
                        type: TokenType.Fungible,
                        schema: SchemaType.ERC20,
                        address: asset.address,
                    })
                    showSnackbar(<Trans>Asset is hidden.</Trans>)
                    navigate(-1)
                }}>
                <Icons.EyeOff size={24} />
            </Button>,
        )
        return () => setExtension(undefined)
    }, [chainId, asset, isNativeToken, classes.deleteButton, showSnackbar, t, account])

    return (
        <div className={classes.halo}>
            <Box className={classes.page}>
                <TokenDetailUI address={address} chainId={chainId}>
                    <ThemeProvider theme={theme.palette.mode === 'light' ? MaskDarkTheme : MaskLightTheme}>
                        <ActionGroup className={classes.actions} chainId={chainId} address={address} asset={asset} />
                    </ThemeProvider>
                </TokenDetailUI>
            </Box>
        </div>
    )
})

export interface TokenDetailUIProps extends React.PropsWithChildren {
    chainId: ChainId
    address: string
    hideChart?: boolean
    valueAlign?: 'left' | 'center'
}
export const TokenDetailUI = memo(function TokenDetailUI(props: TokenDetailUIProps) {
    const { chainId, address, hideChart, valueAlign = 'center' } = props

    const { classes } = useStyles({ valueAlign })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const asset = useAsset(chainId, address, account)
    const { data: balance = asset?.balance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address, { chainId })
    const [chartRange, setChartRange] = useState(Days.ONE_DAY)
    const {
        data: stats = EMPTY_LIST,
        refetch,
        isPending: isLoadingStats,
    } = useCoinTrendingStats(chainId, address, chartRange)
    const { data: tokenPrice = stats.at(-1)?.[1], isPending: isLoadingPrice } = useTokenPrice(chainId, address)
    const tokenValue = useMemo(() => {
        if (asset?.value?.usd) return asset.value.usd
        if (!asset?.decimals || !tokenPrice || !balance) return 0
        return leftShift(balance, asset.decimals).times(tokenPrice)
    }, [balance, asset, tokenPrice])

    const { data: trending, isPending: isLoadingTrending, isError } = useTrending(chainId, address)
    const priceChange =
        trending?.market?.price_change_percentage_24h_in_currency || trending?.market?.price_change_24h || 0

    return (
        <>
            <Box padding={2}>
                <ProgressiveText className={classes.assetValue} loading={isLoadingPrice} skeletonWidth={80}>
                    {typeof tokenPrice !== 'undefined' ?
                        <FormattedCurrency value={tokenPrice} formatter={formatCurrency} />
                    :   null}
                </ProgressiveText>
                {hideChart ? null : (
                    <>
                        <PriceChange className={classes.priceChange} change={priceChange} loading={isLoadingTrending} />
                        <PriceChartRange days={chartRange} onDaysChange={setChartRange} gap="10px" mt={2} />
                        {!isLoadingStats && isError ?
                            <ReloadStatus
                                onRetry={refetch}
                                className={classes.trending}
                                height={DIMENSION.height}
                                width={DIMENSION.width}
                            />
                        : !isLoadingStats && !stats.length ?
                            <EmptyStatus className={classes.trending} height={DIMENSION.height} width={DIMENSION.width}>
                                <Trans>Not enough data to present.</Trans>
                            </EmptyStatus>
                        :   <TrendingChart key={`${chainId}.${address}`} className={classes.trending} stats={stats} />}
                    </>
                )}

                <Box display="flex" flexDirection="row" justifyContent="space-between">
                    <Box>
                        <Typography className={classes.label}>
                            <Trans>Balance</Trans>
                        </Typography>
                        {asset ?
                            <Typography component="div" className={classes.value} justifyContent="flex-start">
                                <TokenIcon
                                    className={classes.tokenIcon}
                                    address={asset.address}
                                    name={asset.name}
                                    chainId={asset.chainId}
                                    logoURL={asset.logoURL}
                                    size={16}
                                />
                                <FormattedBalance
                                    value={balance}
                                    decimals={asset.decimals}
                                    significant={6}
                                    formatter={formatBalance}
                                />
                            </Typography>
                        :   <Typography component="div" className={classes.value}>
                                <Skeleton className={classes.tokenIcon} variant="circular" width={16} height={16} />
                                <Skeleton variant="text" width={30} />
                            </Typography>
                        }
                    </Box>
                    <Box textAlign="right">
                        <Typography className={classes.label}>
                            <Trans>value</Trans>
                        </Typography>
                        <Typography component="div" className={classes.value} justifyContent="flex-end">
                            <FormattedCurrency value={tokenValue} formatter={formatCurrency} />
                        </Typography>
                    </Box>
                </Box>
            </Box>
            {isLoadingTrending ?
                <Box className={classes.info}>
                    <FungibleCoinMarketTableSkeleton />
                    <CoinMetadataTableSkeleton />
                </Box>
            :   <Box className={classes.info}>
                    <FungibleCoinMarketTable trending={trending} />
                    <CoinMetadataTable trending={trending} />
                </Box>
            }
            {props.children}
        </>
    )
})
