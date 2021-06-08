import { memo, useState } from 'react'
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
    const classes = useStyles()

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
        <>
            <Box className={classes.container}>
                {collectiblesLoading ? (
                    <LoadingPlaceholder />
                ) : collectiblesError || collectibles.length === 0 ? (
                    <EmptyPlaceholder prompt="No assets were found. Please add tokens" />
                ) : (
                    <CollectibleListUI dataSource={dataSource} chainId={chainId} provider={provider} />
                )}
            </Box>
            {!collectiblesLoading && !(page === 0 && dataSource.length === 0) ? (
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
                            onClick: () => setPage((prev) => prev - 1),
                            size: 'small',
                            disabled: page === 0,
                        }}
                        nextIconButtonProps={{
                            onClick: () => setPage((prev) => prev + 1),
                            disabled: !hasNextPage,
                            size: 'small',
                        }}
                    />
                </Box>
            ) : null}
        </>
    )
})

export interface CollectibleListUIProps {
    chainId: ChainId
    provider: CollectibleProvider
    dataSource: (ERC721TokenAssetDetailed | ERC1155TokenAssetDetailed)[]
}

export const CollectibleListUI = memo<CollectibleListUIProps>(({ chainId, provider, dataSource }) => {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            {dataSource.map((x) => (
                <div className={classes.card} key={x.tokenId}>
                    <CollectibleCard chainId={chainId} provider={provider} token={x} />
                </div>
            ))}
        </div>
    )
})
