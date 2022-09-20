import { Card, Typography, Link, Box } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales/index.js'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { ChainId, explorerResolver, NETWORK_DESCRIPTORS } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { Empty } from './Empty.js'
import { CollectionList } from './CollectionList.js'
import { useMemo, useState } from 'react'
import { EMPTY_LIST } from '@masknet/shared-base'
import { PersonaImageIcon, CollectionTypes, WalletTypes } from '@masknet/shared'
import { CurrentStatusMap, CURRENT_STATUS } from '../../constants.js'

const useStyles = makeStyles()((theme) => {
    return {
        wrapper: {
            width: '100%',
            marginTop: '16px',
            backgroundColor: theme.palette.maskColor.bottom,
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
        fallbackImage: {
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
            fontFamily: 'Helvetica',
            backgroundColor: theme.palette.maskColor.thirdMain,
            fontSize: 12,
            fontWeight: 700,
            marginTop: 4,
            cursor: 'pointer',
        },
        arrowUp: {
            cursor: 'pointer',
            color: theme.palette.maskColor.second,
            marginRight: 10,
        },
        rightIcons: {
            display: 'flex',
            alignItems: 'center',
        },
    }
})

export interface WalletAssetsCardProps extends withClasses<never | 'root'> {
    networkIcon?: URL
    address: WalletTypes
    onSetting: () => void
    collectionList?: CollectionTypes[]
    collectionName?: string
}

const enum LOAD_STATUS {
    Unnecessary = 1,
    Necessary = 2,
    Finish = 3,
}

export function WalletAssetsCard(props: WalletAssetsCardProps) {
    const { address, onSetting, collectionList, collectionName } = props
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
        if (!filterCollections?.length) return EMPTY_LIST
        if (filterCollections.length > 8 && loadStatus !== LOAD_STATUS.Finish) {
            return filterCollections.slice(0, 8)
        }
        return filterCollections
    }, [loadStatus, collectionList])

    const hasHiddenCollection = collectionList && collectionList?.filter((collection) => collection.hidden).length > 0

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
                    <PersonaImageIcon icon={iconURL} size={20} borderRadius="99px" />
                    <Typography className={classes.walletName}>
                        {domain || Others?.formatAddress(address?.address, 4)}
                    </Typography>
                    <Link
                        className={classes.link}
                        href={address ? explorerResolver.addressLink(chainId, address?.address) ?? '' : ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Icons.LinkOut className={classes.linkIcon} />
                    </Link>
                </div>
                <div className={classes.rightIcons}>
                    {loadStatus === LOAD_STATUS.Finish && (
                        <Icons.DoubleArrowUp
                            size={16}
                            className={classes.arrowUp}
                            onClick={() => setLoadStatus(LOAD_STATUS.Necessary)}
                        />
                    )}
                    <Icons.Edit2 size={20} onClick={onSetting} className={classes.editIcon} />
                </div>
            </div>

            {collectionList?.some((collection) => !collection?.hidden) ? (
                <Box className={classes.listBox}>
                    <CollectionList
                        classes={{ list: classes.list, collectionWrap: classes.imageIconWrapper }}
                        size={126}
                        collections={collections}
                        showNetwork
                    />
                    {loadIcon}
                </Box>
            ) : (
                <Box>
                    <Empty
                        showIcon={false}
                        content={
                            hasHiddenCollection
                                ? t.all_collection_hidden({
                                      collection: collectionName ?? CurrentStatusMap[CURRENT_STATUS.NFT_Setting].title,
                                  })
                                : t.no_collection_item({
                                      collection: collectionName ?? CurrentStatusMap[CURRENT_STATUS.NFT_Setting].title,
                                  })
                        }
                    />
                </Box>
            )}
        </Card>
    )
}
