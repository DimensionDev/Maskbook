import { memo, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { FungibleTokenTableRow } from '../FungibleTokenTableRow'
import { CurrencyType, formatBalance, FungibleAsset, minus, NetworkPluginID, toZero } from '@masknet/web3-shared-base'
import { DashboardRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { useCurrentWeb3NetworkPluginID, useFungibleAssets, useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { PluginMessages } from '../../../../API'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
}))

interface TokenTableProps {
    selectedChainId: number | null
}

export const FungibleTokenTable = memo<TokenTableProps>(({ selectedChainId }) => {
    const navigate = useNavigate()
    const {
        value: fungibleAssets = EMPTY_LIST,
        loading: fungibleAssetsLoading,
        error: fungibleAssetsError,
    } = useFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    useEffect(() => {
        // PluginMessages.Wallet.events.erc20TokensUpdated.on(() =>
        //     setTimeout(() => setTokenUpdateCount((prev) => prev + 1), 100),
        // )
    }, [])

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

                // // token balance
                // if (!aBalance.isEqualTo(zBalance)) return minus(zBalance, aBalance).isPositive() ? 1 : -1

                return 0
            })

        return results
    }, [fungibleAssets, selectedChainId])

    return (
        <TokenTableUI
            isLoading={fungibleAssetsLoading}
            isEmpty={!fungibleAssetsLoading && (!!fungibleAssetsError || !fungibleAssets?.length)}
            dataSource={dataSource}
            onSwap={onSwap}
            onSend={onSend}
        />
    )
})

export interface TokenTableUIProps {
    isLoading: boolean
    isEmpty: boolean
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

export const TokenTableUI = memo<TokenTableUIProps>(({ onSwap, onSend, isLoading, isEmpty, dataSource }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const { Others } = useWeb3State()

    return (
        <TableContainer className={classes.container}>
            {isLoading || isEmpty ? (
                <>
                    {isLoading ? <LoadingPlaceholder /> : null}
                    {isEmpty ? <EmptyPlaceholder children={t.wallets_empty_tokens_tip()} /> : null}
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
                                    const firstValue = new BigNumber(formatBalance(first.balance, first.decimals) ?? '')
                                    const secondValue = new BigNumber(
                                        formatBalance(second.balance, second.decimals) ?? '',
                                    )

                                    if (firstValue.isEqualTo(secondValue)) return 0

                                    return Number(firstValue.lt(secondValue))
                                })
                                .map((asset, index) => (
                                    <FungibleTokenTableRow
                                        onSend={() => onSend(asset)}
                                        onSwap={() => onSwap(asset)}
                                        asset={asset}
                                        key={index}
                                    />
                                ))}
                        </TableBody>
                    ) : null}
                </Table>
            )}
        </TableContainer>
    )
})
