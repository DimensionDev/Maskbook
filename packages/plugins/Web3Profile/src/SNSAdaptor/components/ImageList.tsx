import { Box, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import {
    useCollectibles,
    useCollections,
    ChainId,
    ERC721ContractDetailed,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { useI18N } from '../../locales'
import { ImageIcon } from './ImageIcon'
import { uniqBy } from 'lodash-unified'

const useStyles = makeStyles()((theme) => {
    console.log({ theme })
    return {
        wrapper: {},

        walletInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        walletName: {
            fontSize: '16px',
            fontWeight: 400,
            marginLeft: '4px',
        },
        collectionWrap: {
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            marginTop: '12px',
            marginRight: '5px',
            border: `1px solid ${theme.palette.divider}`,
            background: 'rgba(229,232,235,1)',
            cursor: 'pointer',
            '&:nth-child(5n)': {
                marginRight: 0,
            },
        },
    }
})

export interface ImageListProps extends withClasses<never | 'root'> {
    address?: string
}

export function ImageList(props: ImageListProps) {
    const { address } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainId = ChainId.Mainnet
    const { data: collectionsFormRemote } = useCollections(address, chainId)
    const {
        data: collectibles,
        state: loadingCollectibleDone,
        retry: retryFetchCollectible,
    } = useCollectibles(address, chainId)
    // const isLoading = loadingCollectibleDone !== SocketState.done
    // const renderWithRarible = useMemo(() => {
    //     if (isLoading) return []
    //     return collectibles.filter((item) => !item.collection)
    // }, [collectibles?.length])
    const collections = useMemo(() => {
        return uniqBy(
            collectibles.map((x) => x.contractDetailed),
            (x) => x.address.toLowerCase(),
        ).map((x) => {
            const item = collectionsFormRemote.find((c) => isSameAddress(c.address, x.address))
            if (item) {
                return {
                    name: item.name,
                    symbol: item.name,
                    baseURI: item.iconURL,
                    iconURL: item.iconURL,
                    address: item.address,
                } as ERC721ContractDetailed
            }
            return x
        })
    }, [collectibles.length, collectionsFormRemote.length])

    return (
        <div className={classes.wrapper}>
            <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>Listed</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {collections?.map((collection, i) => (
                    <div key={i} className={classes.collectionWrap}>
                        <ImageIcon size={49} borderRadius="12px" icon={collection?.iconURL} />
                    </div>
                ))}
            </Box>
            <Typography sx={{ fontSize: '16px', fontWeight: 700, marginTop: '12px' }}>Unlisted</Typography>
        </div>
    )
}
