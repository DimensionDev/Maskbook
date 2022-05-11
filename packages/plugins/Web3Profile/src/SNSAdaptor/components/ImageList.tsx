import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useEffect, useState } from 'react'
import { useI18N } from '../../locales'
import { ImageIcon } from './ImageIcon'
import { InjectedDialog } from '@masknet/shared'
import type { PersonaInformation, NextIDStoragePayload } from '@masknet/shared-base'
import type { CollectionTypes } from '../types'
import { context } from '../context'
import { getKvPayload, setKvPatchData } from '../hooks/useKV'

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
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            marginTop: '12px',
            marginRight: '5px',
            border: `1px solid ${theme.palette.divider}`,
            background: 'rgba(229,232,235,1)',
            cursor: 'pointer',
            '&:nth-child(8n)': {
                marginRight: 0,
            },
        },
        content: {
            width: 480,
            height: 510,
            maxHeight: 510,
            position: 'relative',
            paddingBottom: theme.spacing(3),
        },
        buttonWrapper: {
            padding: '16px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexGrow: 1,
        },
        button: {
            width: '48%',
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
    const chainId = ChainId.Mainnet

    useEffect(() => {
        setListedCollections(collectionList?.filter((collection) => !collection?.hidden) || [])
        setUnListedCollections(collectionList?.filter((collection) => collection?.hidden) || [])
    }, [collectionList])

    const unList = (url: string | undefined) => {
        if (!url) return
        const unListingCollection = listedCollections?.find((collection) => collection?.iconURL === url)
        if (unListingCollection) {
            setUnListedCollections((pre) => [...pre, unListingCollection])
        }
        const unListingIndex = listedCollections?.findIndex((collection) => collection?.iconURL === url)
        const currentListed = listedCollections
        currentListed?.splice(unListingIndex!, 1)
        setListedCollections([...currentListed])
    }
    const list = (url: string | undefined) => {
        if (!url) return
        const listingCollection = unListedCollections?.find((collection) => collection?.iconURL === url)
        if (listingCollection) {
            setListedCollections((pre) => [...pre, listingCollection])
        }
        const listingIndex = unListedCollections?.findIndex((collection) => collection?.iconURL === url)
        const currentUnListed = unListedCollections
        currentUnListed?.splice(listingIndex!, 1)
        setUnListedCollections([...currentUnListed])
    }
    const handleClose = () => {
        setUnListedCollections([])
        onClose()
    }

    const onConfirm = async () => {
        if (!currentPersona?.identifier.publicKeyAsHex) return
        const patch = {
            unListedCollections: {
                [address]: {
                    [title]: unListedCollections?.map((x) => x?.iconURL),
                },
            },
        }
        try {
            const payload = await getKvPayload(patch, currentPersona.identifier.publicKeyAsHex, accountId!)
            if (!payload) throw new Error('get payload failed')
            const signature = await context.priviliged_silentSign()?.(
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
            titleTail={
                <Button className={classes.titleTailButton} size="small">
                    Settings
                </Button>
            }
            onClose={handleClose}>
            <DialogContent className={classes.content}>
                <div className={classes.wrapper}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>Listed</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', height: 170, overflow: 'scroll' }}>
                        {listedCollections?.map((collection, i) => (
                            <div
                                key={collection?.iconURL}
                                className={classes.collectionWrap}
                                onClick={() => unList(collection?.iconURL)}>
                                <ImageIcon size={49} borderRadius="12px" icon={collection?.iconURL} />
                            </div>
                        ))}
                    </Box>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, marginTop: '12px' }}>Unlisted</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', height: 170, overflow: 'scroll' }}>
                        {unListedCollections?.map((collection, i) => (
                            <div
                                key={collection?.iconURL}
                                className={classes.collectionWrap}
                                onClick={() => list(collection?.iconURL)}>
                                <ImageIcon size={49} borderRadius="12px" icon={collection?.iconURL} />
                            </div>
                        ))}
                    </Box>
                </div>
            </DialogContent>
            <DialogActions>
                <div className={classes.buttonWrapper}>
                    <Button className={classes.button} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className={classes.button} onClick={onConfirm}>
                        Confirm
                    </Button>
                </div>
            </DialogActions>
        </InjectedDialog>
    )
}
