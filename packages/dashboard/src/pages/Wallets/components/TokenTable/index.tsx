import { memo, useCallback } from 'react'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { TokenTableRow } from '../TokenTableRow'
import {
    Asset,
    formatBalance,
    FungibleTokenDetailed,
    useAssets,
    useChainId,
    useTrustedERC20Tokens,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages } from '../../../../API'
import { RoutePaths } from '../../../../type'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles()((theme) => ({
    container: {
        height: 'calc(100% - 58px)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100% - 58px)',
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

export const TokenTable = memo(() => {
    const navigate = useNavigate()
    const chainId = useChainId()

    const trustedERC20Tokens = useTrustedERC20Tokens()
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const {
        error: detailedTokensError,
        loading: detailedTokensLoading,
        value: detailedTokens,
    } = useAssets(trustedERC20Tokens || [])

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
            dataSource={detailedTokens}
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
                <Box flex={1}>
                    {isLoading ? <LoadingPlaceholder /> : null}
                    {isEmpty ? <EmptyPlaceholder children={t.wallets_empty_tokens_tip()} /> : null}
                </Box>
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
