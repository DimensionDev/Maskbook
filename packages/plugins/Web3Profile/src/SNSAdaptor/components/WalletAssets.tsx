import { useMemo, useState } from 'react'
import { Card, Typography, Link, Box } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales/index.js'
import { useReverseAddress, useWeb3State } from '@masknet/web3-hooks-base'
import { ChainId, explorerResolver, NETWORK_DESCRIPTORS } from '@masknet/web3-shared-evm'
import { NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import { Empty } from './Empty.js'
import { CollectionList } from './CollectionList.js'
import { PersonaImageIcon, type CollectionTypes, type WalletTypes } from '@masknet/shared'
import { SceneMap, Scene } from '../../constants.js'

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
            padding: 0,
            width: 126,
            height: 126,
            borderRadius: 12,
            userSelect: 'none',
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

export interface WalletAssetsCardProps extends withClasses<'root'> {
    networkIcon?: URL
    wallet: WalletTypes
    onSetting: () => void
    collections?: CollectionTypes[]
    hasUnlisted?: boolean
    collectionName?: string
}

export function WalletAssetsCard(props: WalletAssetsCardProps) {
    const { wallet, onSetting, collections: collectionList = EMPTY_LIST, collectionName, hasUnlisted } = props
    const t = useI18N()
    const { classes } = useStyles(undefined, { props })
    const chainId = ChainId.Mainnet

    const [loadAll, setLoadAll] = useState(false)

    const { Others } = useWeb3State(wallet.networkPluginID ?? NetworkPluginID.PLUGIN_EVM)

    const iconURL = NETWORK_DESCRIPTORS.find((network) => network?.chainId === ChainId.Mainnet)?.icon

    const collections = useMemo(() => {
        if (collectionList.length > 8 && !loadAll) {
            return collectionList.slice(0, 8)
        }
        return collectionList
    }, [loadAll, collectionList])

    const { data: domain } = useReverseAddress(wallet.networkPluginID, wallet.address)

    return (
        <Card className={classes.wrapper}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <div className={classes.walletInfo}>
                    <PersonaImageIcon icon={iconURL} size={20} borderRadius="99px" />
                    <Typography className={classes.walletName}>
                        {domain || Others?.formatAddress(wallet.address, 4)}
                    </Typography>
                    <Link
                        className={classes.link}
                        href={explorerResolver.addressLink(chainId, wallet.address) ?? ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Icons.LinkOut className={classes.linkIcon} />
                    </Link>
                </div>
                <div className={classes.rightIcons}>
                    {loadAll ? (
                        <Icons.DoubleArrowUp size={16} className={classes.arrowUp} onClick={() => setLoadAll(false)} />
                    ) : null}
                    <Icons.Edit2 size={20} onClick={onSetting} className={classes.editIcon} />
                </div>
            </Box>

            {collections.length ? (
                <Box className={classes.listBox}>
                    <CollectionList
                        classes={{ list: classes.list, collectionWrap: classes.imageIconWrapper }}
                        size={126}
                        collections={collections}
                        showNetwork
                    />
                    {!loadAll && collectionList?.length > 8 ? (
                        <Box onClick={() => setLoadAll(true)} className={classes.loadIcon}>
                            {t.load_more()}
                        </Box>
                    ) : null}
                </Box>
            ) : (
                <Box>
                    <Empty
                        content={t.no_collection({
                            context: hasUnlisted ? 'hidden' : 'empty',
                            collection: collectionName ?? SceneMap[Scene.NFTSetting].title,
                        })}
                    />
                </Box>
            )}
        </Card>
    )
}
