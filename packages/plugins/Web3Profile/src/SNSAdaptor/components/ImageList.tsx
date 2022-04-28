import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { useI18N } from '../../locales'
import { ImageIcon } from './ImageIcon'
import { InjectedDialog } from '@masknet/shared'
import { NextIDStorage } from '@masknet/web3-providers'
import { NextIDPlatform, PersonaInformation, fromHex, toBase64 } from '@masknet/shared-base'
import { PLUGIN_ID } from '../../constants'
import type { collectionTypes } from '../types'
import { context } from '../context'

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
            posotion: 'relative',
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
    collectionList?: collectionTypes[]
}

export function ImageListDialog(props: ImageListDialogProps) {
    const { address = ZERO_ADDRESS, open, onClose, title, currentPersona, collectionList } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [unListedCollections, setUnListdCollections] = useState<collectionTypes[] | undefined>([])
    const [listedCollections, setListdCollections] = useState<collectionTypes[] | undefined>(collectionList)
    const chainId = ChainId.Mainnet

    const unList = (url: string | undefined) => {
        if (!url) return
        const unListingCollection = listedCollections?.find((collection) => collection?.iconURL === url)
        setUnListdCollections((pre) => [...pre, unListingCollection])
        const unListingIndex = listedCollections?.findIndex((collection) => collection?.iconURL === url)
        const currentListed = listedCollections
        currentListed?.splice(unListingIndex!, 1)
        setListdCollections([...currentListed])
    }
    const list = (url: string | undefined) => {
        if (!url) return
        const listingCollection = unListedCollections?.find((collection) => collection?.iconURL === url)
        setListdCollections((pre) => [...pre, listingCollection])
        const listingIndex = unListedCollections?.findIndex((collection) => collection?.iconURL === url)
        const currentUnListed = unListedCollections
        currentUnListed?.splice(listingIndex!, 1)
        setUnListdCollections([...currentUnListed])
    }
    const handleClose = () => {
        setUnListdCollections([])
        setListdCollections(collectionList)
        onClose()
    }

    const onConfirm = async () => {
        if (!currentPersona?.publicHexKey) return
        const patch = {
            unListedCollections: unListedCollections?.map((x) => x?.iconURL),
        }
        try {
            const payload = await NextIDStorage.getPayload(
                currentPersona.publicHexKey,
                NextIDPlatform.Ethereum,
                address,
                patch,
                PLUGIN_ID,
            )
            if (!payload) throw new Error('get payload failed')
            const signature = await context.generateSign(currentPersona.identifier, payload.val?.signPayload)
            if (!signature) throw new Error('signature failed')
            const res = await NextIDStorage.set(
                payload.val?.uuid,
                currentPersona.publicHexKey?.replace(/^0x/, ''),
                toBase64(fromHex(signature?.signature?.signature)),
                NextIDPlatform.Ethereum,
                address,
                payload.val?.createdAt,
                patch,
                PLUGIN_ID,
            )
            if (!res) throw new Error('storage kv failed')
            onClose()
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', height: 170, overflow: 'scorll' }}>
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', height: 170, overflow: 'scorll' }}>
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
