import { Dispatch, memo, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Stack, TablePagination } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { DashboardRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { CollectibleCard } from '../CollectibleCard'
import { useDashboardI18N } from '../../../../locales'
import { PluginMessages } from '../../../../API'
import { TransferTab } from '../Transfer'
import {
    useNetworkDescriptor,
    useWeb3State as useWeb3PluginState,
    Web3Plugin,
    useAccount,
    useCurrentWeb3NetworkPluginID,
    NetworkPluginID,
    useNonFungibleAssets,
} from '@masknet/plugin-infra/web3'
import { IteratorCollectorState } from '@masknet/web3-shared-base'

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

const ITEM_SIZE = {
    width: 150,
    height: 250,
}

export const CollectibleList = memo<CollectibleListProps>(({ selectedNetwork }) => {
    const [page, setPage] = useState(0)
    const navigate = useNavigate()
    const account = useAccount()
    const { Asset } = useWeb3PluginState()
    const network = useNetworkDescriptor()
    const [loadingSize, setLoadingSize] = useState(0)
    const [renderData, setRenderData] = useState<Web3Plugin.NonFungibleToken[]>([])

    const { data = EMPTY_LIST, status, retry } = useNonFungibleAssets(account, network?.chainId)
    const isQuerying = status !== IteratorCollectorState.done

    useEffect(() => {
        PluginMessages.Wallet.events.erc721TokensUpdated.on(() => retry())
    }, [retry])

    useEffect(() => {
        if (!loadingSize) return
        const render = data.slice(page * loadingSize, (page + 1) * loadingSize)
        setRenderData(render)
    }, [data, loadingSize, page])

    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const onSend = useCallback(
        (detail: Web3Plugin.NonFungibleToken) => {
            // Sending NFT is only available on EVM currently.
            if (currentPluginId !== NetworkPluginID.PLUGIN_EVM) return
            navigate(DashboardRoutes.WalletsTransfer, {
                state: {
                    type: TransferTab.Collectibles,
                    erc721Token: detail,
                },
            })
        },
        [currentPluginId],
    )

    const hasNextPage = (page + 1) * loadingSize < data.length
    const isLoading = renderData.length === 0 && isQuerying

    return (
        <CollectibleListUI
            isLoading={isLoading}
            isEmpty={!isQuerying && renderData.length === 0}
            page={page}
            onPageChange={setPage}
            hasNextPage={hasNextPage}
            showPagination={!isQuerying && !(page === 0 && !hasNextPage)}
            dataSource={renderData}
            chainId={network?.chainId ?? 1}
            onSend={onSend}
            setLoadingSize={(size) => setLoadingSize(size)}
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
    setLoadingSize(fn: (pre: number | undefined) => number): void
}

export const CollectibleListUI = memo<CollectibleListUIProps>(
    ({
        page,
        onPageChange,
        isLoading,
        isEmpty,
        hasNextPage,
        showPagination,
        chainId,
        dataSource,
        onSend,
        setLoadingSize,
    }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        const ref = useRef<HTMLDivElement>(null)

        useEffect(() => {
            if (!ref.current) return
            const width = ref.current.offsetWidth
            const height = ref.current.offsetHeight - 60
            const baseSize = Math.floor(width / ITEM_SIZE.width) * Math.floor(height / ITEM_SIZE.height)
            // Ensure load 10 NFTs at least.
            setLoadingSize((prev) => prev || Math.max(Math.floor(baseSize * 0.8), 10))
        }, [ref.current])

        return (
            <Stack flexDirection="column" justifyContent="space-between" height="100%" ref={ref}>
                {isLoading ? (
                    <LoadingPlaceholder />
                ) : isEmpty ? (
                    <EmptyPlaceholder children={t.wallets_empty_collectible_tip()} />
                ) : (
                    <Box>
                        <div className={classes.root}>
                            {dataSource.map((x, index) => (
                                <div className={classes.card} key={index}>
                                    <CollectibleCard
                                        chainId={chainId}
                                        token={x}
                                        renderOrder={index}
                                        // TODO: transfer not support multi chain, should remove is after supported
                                        onSend={() => onSend(x as unknown as any)}
                                    />
                                </div>
                            ))}
                        </div>
                    </Box>
                )}

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
