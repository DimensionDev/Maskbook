import { Dispatch, memo, SetStateAction, useState } from 'react'
import { Box, ImageList, TablePagination } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    CollectibleProvider,
    ERC721TokenDetailed,
    EthereumTokenType,
    formatEthereumAddress,
    useAccount,
    useChainId,
    useCollectiblesPaged,
    useWallet,
} from '@masknet/web3-shared'
import { useCurrentCollectibleDataProvider } from '../../api'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { CollectibleCard } from '../CollectibleCard'
import { useDashboardI18N } from '../../../../locales'

const useStyles = makeStyles()({
    container: {
        padding: '24px 26px 0px',
        height: 'calc(100% - 58px)',
        maxHeight: 'calc(100% - 58px)',
        overflow: 'auto',
    },
    root: { display: 'flex', flexWrap: 'wrap' },
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

export const CollectibleList = memo(() => {
    const [page, setPage] = useState(0)
    const chainId = useChainId()
    const wallet = useWallet()
    const account = useAccount()
    const provider = useCurrentCollectibleDataProvider()

    const {
        value = { collectibles: [], hasNextPage: false },
        loading: collectiblesLoading,
        error: collectiblesError,
    } = useCollectiblesPaged(page, 11)

    const { collectibles = [], hasNextPage } = value

    const dataSource = collectibles.filter((x) => {
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
            isLoading={collectiblesLoading}
            isEmpty={!!collectiblesError || collectibles.length === 0}
            page={page}
            onPageChange={setPage}
            hasNextPage={hasNextPage}
            showPagination={!collectiblesLoading && !(page === 0 && dataSource.length === 0)}
            dataSource={dataSource}
            chainId={chainId}
            provider={provider}
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
}

export const CollectibleListUI = memo<CollectibleListUIProps>(
    ({ page, onPageChange, isLoading, isEmpty, hasNextPage, showPagination, chainId, provider, dataSource }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        return (
            <>
                <Box className={classes.container}>
                    {isLoading ? (
                        <LoadingPlaceholder />
                    ) : isEmpty ? (
                        <EmptyPlaceholder children={t.wallets_empty_collectible_tip()} />
                    ) : (
                        <ImageList
                            variant="quilted"
                            cols={6}
                            gap={24}
                            rowHeight={200}
                            sx={{ width: '100%', height: 'auto' }}>
                            {dataSource.map((token) => (
                                <CollectibleCard
                                    key={token.tokenId + token.contractDetailed.address}
                                    chainId={chainId}
                                    provider={provider}
                                    token={token}
                                />
                            ))}
                        </ImageList>
                    )}
                </Box>
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
            </>
        )
    },
)
