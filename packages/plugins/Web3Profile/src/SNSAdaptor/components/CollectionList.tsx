import type { CollectionTypes } from '../types'
import { List, ListItem } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { NFTImageCollectibleAvatar } from '@masknet/shared'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { NetworkPluginID, TokenType } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({}))

interface CollectionListProps extends withClasses<never | 'root' | 'list' | 'collectionWrap'> {
    collections: CollectionTypes[]
    onList?: (key: string) => void
    size?: number
}
export function CollectionList(props: CollectionListProps) {
    const { collections, onList, size = 64 } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <List className={classes.list}>
            {collections.map((collection, i) => (
                <ListItem
                    key={collection?.key}
                    className={classes.collectionWrap}
                    onClick={() => onList?.(collection.key)}>
                    <NFTImageCollectibleAvatar
                        pluginId={collection?.platform ?? NetworkPluginID.PLUGIN_EVM}
                        size={size}
                        token={{
                            ...collection,
                            tokenId: collection.tokenId ?? '',
                            id: collection.address,
                            chainId: ChainId.Mainnet,
                            schema: SchemaType.ERC721,
                            type: TokenType.NonFungible,
                            contract: {
                                chainId: ChainId.Mainnet,
                                name: collection?.name ?? '',
                                symbol: '',
                                address: collection.address,
                                schema: SchemaType.ERC721,
                            },
                            metadata: {
                                imageURL: collection.iconURL,
                                chainId: ChainId.Mainnet,
                                name: '',
                                symbol: '',
                            },
                        }}
                    />
                </ListItem>
            ))}
        </List>
    )
}
