import { memo, useCallback, useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { FungibleTokenTableRow } from '../FungibleTokenTableRow'
import { useWeb3State } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages } from '../../../../API'
import { RoutePaths } from '../../../../type'
import { useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import {
    useNetworkDescriptor,
    useWeb3State as useWeb3PluginState,
    Web3Plugin,
    useAccount,
    NetworkPluginID,
    usePluginIDContext,
} from '@masknet/plugin-infra'

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
    const account = useAccount()
    const { Asset } = useWeb3PluginState()
    const { portfolioProvider } = useWeb3State()
    const network = useNetworkDescriptor()
    const [tokenUpdateCount, setTokenUpdateCount] = useState(0)
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const {
        error: detailedTokensError,
        loading: detailedTokensLoading,
        value: detailedTokens,
    } = useAsync(
        async () => Asset?.getFungibleAssets?.(account, portfolioProvider, network!),
        [account, Asset, portfolioProvider, tokenUpdateCount],
    )

    useEffect(() => {
        PluginMessages.Wallet.events.erc20TokensUpdated.on(() =>
            setTimeout(() => setTokenUpdateCount(tokenUpdateCount + 1), 100),
        )
    }, [])

    const onSwap = useCallback((token: Web3Plugin.FungibleToken) => {
        openSwapDialog({
            open: true,
            traderProps: {
                coin: {
                    id: token.id,
                    name: token.name ?? '',
                    symbol: token.symbol ?? '',
                    contract_address: token.address,
                    decimals: token.decimals,
                },
            },
        })
    }, [])

    const onSend = useCallback(
        (token: Web3Plugin.FungibleToken) => navigate(RoutePaths.WalletsTransfer, { state: { token } }),
        [],
    )

    return (
        <TokenTableUI
            isLoading={detailedTokensLoading}
            isEmpty={!detailedTokensLoading && (!!detailedTokensError || !detailedTokens?.length)}
            dataSource={(detailedTokens ?? []).filter((x) => !selectedChainId || x.chainId === selectedChainId)}
            onSwap={onSwap}
            onSend={onSend}
        />
    )
})

export interface TokenTableUIProps {
    isLoading: boolean
    isEmpty: boolean
    dataSource: Web3Plugin.Asset<Web3Plugin.FungibleToken>[]
    onSwap(token: Web3Plugin.FungibleToken): void
    onSend(token: Web3Plugin.FungibleToken): void
}

export const TokenTableUI = memo<TokenTableUIProps>(({ onSwap, onSend, isLoading, isEmpty, dataSource }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const currentPluginId = usePluginIDContext()
    const { Utils } = useWeb3PluginState()

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
                                    const firstValue = new BigNumber(
                                        Utils?.formatBalance?.(first.balance, first.token.decimals) ?? '',
                                    )
                                    const secondValue = new BigNumber(
                                        Utils?.formatBalance?.(second.balance, second.token.decimals) ?? '',
                                    )

                                    if (firstValue.eq(secondValue)) return 0

                                    return Number(firstValue.lt(secondValue))
                                })
                                .map((asset, index) => (
                                    <FungibleTokenTableRow
                                        onSend={() => onSend(asset.token)}
                                        onSwap={() => onSwap(asset.token)}
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
