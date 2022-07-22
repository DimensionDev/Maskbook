import { Card, Typography, Link, Box } from '@mui/material'
import { ArrowUpRound, Edit2Icon, LinkOutIcon } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
import { ImageIcon } from './ImageIcon'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import type { CollectionTypes, WalletTypes } from '../types'
import { ChainId, explorerResolver, NETWORK_DESCRIPTORS } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { Empty } from './Empty'
import { CollectionList } from './CollectionList'
import { useMemo, useState } from 'react'

const useStyles = makeStyles()((theme) => {
    return {
        wrapper: {
            width: '100%',
            marginTop: '16px',
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
            // overflow: 'hidden',
            padding: 0,
            width: 126,
            height: 126,
            borderRadius: 12,
            userSelect: 'none',
            lineHeight: 0,
            '&:nth-last-child(-n+4)': {
                marginBottom: 0,
            },
        },
        link: {
            cursor: 'pointer',
            marginTop: 2,
            '&:hover': {
                textDecoration: 'none',
            },
        },
        linkIcon: {
            color: theme.palette.maskColor.second,
            height: 20,
            width: 20,
            marginLeft: theme.spacing(0.5),
            marginTop: '2px',
        },
        editIcon: {
            color: theme.palette.maskColor.second,
            cursor: 'pointer',
        },
        loadingFailImage: {
            minHeight: '0 !important',
            maxWidth: '126px',
            transform: 'translateY(10px)',
        },
        list: {
            gridRowGap: 16,
            gridColumnGap: 20,
            display: 'grid',
            justifyItems: 'center',
            gridTemplateColumns: 'repeat(4, 1fr)',
        },
        listBox: {
            display: 'flex',
            flexWrap: 'wrap',
            minHeight: 298,
            justifyContent: 'center',
        },
        loadIcon: {
            width: 82,
            height: 32,
            borderRadius: 99,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.maskColor.thirdMain,
            fontSize: 12,
            fontWeight: 700,
            marginTop: 4,
            cursor: 'pointer',
        },
    }
})

export interface WalletAssetsCardProps extends withClasses<never | 'root'> {
    networkIcon?: URL
    address: WalletTypes
    onSetting: () => void
    collectionList?: CollectionTypes[]
}

const enum LOAD_STATUS {
    'Unnecessary' = 1,
    'Necessary' = 2,
    'Finish' = 3,
}

export function WalletAssetsCard(props: WalletAssetsCardProps) {
    const { address, onSetting, collectionList } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const chainId = ChainId.Mainnet

    const [loadStatus, setLoadStatus] = useState(
        collectionList && collectionList?.filter((collection) => !collection?.hidden)?.length > 8
            ? LOAD_STATUS.Necessary
            : LOAD_STATUS.Unnecessary,
    )

    const { Others } = useWeb3State(address?.platform ?? NetworkPluginID.PLUGIN_EVM)

    const iconURL = NETWORK_DESCRIPTORS.find((network) => network?.chainId === ChainId.Mainnet)?.icon

    const collections = useMemo(() => {
        const filterCollections = collectionList?.filter((collection) => !collection?.hidden)
        if (!filterCollections || filterCollections?.length === 0) {
            return []
        }
        if (filterCollections?.length > 8 && loadStatus !== LOAD_STATUS.Finish) {
            return filterCollections?.slice(0, 8)
        }
        return filterCollections
    }, [loadStatus, collectionList])

    const loadIcon = useMemo(() => {
        if (loadStatus === LOAD_STATUS.Necessary)
            return (
                <Box onClick={() => setLoadStatus(LOAD_STATUS.Finish)} className={classes.loadIcon}>
                    {t.load_more()}
                </Box>
            )
        return null
    }, [loadStatus, setLoadStatus])

    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, address?.address)

    return (
        <Card className={classes.wrapper}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={classes.walletInfo}>
                    <ImageIcon icon={iconURL} size={20} borderRadius="99px" />
                    <Typography className={classes.walletName}>
                        {domain || Others?.formatAddress(address?.address, 4)}
                    </Typography>
                    <Link
                        className={classes.link}
                        href={address ? explorerResolver.addressLink(chainId, address?.address) ?? '' : ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <LinkOutIcon className={classes.linkIcon} />
                    </Link>
                </div>
                <div>
                    {loadStatus === LOAD_STATUS.Finish && (
                        <ArrowUpRound sx={{ cursor: 'pointer' }} onClick={() => setLoadStatus(LOAD_STATUS.Necessary)} />
                    )}
                    <Edit2Icon size={20} onClick={onSetting} className={classes.editIcon} />
                </div>
            </div>

            {collectionList && collectionList?.filter((collection) => !collection?.hidden)?.length > 0 ? (
                <Box className={classes.listBox}>
                    <CollectionList
                        classes={{ list: classes.list, collectionWrap: classes.imageIconWrapper }}
                        size={126}
                        collections={collections}
                    />
                    {loadIcon}
                </Box>
            ) : (
                <Box>
                    <Empty content={t.no_collection_item()} />
                </Box>
            )}
        </Card>
    )
}
