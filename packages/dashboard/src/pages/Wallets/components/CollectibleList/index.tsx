import { Dispatch, memo, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Box, Stack, TablePagination } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { CollectibleCard } from '../CollectibleCard'
import { useDashboardI18N } from '../../../../locales'
import { PluginMessages } from '../../../../API'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'
import { TransferTab } from '../Transfer'
import { useNetworkDescriptor, useWeb3State as useWeb3PluginState, Web3Plugin, useAccount } from '@masknet/plugin-infra'
import { useAsyncRetry } from 'react-use'

const useStyles = makeStyles()({
    root: {
        flex: 1,
        padding: '24px 26px 0px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 140px)',
        gridGap: '20px',
        justifyContent: 'space-between',
    },
    card: {},
    footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

interface CollectibleListProps {
    selectedNetwork: Web3Plugin.NetworkDescriptor | null
}

export const CollectibleList = memo<CollectibleListProps>(({ selectedNetwork }) => {
    const [page, setPage] = useState(0)
    const navigate = useNavigate()
    const account = useAccount()
    const { Asset } = useWeb3PluginState()
    const network = useNetworkDescriptor()

    const {
        value = { data: [], hasNextPage: false },
        loading: collectiblesLoading,
        error: collectiblesError,
        retry,
    } = useAsyncRetry(
        async () =>
            Asset?.getNonFungibleAssets?.(account, { page: page, size: 20 }, undefined, selectedNetwork ?? undefined),
        [account, Asset, network, page, selectedNetwork],
    )

    const onSend = useCallback(
        (detail: Web3Plugin.NonFungibleToken) =>
            navigate(RoutePaths.WalletsTransfer, {
                state: {
                    type: TransferTab.Collectibles,
                    erc721Token: detail,
                },
            }),
        [],
    )

    useEffect(() => {
        PluginMessages.Wallet.events.erc721TokensUpdated.on(() => {
            retry()
        })
    }, [retry])

    const { data: collectibles = [], hasNextPage } = value

    return (
        <CollectibleListUI
            isLoading={collectiblesLoading}
            isEmpty={!!collectiblesError || collectibles.length === 0}
            page={page}
            onPageChange={setPage}
            hasNextPage={hasNextPage}
            showPagination={!collectiblesLoading && !(page === 0 && collectibles.length === 0)}
            dataSource={collectibles}
            chainId={network?.chainId ?? 1}
            onSend={onSend}
        />
    )
})

export interface CollectibleListUIProps {
    page: number
    onPageChange: Dispatch<SetStateAction<number>>
    hasNextPage: boolean
    isLoading: boolean
    isEmpty: boolean
    showPagination: boolean
    chainId: number
    dataSource: Web3Plugin.NonFungibleToken[]
    onSend(detail: Web3Plugin.NonFungibleToken): void
}

export const CollectibleListUI = memo<CollectibleListUIProps>(
    ({ page, onPageChange, isLoading, isEmpty, hasNextPage, showPagination, chainId, dataSource, onSend }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()

        return (
            <Stack flexDirection="column" justifyContent="space-between" height="100%">
                <>
                    {isLoading ? (
                        <LoadingPlaceholder />
                    ) : isEmpty ? (
                        <EmptyPlaceholder children={t.wallets_empty_collectible_tip()} />
                    ) : (
                        <Box>
                            <div className={classes.root}>
                                {dataSource.map((x) => (
                                    <div className={classes.card} key={x.id}>
                                        <CollectibleCard
                                            chainId={chainId}
                                            token={x}
                                            onSend={() => onSend(x as unknown as any)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Box>
                    )}
                </>
                {showPagination ? (
                    <Box className={classes.footer}>
                        <TablePagination
                            count={-1}
                            component="div"
                            onPageChange={() => {}}
                            page={page}
                            rowsPerPage={20}
                            rowsPerPageOptions={[20]}
                            labelDisplayedRows={() => null}
                            backIconButtonProps={{
                                onClick: () => onPageChange((prev) => prev - 1),
                                size: 'small',
                                disabled: page === 0,
                            }}
                            nextIconButtonProps={{
                                onClick: () => onPageChange((prev) => prev + 1),
                                disabled: !hasNextPage,
                                size: 'small',
                            }}
                        />
                    </Box>
                ) : null}
            </Stack>
        )
    },
)
