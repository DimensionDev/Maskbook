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
    ReloadStatus,
    TokenIcon,
} from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useAccount, useChainId, useFungibleTokenBalance, useNativeToken, useWeb3State } from '@masknet/web3-hooks-base'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { TokenType, formatBalance, formatCurrency, isSameAddress, leftShift } from '@masknet/web3-shared-base'
import { SchemaType, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Box, Button, Typography } from '@mui/material'
import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import urlcat from 'urlcat'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { PageTitleContext } from '../../../context.js'
import { useTitle } from '../../../hook/index.js'
import { ConfirmModal } from '../../../modals/modals.js'
import { ActionGroup } from '../components/index.js'
import { useAsset } from '../hooks/index.js'
import { useCoinStats } from './useCoinStats.js'
import { useTokenPrice } from './useTokenPrice.js'
import { useTrending } from './useTrending.js'
import { DIMENSION, TrendingChart } from './TrendingChart.js'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        page: {
            position: 'relative',
            height: '100%',
            overflow: 'auto',
            // space for action group.
            paddingBottom: 68,
            zIndex: 3,
        },
        deleteButton: {
            padding: 0,
            minWidth: 'auto',
            width: 'auto',
        },
        assetValue: {
            fontSize: 24,
            fontWeight: 700,
            textAlign: 'center',
        },
        tokenIcon: {
            marginRight: 4,
        },
        label: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.maskColor.second,
        },
        value: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
        },
        actions: {
            position: 'fixed',
            bottom: 0,
            right: 0,
            left: 0,
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
                backgroundImage: isDark
                    ? 'radial-gradient(50% 50.00% at 50% 50.00%, #443434 0%, rgba(68, 52, 52, 0.00) 100%)'
                    : 'radial-gradient(50% 50.00% at 50% 50.00%, #FFE9E9 0%, rgba(255, 233, 233, 0.00) 100%)',
            },
            '&:after': {
                position: 'absolute',
                left: '70%',
                top: 240,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage: isDark
                    ? 'radial-gradient(50% 50.00% at 50% 50.00%, #605675 0%, rgba(56, 51, 67, 0.00) 100%)'
                    : 'radial-gradient(50% 50.00% at 50% 50.00%, #F0E9FF 0%, rgba(240, 233, 255, 0.00) 100%)',
            },
        },
    }
})

const TokenDetail = memo(function TokenDetail() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { address } = useParams()
    const navigate = useNavigate()
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const isNativeToken = isNativeTokenAddress(address)
    const { data: balance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address)
    const asset = useAsset(chainId, address, account)
    const { data: tokenPrice } = useTokenPrice(chainId, address)
    const tokenValue = useMemo(() => {
        if (!asset?.decimals || !tokenPrice || !balance) return 0
        return leftShift(balance, asset.decimals).times(tokenPrice)
    }, [balance, asset?.decimals, tokenPrice])

    const { data: trending, isLoading: isLoadingTrending, isError } = useTrending(chainId, address)
    const priceChange =
        trending?.market?.price_change_percentage_24h_in_currency || trending?.market?.price_change_24h || 0

    const openSwapDialog = useCallback(async () => {
        const url = urlcat(
            'popups.html#/',
            PopupRoutes.Swap,
            !isSameAddress(nativeToken?.address, asset?.address)
                ? {
                      id: asset?.address,
                      name: asset?.name,
                      symbol: asset?.symbol,
                      contract_address: asset?.address,
                      decimals: asset?.decimals,
                  }
                : {},
        )
        openWindow(browser.runtime.getURL(url), 'SWAP_DIALOG')
    }, [asset, nativeToken])

    const [chartRange, setChartRange] = useState(TrendingAPI.Days.ONE_DAY)
    const { data: stats = EMPTY_LIST, refetch, isLoading: isLoadingStats } = useCoinStats(chainId, address, chartRange)

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
                        title: t('hide_token_symbol', { symbol: asset.symbol }),
                        message: t('hide_token_description', { symbol: asset.symbol }),
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
                    showSnackbar(t('hided_token_successfully'))
                    navigate(-1)
                }}>
                <Icons.Trash size={24} />
            </Button>,
        )
        return () => setExtension(undefined)
    }, [chainId, asset, isNativeToken, classes.deleteButton, showSnackbar, t])

    if (!asset) return null

    return (
        <div className={classes.halo}>
            <Box className={classes.page}>
                <Box padding={2}>
                    <Typography className={classes.assetValue}>
                        <FormattedCurrency value={tokenPrice} formatter={formatCurrency} />
                    </Typography>
                    <PriceChange change={priceChange} loading={isLoadingTrending} />
                    <PriceChartRange days={chartRange} onDaysChange={setChartRange} gap="10px" mt={2} />
                    {!isLoadingStats && isError ? (
                        <ReloadStatus
                            onRetry={refetch}
                            className={classes.trending}
                            height={DIMENSION.height}
                            width={DIMENSION.width}
                        />
                    ) : !isLoadingStats && !stats.length ? (
                        <EmptyStatus className={classes.trending} height={DIMENSION.height} width={DIMENSION.width}>
                            {t('not_enough_data_to_present')}
                        </EmptyStatus>
                    ) : (
                        <TrendingChart key={`${chainId}.${address}`} className={classes.trending} stats={stats} />
                    )}

                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                        <Box>
                            <Typography className={classes.label}>Balance</Typography>
                            <Typography component="div" className={classes.value}>
                                <TokenIcon
                                    className={classes.tokenIcon}
                                    address={asset.address}
                                    name={asset.name}
                                    chainId={asset.chainId}
                                    logoURL={asset.logoURL}
                                    size={16}
                                />
                                <FormattedBalance
                                    value={asset.balance}
                                    decimals={asset.decimals}
                                    significant={6}
                                    formatter={formatBalance}
                                />
                            </Typography>
                        </Box>
                        <Box textAlign="right">
                            <Typography className={classes.label}>value</Typography>
                            <Typography component="div" className={classes.value}>
                                {formatCurrency(tokenValue, 'USD', { onlyRemainTwoDecimal: true })}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                {isLoadingTrending ? (
                    <Box className={classes.info}>
                        <FungibleCoinMarketTableSkeleton />
                        <CoinMetadataTableSkeleton />
                    </Box>
                ) : (
                    <Box className={classes.info}>
                        <FungibleCoinMarketTable trending={trending} />
                        <CoinMetadataTable trending={trending} />
                    </Box>
                )}
                <ActionGroup address={address} className={classes.actions} onSwap={openSwapDialog} />
            </Box>
        </div>
    )
})

export default TokenDetail
