import { Icons } from '@masknet/icons'
import { CrossIsolationMessages, DashboardRoutes, EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { MaskColorVar, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNativeToken, useNetworkContext } from '@masknet/web3-hooks-base'
import { CurrencyType, isGreaterThanOrEqualTo, isLessThan, leftShift, minus, toZero } from '@masknet/web3-shared-base'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContainer } from 'unstated-next'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder/index.js'
import { useDashboardI18N } from '../../../../locales/index.js'
import { Context } from '../../hooks/useContext.js'
import { EmptyPlaceholder } from '../EmptyPlaceholder/index.js'
import { FungibleTokenTableRow } from '../FungibleTokenTableRow/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    table: {
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(5),
        [theme.breakpoints.down('lg')]: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
        },
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        padding: '12px 0 12px',
        backgroundColor: MaskColorVar.primaryBackground,
        border: 'none',
    },
    more: {
        textAlign: 'center',
    },
    moreBody: {
        display: 'inline-flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing(1, 2),
        gap: 2,
        fontWeight: 600,
        margin: theme.spacing(2, 'auto', 1),
        cursor: 'pointer',
        borderRadius: 20,
        backgroundColor: theme.palette.maskColor.bg,
    },
}))

export interface FungibleTokenTableProps {
    selectedChainId?: Web3Helper.ChainIdAll
}

export const FungibleTokenTable = memo<FungibleTokenTableProps>(({ selectedChainId }) => {
    const navigate = useNavigate()
    const [isExpand, setIsExpand] = useState(false)
    const { value: nativeToken } = useNativeToken<'all'>(NetworkPluginID.PLUGIN_EVM, {
        chainId: selectedChainId,
    })
    const { fungibleAssets } = useContainer(Context)

    const onSwap = useCallback((token: Web3Helper.FungibleAssetAll) => {
        return CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
            open: true,
            traderProps: {
                defaultInputCoin: {
                    name: token.name || '',
                    symbol: token.symbol || '',
                    address: token.address,
                    decimals: token.decimals,
                },
            },
        })
    }, [])

    const onSend = useCallback(
        (token: Web3Helper.FungibleAssetAll) => navigate(DashboardRoutes.WalletsTransfer, { state: { token } }),
        [],
    )

    const dataSource = useMemo(() => {
        const results =
            fungibleAssets.value.filter((x) => !selectedChainId || x.chainId === selectedChainId) ?? EMPTY_LIST

        if (!selectedChainId) {
            return results.sort((a, z) => {
                const aUSD = toZero(a.value?.[CurrencyType.USD] ?? '0')
                const zUSD = toZero(z.value?.[CurrencyType.USD] ?? '0')

                // token value
                if (!aUSD.isEqualTo(zUSD)) return minus(zUSD, aUSD).isPositive() ? 1 : -1

                return 0
            })
        }

        if (!results.length && nativeToken) {
            return [
                {
                    ...nativeToken,
                    balance: '0',
                },
            ]
        }

        return results
    }, [nativeToken, fungibleAssets.value, selectedChainId])

    const handleSwitch = useCallback(() => {
        setIsExpand((x) => !x)
    }, [])

    const hasLowValueToken = useMemo(() => {
        return !!dataSource.find((x) => !isNativeTokenAddress(x.address) && isLessThan(x.value?.usd ?? 0, 1))
    }, [dataSource])

    const sortedData = useMemo(() => {
        return dataSource.sort((first, second) => {
            const firstValue = leftShift(first.balance, first.decimals)
            const secondValue = leftShift(second.balance, second.decimals)
            if (firstValue.isEqualTo(secondValue)) return 0
            return Number(firstValue.lt(secondValue))
        })
    }, [dataSource])

    const visibleData = useMemo(() => {
        if (isExpand) return sortedData
        return sortedData.filter((asset) => {
            return isNativeTokenAddress(asset.address) || isGreaterThanOrEqualTo(asset.value?.usd ?? 0, 1)
        })
    }, [isExpand, sortedData])

    return (
        <>
            <TokenTableUI
                isLoading={fungibleAssets.loading}
                isEmpty={!fungibleAssets.loading && (!!fungibleAssets.error || !fungibleAssets.value.length)}
                isExpand={isExpand}
                data={visibleData}
                onSwap={onSwap}
                onSend={onSend}
            />
            <MoreBarUI
                isLoading={fungibleAssets.loading}
                isEmpty={!fungibleAssets.loading && (!!fungibleAssets.error || !fungibleAssets.value.length)}
                isExpand={isExpand}
                hasLowValueToken={hasLowValueToken}
                onSwitch={handleSwitch}
            />
        </>
    )
})

FungibleTokenTable.displayName = 'FungibleTokenTable'

export interface MoreBarUIProps {
    isEmpty: boolean
    isExpand: boolean
    isLoading: boolean
    hasLowValueToken: boolean
    onSwitch: () => void
}

export const MoreBarUI = memo<MoreBarUIProps>(({ isExpand, isEmpty, isLoading, hasLowValueToken, onSwitch }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()

    if (isEmpty || isLoading || !hasLowValueToken) return null
    return (
        <Typography className={classes.more}>
            <span className={classes.moreBody} onClick={onSwitch}>
                <span>
                    {t.wallets_assets_more({
                        symbol: '<',
                        context: isExpand ? 'expanded' : 'collapsed',
                    })}
                </span>
                <Icons.ArrowDrop style={{ transform: isExpand ? 'rotate(180deg)' : undefined }} />
            </span>
        </Typography>
    )
})

MoreBarUI.displayName = 'MoreBarUI'

export interface TokenTableUIProps {
    isEmpty: boolean
    isExpand: boolean
    isLoading: boolean
    data: Web3Helper.FungibleAssetAll[]
    onSwap(token: Web3Helper.FungibleAssetAll): void
    onSend(token: Web3Helper.FungibleAssetAll): void
}

export const TokenTableUI = memo<TokenTableUIProps>(({ onSwap, onSend, isLoading, isExpand, isEmpty, data }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { pluginID: currentPluginId } = useNetworkContext()

    return (
        <>
            <TableContainer className={classes.container}>
                {isLoading ? (
                    <LoadingPlaceholder />
                ) : isEmpty ? (
                    <EmptyPlaceholder children={t.wallets_empty_tokens_tip()} />
                ) : (
                    <Table stickyHeader className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell key="Asset" align="center" variant="head" className={classes.header}>
                                    {t.wallets_assets_asset()}
                                </TableCell>
                                <TableCell key="Balance" align="center" variant="head" className={classes.header}>
                                    {t.wallets_assets_balance()}
                                </TableCell>
                                <TableCell key="Price" align="center" variant="head" className={classes.header}>
                                    {t.wallets_assets_price()}
                                </TableCell>
                                <TableCell key="Value" align="center" variant="head" className={classes.header}>
                                    {t.wallets_assets_value()}
                                </TableCell>
                                {currentPluginId === NetworkPluginID.PLUGIN_EVM && (
                                    <TableCell key="Operation" align="center" variant="head" className={classes.header}>
                                        {t.wallets_assets_operation()}
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>

                        {data.length ? (
                            <TableBody>
                                {data.map((asset) => (
                                    <FungibleTokenTableRow
                                        onSend={onSend}
                                        onSwap={onSwap}
                                        asset={asset}
                                        key={`${asset.address}_${asset.chainId}`}
                                    />
                                ))}
                            </TableBody>
                        ) : null}
                    </Table>
                )}
            </TableContainer>
        </>
    )
})

TokenTableUI.displayName = 'TokenTableUI'
