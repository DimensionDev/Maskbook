import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales/index.js'
import { EmptyPlaceholder } from '../EmptyPlaceholder/index.js'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder/index.js'
import { FungibleTokenTableRow } from '../FungibleTokenTableRow/index.js'
import { DashboardRoutes, EMPTY_LIST, CrossIsolationMessages } from '@masknet/shared-base'
import {
    CurrencyType,
    FungibleAsset,
    isGreaterThanOrEqualTo,
    isLessThan,
    leftShift,
    minus,
    NetworkPluginID,
    toZero,
} from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID, useNativeToken } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { useContainer } from 'unstated-next'
import { Context } from '../../hooks/useContext'

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
    footer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationItem: {
        borderRadius: 4,
        border: `1px solid ${MaskColorVar.lineLight}`,
        color: MaskColorVar.textPrimary,
        '&.Mui-selected': {
            backgroundColor: MaskColorVar.blue,
            color: '#ffffff',
            border: 'none',
            '&:hover': {
                backgroundColor: MaskColorVar.blue,
            },
        },
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

    const onSwap = useCallback(
        (
            token: FungibleAsset<
                Web3Helper.Definition[NetworkPluginID]['ChainId'],
                Web3Helper.Definition[NetworkPluginID]['SchemaType']
            >,
        ) => {
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
        },
        [],
    )

    const onSend = useCallback(
        (
            token: FungibleAsset<
                Web3Helper.Definition[NetworkPluginID]['ChainId'],
                Web3Helper.Definition[NetworkPluginID]['SchemaType']
            >,
        ) => navigate(DashboardRoutes.WalletsTransfer, { state: { token } }),
        [],
    )

    const dataSource = useMemo(() => {
        const results =
            fungibleAssets.value?.filter((x) => !selectedChainId || x.chainId === selectedChainId) ?? EMPTY_LIST

        if (!selectedChainId)
            return results.sort((a, z) => {
                const aUSD = toZero(a.value?.[CurrencyType.USD] ?? '0')
                const zUSD = toZero(z.value?.[CurrencyType.USD] ?? '0')

                // token value
                if (!aUSD.isEqualTo(zUSD)) return minus(zUSD, aUSD).isPositive() ? 1 : -1

                return 0
            })

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

    return (
        <>
            <TokenTableUI
                isLoading={fungibleAssets.loading}
                isEmpty={!fungibleAssets.loading && (!!fungibleAssets.error || !fungibleAssets.value?.length)}
                isExpand={isExpand}
                dataSource={dataSource}
                onSwap={onSwap}
                onSend={onSend}
            />
            <MoreBarUI
                isLoading={fungibleAssets.loading}
                isEmpty={!fungibleAssets.loading && (!!fungibleAssets.error || !fungibleAssets.value?.length)}
                isExpand={isExpand}
                dataSource={dataSource}
                onSwitch={() => setIsExpand((x) => !x)}
            />
        </>
    )
})

export interface MoreBarUIProps {
    isEmpty: boolean
    isExpand: boolean
    isLoading: boolean
    dataSource: Array<
        FungibleAsset<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['SchemaType']
        >
    >
    onSwitch: () => void
}

export const MoreBarUI = memo<MoreBarUIProps>(({ isExpand, isEmpty, isLoading, dataSource, onSwitch }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const hasLowValueToken = !!dataSource.find(
        (x) => !isNativeTokenAddress(x.address) && isLessThan(x.value?.usd ?? 0, 1),
    )

    if (isEmpty || isLoading || !hasLowValueToken || !dataSource.length) return null
    if (isExpand)
        return (
            <Typography className={classes.more}>
                <span className={classes.moreBody} onClick={onSwitch}>
                    <span>
                        {t.wallets_assets_more_collapse({
                            direction: '<',
                        })}
                    </span>
                    <Icons.ArrowDrop style={{ transform: 'rotate(180deg)' }} />
                </span>
            </Typography>
        )
    return (
        <Typography className={classes.more}>
            <span className={classes.moreBody} onClick={onSwitch}>
                <span>
                    {t.wallets_assets_more_expand({
                        direction: '<',
                    })}
                </span>
                <Icons.ArrowDrop />
            </span>
        </Typography>
    )
})

export interface TokenTableUIProps {
    isEmpty: boolean
    isExpand: boolean
    isLoading: boolean
    dataSource: Array<
        FungibleAsset<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['SchemaType']
        >
    >
    onSwap(
        token: FungibleAsset<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['SchemaType']
        >,
    ): void
    onSend(
        token: FungibleAsset<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['SchemaType']
        >,
    ): void
}

export const TokenTableUI = memo<TokenTableUIProps>(({ onSwap, onSend, isLoading, isExpand, isEmpty, dataSource }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const currentPluginId = useCurrentWeb3NetworkPluginID()

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

                        {dataSource.length ? (
                            <TableBody>
                                {dataSource
                                    .sort((first, second) => {
                                        const firstValue = leftShift(first.balance, first.decimals)
                                        const secondValue = leftShift(second.balance, second.decimals)
                                        if (firstValue.isEqualTo(secondValue)) return 0
                                        return Number(firstValue.lt(secondValue))
                                    })
                                    .filter(
                                        (asset) =>
                                            isExpand ||
                                            isNativeTokenAddress(asset.address) ||
                                            isGreaterThanOrEqualTo(asset.value?.usd ?? 0, 1),
                                    )
                                    .map((asset) => {
                                        return (
                                            <FungibleTokenTableRow
                                                onSend={() => onSend(asset)}
                                                onSwap={() => onSwap(asset)}
                                                asset={asset}
                                                key={`${asset.address}_${asset.chainId}`}
                                            />
                                        )
                                    })}
                            </TableBody>
                        ) : null}
                    </Table>
                )}
            </TableContainer>
        </>
    )
})
