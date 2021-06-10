import { Dispatch, memo, SetStateAction, useState } from 'react'
import { Box, makeStyles, filledInputClasses, TablePagination } from '@material-ui/core'
import {
    ChainId,
    ERC1155TokenAssetDetailed,
    ERC721TokenAssetDetailed,
    EthereumTokenType,
    useAccount,
    useChainId,
    useWallet,
} from '@dimensiondev/web3-shared'
import { useCurrentCollectibleDataProvider } from '../../api'
import { useCollectibles } from '../../hooks'
import { LoadingPlaceholder } from '../LoadingPlacholder'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { CollectibleCard } from '../CollectibleCard'
import type { CollectibleProvider } from '../../types'
import { useDashboardI18N } from '../../../../locales'

const useStyles = makeStyles(() => ({
    container: {
        padding: '24px 26px 0px',
        height: 'calc(100% - 58px)',
        maxHeight: 'calc(100% - 58px)',
        overflow: 'auto',
    },
    search: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    input: {
        [`& .${filledInputClasses.root}`]: {
            width: 298,
            fontSize: 13,
            lineHeight: 18,
        },
        [`& .${filledInputClasses.input}`]: {
            paddingTop: 15,
            paddingBottom: 15,
        },
    },
    root: {
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
}))

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
    } = useCollectibles(account, provider, page)

    const { collectibles = [], hasNextPage } = value

    const dataSource = collectibles.filter((x) => {
        const key = `${formatEthereumAddress(x.address)}_${x.tokenId}`
        switch (x.type) {
            case EthereumTokenType.ERC721:
                return wallet?.erc721_token_blacklist ? !wallet?.erc721_token_blacklist.has(key) : true
            case EthereumTokenType.ERC1155:
                return wallet?.erc1155_token_blacklist ? !wallet?.erc1155_token_blacklist.has(key) : true
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
    dataSource: (ERC721TokenAssetDetailed | ERC1155TokenAssetDetailed)[]
}

export const CollectibleListUI = memo<CollectibleListUIProps>(
    ({ page, onPageChange, isLoading, isEmpty, hasNextPage, showPagination, chainId, provider, dataSource }) => {
        const t = useDashboardI18N()
        const classes = useStyles()

        return (
            <>
                <Box className={classes.container}>
                    {isLoading ? (
                        <LoadingPlaceholder />
                    ) : isEmpty ? (
                        <EmptyPlaceholder prompt={t.wallets_empty_collectible_tip()} />
                    ) : (
                        <div className={classes.root}>
                            {dataSource.map((x) => (
                                <div className={classes.card} key={x.tokenId}>
                                    <CollectibleCard chainId={chainId} provider={provider} token={x} />
                                </div>
                            ))}
                        </div>
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
