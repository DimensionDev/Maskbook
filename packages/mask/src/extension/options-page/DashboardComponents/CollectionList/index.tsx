import { createContext, useState, useEffect } from 'react'
import { useUpdateEffect } from 'react-use'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ChainId, ERC721TokenCollectionInfo, NonFungibleAssetProvider, useCollections } from '@masknet/web3-shared-evm'
import { Image } from '../../../../components/shared/Image'
import { CollectibleList } from './CollectibleList'
import { useI18N } from '../../../../utils'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'grid',
        flexWrap: 'wrap',
        gridTemplateColumns: 'repeat(auto-fill, minmax(172px, 1fr))',
        gridGap: theme.spacing(1),
    },
    text: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
    },
    container: {
        height: 'calc(100% - 52px)',
        overflow: 'auto',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: theme.spacing(1),
    },
    description: {
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        alignSelf: 'stretch',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: '36px',
        paddingLeft: '8px',
    },
    loading: {
        position: 'absolute',
        bottom: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    collectionWrap: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'rgba(229,232,235,1)',
    },
    collectionImg: {
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
    },
}))

export interface CollectionListProps {
    chainId: ChainId
    address: string
}

export function CollectionList({ address, chainId }: CollectionListProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [page, setPage] = useState(0)
    const [counts, setCounts] = useState<number[]>([])
    const [rendCollections, setRendCollections] = useState<ERC721TokenCollectionInfo[]>([])

    const { value = { collections: [], hasNextPage: false } } = useCollections(
        chainId,
        address,
        NonFungibleAssetProvider.OPENSEA,
        page,
        3,
    )
    const { collections = [], hasNextPage } = value

    useUpdateEffect(() => {
        setPage(0)
        setRendCollections([])
    }, [address, chainId])

    useEffect(() => {
        if (!collections.length) return
        setRendCollections([...rendCollections, ...collections])
        if (!hasNextPage) return
        const timer = setTimeout(() => {
            setPage(page + 1)
        }, 3000)
        return () => {
            clearTimeout(timer)
        }
    }, [collections])

    if (!collections.length) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingTop: 4, paddingBottom: 4 }}>
                <Typography color="textPrimary">{t('dashboard_no_collection_found')}</Typography>
            </Box>
        )
    }

    return (
        <Box>
            {rendCollections.map((x, i) => (
                <Box key={i}>
                    <Box display="flex" alignItems="center" sx={{ marginTop: '16px' }}>
                        <Box className={classes.collectionWrap}>
                            {x.image ? <Image component="img" className={classes.collectionImg} src={x.image} /> : null}
                        </Box>
                        <Typography
                            className={classes.name}
                            color="textPrimary"
                            variant="body2"
                            sx={{ fontSize: '16px' }}>
                            {x.name}
                            {counts[i] ? `(${counts[i]})` : null}
                        </Typography>
                    </Box>
                    <CollectibleList
                        chainId={chainId}
                        address={address}
                        collection={x.slug}
                        setCount={(count) => {
                            counts[i] = count
                            setCounts(counts)
                        }}
                    />
                </Box>
            ))}
        </Box>
    )
}
