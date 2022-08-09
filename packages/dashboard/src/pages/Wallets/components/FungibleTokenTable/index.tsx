import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { FungibleTokenTableRow } from '../FungibleTokenTableRow'
import { DashboardRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import {
    CurrencyType,
    formatBalance,
    FungibleAsset,
    isGreaterThanOrEqualTo,
    isLessThan,
    minus,
    NetworkPluginID,
    TokenType,
    toZero,
} from '@masknet/web3-shared-base'
import {
    useCurrentWeb3NetworkPluginID,
    useFungibleAssets,
    useNativeToken,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { PluginMessages } from '../../../../API'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'

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
        fontSize: 14,
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        margin: theme.spacing(2, 0, 1),
    },
    moreButton: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0, 0.5),
    },
}))

interface TokenTableProps {
    selectedChainId?: Web3Helper.ChainIdAll
}

export const FungibleTokenTable = memo<TokenTableProps>(({ selectedChainId }) => {
    const navigate = useNavigate()
    const [isExpand, setIsExpand] = useState(false)
    const { value: nativeToken } = useNativeToken<'all'>(NetworkPluginID.PLUGIN_EVM, {
        chainId: selectedChainId,
    })
    const {
        value: fungibleAssets = EMPTY_LIST,
        loading: fungibleAssetsLoading,
        error: fungibleAssetsError,
    } = useFungibleAssets<'all'>(NetworkPluginID.PLUGIN_EVM, undefined, {
        chainId: selectedChainId,
    })
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const onSwap = useCallback(
        (
            token: FungibleAsset<
                Web3Helper.Definition[NetworkPluginID]['ChainId'],
                Web3Helper.Definition[NetworkPluginID]['SchemaType']
            >,
        ) => {
            openSwapDialog({
                open: true,
                traderProps: {
                    defaultInputCoin: {
                        id: token.id,
                        name: token.name || '',
                        symbol: token.symbol || '',
                        type: TokenType.Fungible,
                        contract_address: token.address,
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
        const results = fungibleAssets.filter((x) => !selectedChainId || x.chainId === selectedChainId)

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
    }, [nativeToken, fungibleAssets, selectedChainId])

    return (
        <>
            <TokenTableUI
                isLoading={fungibleAssetsLoading}
                isEmpty={!fungibleAssetsLoading && (!!fungibleAssetsError || !fungibleAssets?.length)}
                isExpand={isExpand}
                dataSource={dataSource}
                onSwap={onSwap}
                onSend={onSend}
            />
            <MoreBarUI
                isLoading={fungibleAssetsLoading}
                isEmpty={!fungibleAssetsLoading && (!!fungibleAssetsError || !fungibleAssets?.length)}
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
        (x) => !isNativeTokenAddress(x.address) && isLessThan(x.price?.usd ?? 0, 1),
    )

    if (isEmpty || isLoading || !hasLowValueToken || !dataSource.length) return null
    if (isExpand)
        return (
            <Typography className={classes.more}>
                <span>{t.wallets_assets_more_collapse()}</span>
                <span className={classes.moreButton} onClick={onSwitch}>
                    <Icons.ArrowUpRound />
                </span>
            </Typography>
        )
    return (
        <Typography className={classes.more}>
            <span>{t.wallets_assets_more_expand()}</span>
            <span className={classes.moreButton} onClick={onSwitch}>
                <span style={{ textDecoration: 'underline' }}>{t.wallets_assets_more_show_all()}</span>
                <Icons.ArrowUpRound style={{ transform: 'rotate(180deg)' }} />
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
                {isLoading || isEmpty ? (
                    <>
                        {isLoading ? (
                            <LoadingPlaceholder />
                        ) : isEmpty ? (
                            <EmptyPlaceholder children={t.wallets_empty_tokens_tip()} />
                        ) : null}
                    </>
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
                                        const firstValue = new BigNumber(
                                            formatBalance(first.balance, first.decimals) ?? '',
                                        )
                                        const secondValue = new BigNumber(
                                            formatBalance(second.balance, second.decimals) ?? '',
                                        )

                                        if (firstValue.isEqualTo(secondValue)) return 0

                                        return Number(firstValue.lt(secondValue))
                                    })
                                    .filter(
                                        (asset) =>
                                            isExpand ||
                                            isNativeTokenAddress(asset.address) ||
                                            isGreaterThanOrEqualTo(asset.value?.usd ?? 0, 1),
                                    )
                                    .map((asset) => (
                                        <FungibleTokenTableRow
                                            onSend={() => onSend(asset)}
                                            onSwap={() => onSwap(asset)}
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
