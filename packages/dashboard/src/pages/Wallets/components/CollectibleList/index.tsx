import { Dispatch, memo, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Box, Stack, TablePagination } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    CollectibleProvider,
    ERC721TokenDetailed,
    EthereumTokenType,
    formatEthereumAddress,
    isSameAddress,
    useAccount,
    useChainId,
    useCollectibles,
    useWallet,
    useWeb3State,
} from '@masknet/web3-shared'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { CollectibleCard } from '../CollectibleCard'
import { useDashboardI18N } from '../../../../locales'
import { PluginMessages, PluginServices } from '../../../../API'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'
import { TransferTab } from '../Transfer'
import { useCollectibleOwners } from '../../hooks/useCollectibleOwners'

const useStyles = makeStyles()({
    root: {
        padding: '24px 26px 0px',
        display: 'flex',
        flexWrap: 'wrap',
    },
    card: {
        padding: '10px 14px',
    },
    footer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

interface CollectibleListProps {
    selectedChainId: ChainId | null
    provider: CollectibleProvider
}

export const CollectibleList = memo<CollectibleListProps>(({ selectedChainId, provider }) => {
    const [page, setPage] = useState(0)
    const navigate = useNavigate()
    const chainId = useChainId()
    const wallet = useWallet()
    const account = useAccount()
    const erc721Tokens = useWeb3State().erc721Tokens
    const { value: erc721TokensOwners = [], loading: loadingERC721Owners } = useCollectibleOwners(erc721Tokens)

    const onSend = useCallback(
        (detail: ERC721TokenDetailed) =>
            navigate(RoutePaths.WalletsTransfer, {
                state: {
                    type: TransferTab.Collectibles,
                    erc721Token: detail,
                },
            }),
        [],
    )

    const {
        value = { collectibles: [], hasNextPage: false },
        loading: collectiblesLoading,
        error: collectiblesError,
        retry,
    } = useCollectibles(account, selectedChainId, provider, page, 20)

    useEffect(() => {
        PluginMessages.Wallet.events.erc721TokensUpdated.on(() => {
            retry()
        })
    }, [retry])

    const { collectibles = [], hasNextPage } = value

    const dataSource = collectibles.filter((x) => {
        if (selectedChainId !== null && x.contractDetailed.chainId !== selectedChainId) return false

        const owner = erc721TokensOwners.find(
            (e) =>
                e && isSameAddress(e.contractDetailed.address, x.contractDetailed.address) && x.tokenId === e.tokenId,
        )
        if (owner && !isSameAddress(owner.info.owner, account)) {
            PluginServices.Wallet.removeToken(owner)
            return false
        }

        const key = `${formatEthereumAddress(x.contractDetailed.address)}_${x.tokenId}`
        switch (x.contractDetailed.type) {
            case EthereumTokenType.ERC721:
                return wallet?.erc721_token_blacklist ? !wallet?.erc721_token_blacklist.has(key) : true
            default:
                return false
        }
    })

    return (
        <CollectibleListUI
            isLoading={collectiblesLoading || loadingERC721Owners}
            isEmpty={!!collectiblesError || dataSource.length === 0}
            page={page}
            onPageChange={setPage}
            hasNextPage={hasNextPage}
            showPagination={!collectiblesLoading && !(page === 0 && dataSource.length === 0)}
            dataSource={dataSource}
            chainId={chainId}
            provider={provider}
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
    chainId: ChainId
    provider: CollectibleProvider
    dataSource: ERC721TokenDetailed[]
    onSend(detail: ERC721TokenDetailed): void
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
        provider,
        dataSource,
        onSend,
    }) => {
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
                                    <div className={classes.card} key={x.tokenId}>
                                        <CollectibleCard
                                            chainId={chainId}
                                            provider={provider}
                                            token={x}
                                            onSend={() => onSend(x)}
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
