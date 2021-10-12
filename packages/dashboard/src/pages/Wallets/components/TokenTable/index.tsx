import { memo, useCallback, useMemo } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { TokenTableRow } from '../TokenTableRow'
import {
    Asset,
    ChainId,
    createNativeToken,
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    getChainDetailed,
    getChainIdFromNetworkType,
    makeSortAssertWithoutChainFn,
    useAssets,
    useWeb3State,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages, PluginServices } from '../../../../API'
import { RoutePaths } from '../../../../type'
import { useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular,
        padding: '36px 0 12px',
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
    selectedChainId: ChainId | null
}

export const TokenTable = memo<TokenTableProps>(({ selectedChainId }) => {
    const navigate = useNavigate()

    const trustedERC20Tokens = useWeb3State().erc20Tokens
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const { value: networks } = useAsync(async () => PluginServices.Wallet.getSupportedNetworks(), [])
    const supportedNetworkNativeTokenAssets = useMemo(() => {
        if (selectedChainId || !networks) return []
        return networks.map((x) => {
            const chainId = getChainIdFromNetworkType(x)
            return {
                chain: getChainDetailed(chainId)?.shortName.toLowerCase() ?? 'unknown',
                token: createNativeToken(chainId),
                balance: '0',
            }
        })
    }, [selectedChainId, networks])

    const {
        error: detailedTokensError,
        loading: detailedTokensLoading,
        value: detailedTokens,
    } = useAssets(
        trustedERC20Tokens.filter((x) => !selectedChainId || x.chainId === selectedChainId) || [],
        selectedChainId === null ? 'all' : selectedChainId,
    )

    const assetsWithNativeToken = useMemo(() => {
        if (selectedChainId) return detailedTokens
        const assets = supportedNetworkNativeTokenAssets.filter(
            (x) =>
                !detailedTokens.find(
                    (t) => t.token.chainId === x.token.chainId && t.token.type === EthereumTokenType.Native,
                ),
        )
        return [...detailedTokens, ...assets].sort(makeSortAssertWithoutChainFn())
    }, [selectedChainId, supportedNetworkNativeTokenAssets, detailedTokens])

    const onSwap = useCallback((token: FungibleTokenDetailed) => {
        openSwapDialog({
            open: true,
            traderProps: {
                coin: {
                    id: token.address,
                    name: token.name ?? '',
                    symbol: token.symbol ?? '',
                    contract_address: token.address,
                    decimals: token.decimals,
                },
            },
        })
    }, [])

    const onSend = useCallback(
        (token: FungibleTokenDetailed) => navigate(RoutePaths.WalletsTransfer, { state: { token } }),
        [],
    )

    return (
        <TokenTableUI
            isLoading={detailedTokensLoading}
            isEmpty={!!detailedTokensError || !detailedTokens.length}
            dataSource={assetsWithNativeToken}
            onSwap={onSwap}
            onSend={onSend}
        />
    )
})

export interface TokenTableUIProps {
    isLoading: boolean
    isEmpty: boolean
    dataSource: Asset[]
    onSwap(token: FungibleTokenDetailed): void
    onSend(token: FungibleTokenDetailed): void
}

export const TokenTableUI = memo<TokenTableUIProps>(({ onSwap, onSend, isLoading, isEmpty, dataSource }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    return (
        <TableContainer className={classes.container}>
            {isLoading || isEmpty ? (
                <>
                    {isLoading ? <LoadingPlaceholder /> : null}
                    {isEmpty ? <EmptyPlaceholder children={t.wallets_empty_tokens_tip()} /> : null}
                </>
            ) : (
                <Table stickyHeader sx={{ padding: '0 44px' }}>
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
                            <TableCell key="Operation" align="center" variant="head" className={classes.header}>
                                {t.wallets_assets_operation()}
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    {dataSource.length ? (
                        <TableBody>
                            {dataSource
                                .sort((first, second) => {
                                    const firstValue = new BigNumber(formatBalance(first.balance, first.token.decimals))
                                    const secondValue = new BigNumber(
                                        formatBalance(second.balance, second.token.decimals),
                                    )

                                    if (firstValue.eq(secondValue)) return 0

                                    return Number(firstValue.lt(secondValue))
                                })
                                .map((asset, index) => (
                                    <TokenTableRow
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
