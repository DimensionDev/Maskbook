import { memo, useCallback, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { useNavigate } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { FungibleTokenTableRow } from '../FungibleTokenTableRow'
import { FungibleAsset, FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginMessages } from '../../../../API'
import { DashboardRoutes, EMPTY_LIST } from '@masknet/shared-base'
import {
    useNetworkDescriptor,
    useWeb3State,
    useAccount,
    useCurrentWeb3NetworkPluginID,
    Web3Helper,
} from '@masknet/plugin-infra/web3'

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
    const { Asset } = useWeb3State() as Web3Helper.Web3StateAll
    const network = useNetworkDescriptor()
    const [tokenUpdateCount, setTokenUpdateCount] = useState(0)
    // const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const {
        error: fungibleAssetsError,
        loading: fungibleAssetsLoading,
        value: fungibleAssets,
    } = useAsync(async () => Asset?.getFungibleAssets?.(account), [account, Asset])

    console.log('DEBUG: fungible token table')
    console.log({
        fungibleAssets,
    })

    useEffect(() => {
        // PluginMessages.Wallet.events.erc20TokensUpdated.on(() =>
        //     setTimeout(() => setTokenUpdateCount((prev) => prev + 1), 100),
        // )
    }, [])

    const onSwap = useCallback((token: FungibleToken<number, string>) => {
        // openSwapDialog({
        //     open: true,
        //     traderProps: {
        //         defaultInputCoin: {
        //             id: token.id,
        //             name: token.name || '',
        //             symbol: token.symbol || '',
        //             contract_address: token.address,
        //             decimals: token.decimals,
        //         },
        //     },
        // })
    }, [])

    const onSend = useCallback(
        (token: FungibleToken<number, string>) => navigate(DashboardRoutes.WalletsTransfer, { state: { token } }),
        [],
    )

    return (
        <TokenTableUI
            isLoading={fungibleAssetsLoading}
            isEmpty={!fungibleAssetsLoading && (!!fungibleAssetsError || !fungibleAssets?.data?.length)}
            dataSource={(fungibleAssets?.data ?? EMPTY_LIST).filter(
                (x) => !selectedChainId || x.chainId === selectedChainId,
            )}
            onSwap={onSwap}
            onSend={onSend}
        />
    )
})

export interface TokenTableUIProps {
    isLoading: boolean
    isEmpty: boolean
    dataSource: FungibleAsset<
        Web3Helper.Definition[NetworkPluginID]['ChainId'],
        Web3Helper.Definition[NetworkPluginID]['SchemaType']
    >[]
    onSwap(token: FungibleToken<number, string>): void
    onSend(token: FungibleToken<number, string>): void
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
                                    const firstValue = new BigNumber(
                                        Others?.formatBalance?.(first.balance, first.decimals) ?? '',
                                    )
                                    const secondValue = new BigNumber(
                                        Others?.formatBalance?.(second.balance, second.decimals) ?? '',
                                    )

                                    if (firstValue.isEqualTo(secondValue)) return 0

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
