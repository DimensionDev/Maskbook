import { Box, Button, DialogActions, DialogContent, List, ListItem, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useEffect, useState } from 'react'
import { useI18N } from '../../locales'
import { InjectedDialog, NFTImageCollectibleAvatar } from '@masknet/shared'
import type { PersonaInformation, NextIDStoragePayload } from '@masknet/shared-base'
import type { CollectionTypes } from '../types'
import { context } from '../context'
import { getKvPayload, setKvPatchData } from '../hooks/useKV'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => {
    console.log({ theme })
    return {
        wrapper: {},

        walletInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        titleTailButton: {
            marginLeft: 'auto',
            justifyContent: 'center',
        },
        walletName: {
            fontSize: '16px',
            fontWeight: 400,
            marginLeft: '4px',
        },
        collectionWrap: {
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
        content: {
            width: 564,
            padding: '8px 16px 0 16px',
            height: 420,
            maxHeight: 420,
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
        },
        actions: {
            backgroundColor: theme.palette.background.paper,
        },
        buttonWrapper: {
            padding: '16px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexGrow: 1,
        },
        cancelButton: {
            width: '48%',
            borderRadius: '99px',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.mode === 'light' ? '#111418' : '#eff3f4',
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
                backgroundColor: theme.palette.background.paper,
            },
        },
        button: {
            width: '48%',
            borderRadius: '99px',
        },
        list: {
            gridGap: 13,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            paddingBottom: '16px',
            marginTop: '16px',
        },
    }
})

export interface ImageListDialogProps extends withClasses<never | 'root'> {
    address?: string
    open: boolean
    onClose: () => void
    title: string
    currentPersona?: PersonaInformation
    collectionList?: CollectionTypes[]
    accountId?: string
    retryData: () => void
}

export function ImageListDialog(props: ImageListDialogProps) {
    const { address = ZERO_ADDRESS, open, onClose, retryData, title, accountId, currentPersona, collectionList } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [unListedCollections, setUnListedCollections] = useState<CollectionTypes[]>([])
    const [listedCollections, setListedCollections] = useState<CollectionTypes[]>([])
    const [confirmButtonDisabled, setConfirmButtonDisabled] = useState(true)

    useEffect(() => {
        setListedCollections(collectionList?.filter((collection) => !collection?.hidden) || [])
        setUnListedCollections(collectionList?.filter((collection) => collection?.hidden) || [])
        setConfirmButtonDisabled(true)
    }, [collectionList, open])

    const unList = (key: string | undefined) => {
        if (!key) return
        if (confirmButtonDisabled) setConfirmButtonDisabled(false)
        const unListingCollection = listedCollections?.find((collection) => collection?.key === key)
        if (unListingCollection) {
            setUnListedCollections((pre) => [...pre, unListingCollection])
        }
        const unListingIndex = listedCollections?.findIndex((collection) => collection?.key === key)
        const currentListed = listedCollections
        currentListed?.splice(unListingIndex!, 1)
        setListedCollections([...currentListed])
    }
    const list = (key: string | undefined) => {
        if (!key) return
        if (confirmButtonDisabled) setConfirmButtonDisabled(false)
        const listingCollection = unListedCollections?.find((collection) => collection?.key === key)
        if (listingCollection) {
            setListedCollections((pre) => [...pre, listingCollection])
        }
        const listingIndex = unListedCollections?.findIndex((collection) => collection?.key === key)
        const currentUnListed = unListedCollections
        currentUnListed?.splice(listingIndex!, 1)
        setUnListedCollections([...currentUnListed])
    }

    const onConfirm = async () => {
        if (!currentPersona?.identifier.publicKeyAsHex) return
        const patch = {
            unListedCollections: {
                [address]: {
                    [title]: unListedCollections?.map((x) => x?.key),
                },
            },
        }
        try {
            const payload = await getKvPayload(patch, currentPersona.identifier.publicKeyAsHex, accountId!)
            if (!payload) throw new Error('get payload failed')
            const signature = await context.privileged_silentSign()?.(
                currentPersona.identifier,
                (payload.val as NextIDStoragePayload)?.signPayload,
            )
            const res = await setKvPatchData(
                payload.val,
                signature?.signature?.signature,
                patch,
                currentPersona.identifier.publicKeyAsHex?.replace(/^0x/, ''),
                accountId!,
            )
            onClose()
            retryData()
        } catch (err) {
            console.log({ err })
        }
    }

    return (
        <InjectedDialog
            classes={{ paper: classes.root, dialogContent: classes.content }}
            title={title}
            fullWidth={false}
            open={open}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <div className={classes.wrapper}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>Listed</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', height: 170, overflow: 'scroll' }}>
                        <List className={classes.list}>
                            {listedCollections?.map((collection, i) => (
                                <ListItem
                                    className={classes.collectionWrap}
                                    onClick={() => unList(collection.key)}
                                    key={collection.key}>
                                    <NFTImageCollectibleAvatar
                                        pluginId={NetworkPluginID.PLUGIN_EVM}
                                        size={64}
                                        token={{
                                            ...collection,
                                            contract: {
                                                chainId: ChainId.Mainnet,
                                            },
                                            metadata: {
                                                imageURL: collection.iconURL,
                                            },
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, marginTop: '12px' }}>Unlisted</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', height: 170, overflow: 'scroll' }}>
                        <List className={classes.list}>
                            {unListedCollections?.map((collection, i) => (
                                <ListItem
                                    key={collection?.key}
                                    className={classes.collectionWrap}
                                    onClick={() => list(collection.key)}>
                                    <NFTImageCollectibleAvatar
                                        pluginId={NetworkPluginID.PLUGIN_EVM}
                                        size={64}
                                        token={{
                                            ...collection,
                                            contract: {
                                                chainId: ChainId.Mainnet,
                                            },
                                            metadata: {
                                                imageURL: collection.iconURL,
                                            },
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </div>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <div className={classes.buttonWrapper}>
                    <Button className={classes.cancelButton} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className={classes.button} onClick={onConfirm} disabled={confirmButtonDisabled}>
                        Confirm
                    </Button>
                </div>
            </DialogActions>
        </InjectedDialog>
    )
}
