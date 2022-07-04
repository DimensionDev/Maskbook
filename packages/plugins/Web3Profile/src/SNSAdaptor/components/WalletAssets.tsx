import { Card, Typography, Link, List, ListItem, Box } from '@mui/material'
import { Edit2Icon, LinkOutIcon } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
import { ImageIcon } from './ImageIcon'
import { useReverseAddress } from '@masknet/plugin-infra/web3'
import type { CollectionTypes } from '../types'
import { ChainId, explorerResolver, NETWORK_DESCRIPTORS, SchemaType } from '@masknet/web3-shared-evm'
import { NetworkPluginID, TokenType } from '@masknet/web3-shared-base'
import { NFTImageCollectibleAvatar } from '@masknet/shared'
import { formatAddress } from '../utils'
import { Empty } from './Empty'

const useStyles = makeStyles()((theme) => {
    return {
        wrapper: {
            width: '100%',
            marginBottom: '16px',
        },

        walletInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        walletName: {
            fontSize: '16px',
            fontWeight: 400,
            marginLeft: '4px',
        },
        imageIconWrapper: {
            position: 'relative',
            cursor: 'pointer',
            display: 'flex',
            overflow: 'hidden',
            padding: 0,
            flexDirection: 'column',
            borderRadius: 12,
            userSelect: 'none',
            justifyContent: 'center',
            lineHeight: 0,
        },
        link: {
            cursor: 'pointer',
            marginTop: 2,
            '&:hover': {
                textDecoration: 'none',
            },
        },
        linkIcon: {
            fill: theme.palette.maskColor.second,
            height: 20,
            width: 20,
            marginLeft: theme.spacing(0.5),
            marginTop: '2px',
        },
        editIcon: {
            height: 20,
            width: 20,
            fill: theme.palette.text.primary,
            cursor: 'pointer',
        },
        loadingFailImage: {
            minHeight: '0 !important',
            maxWidth: '126px',
            transform: 'translateY(10px)',
        },
        list: {
            gridGap: 13,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            paddingBottom: '20px',
            marginTop: '20px',
        },
    }
})

export interface WalletAssetsCardProps extends withClasses<never | 'root'> {
    networkIcon?: URL
    address: string
    onSetting: () => void
    type: string
    collectionList?: CollectionTypes[]
}

export function WalletAssetsCard(props: WalletAssetsCardProps) {
    // const { avatar, nickName = 'unknown', platformId = 'unknown', isCurrent = false, openImageSetting } = props
    const { networkIcon, address, onSetting, type, collectionList } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const chainId = ChainId.Mainnet

    const iconURL = NETWORK_DESCRIPTORS.find((network) => network?.chainId === ChainId.Mainnet)?.icon

    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, address)

    return (
        <Card className={classes.wrapper}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={classes.walletInfo}>
                    <ImageIcon icon={iconURL} size={20} borderRadius="99px" />
                    <Typography className={classes.walletName}>{domain || formatAddress(address, 4)}</Typography>
                    <Link
                        className={classes.link}
                        href={address ? explorerResolver.addressLink(chainId, address) ?? '' : ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <LinkOutIcon className={classes.linkIcon} />
                    </Link>
                </div>
                <Edit2Icon onClick={onSetting} className={classes.editIcon} />
            </div>
            {collectionList && collectionList?.filter((collection) => !collection?.hidden)?.length > 0 ? (
                <List className={classes.list}>
                    {collectionList
                        ?.filter((collection) => !collection?.hidden)
                        ?.slice(0, 8)
                        ?.map((collection, i) => (
                            <ListItem className={classes.imageIconWrapper} key={collection.key}>
                                <NFTImageCollectibleAvatar
                                    pluginId={NetworkPluginID.PLUGIN_EVM}
                                    key={i}
                                    token={{
                                        ...collection,
                                        tokenId: collection.tokenId ?? '',
                                        id: collection.address,
                                        chainId: ChainId.Mainnet,
                                        schema: SchemaType.ERC721,
                                        type: TokenType.NonFungible,
                                        contract: {
                                            chainId: ChainId.Mainnet,
                                            name:
                                                type === 'NFTs'
                                                    ? `${collection?.name}#${collection?.tokenId}`
                                                    : collection?.name ?? '',
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
            ) : (
                <Box>
                    <Empty content={t.no_collection_item()} />
                </Box>
            )}
        </Card>
    )
}
