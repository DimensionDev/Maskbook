import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import {
    useCollectibles,
    useCollections,
    ChainId,
    ERC721ContractDetailed,
    isSameAddress,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
import { useEffect, useState } from 'react'
import { useI18N } from '../../locales'
import { ImageIcon } from './ImageIcon'
import { uniqBy } from 'lodash-unified'
import { usePersonaSign } from '../hooks/usePersonaSign'
import { InjectedDialog } from '@masknet/shared'
import { NextIDStorage } from '@masknet/web3-providers'
import { NextIDPlatform, PersonaInformation, fromHex, toBase64 } from '@masknet/shared-base'

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
}

export function ImageListDialog(props: ImageListDialogProps) {
    const { address = ZERO_ADDRESS, open, onClose, title, currentPersona } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [unListedCollections, setUnListdCollections] = useState<(ERC721ContractDetailed | undefined)[]>([])
    const [listedCollections, setListdCollections] = useState<(ERC721ContractDetailed | undefined)[]>([])
    const chainId = ChainId.Mainnet
    const { data: collectionsFormRemote } = useCollections(address, chainId)
    const {
        data: collectibles,
        state: loadingCollectibleDone,
        retry: retryFetchCollectible,
    } = useCollectibles(address, chainId)

    useEffect(() => {
        setListdCollections(
            uniqBy(
                collectibles.map((x) => x.contractDetailed),
                (x) => x.address.toLowerCase(),
            )
                .map((x) => {
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
                .filter((collection) => collection?.iconURL),
        )
    }, [collectibles.length, collectionsFormRemote.length])
    const personaSign = usePersonaSign()
    useEffect(() => {
        if (!currentPersona) return
        NextIDStorage.get(currentPersona.publicHexKey!).then((res) => {
            const unListedCollectionIconURLs = res?.val?.proofs?.find(
                (x) => x.platform === NextIDPlatform.Ethereum && x.identity === address,
            )['com.mask.plugin'][`${NextIDPlatform.Ethereum}_${address}`].unListedCollections
        })
    }, [currentPersona])

    const unList = (url: string | undefined) => {
        if (!url) return
        const unListingCollection = listedCollections?.find((collection) => collection?.iconURL === url)
        setUnListdCollections((pre) => [...pre, unListingCollection])
        const unListingIndex = listedCollections?.findIndex((collection) => collection?.iconURL === url)
        const currentListed = listedCollections
        currentListed?.splice(unListingIndex, 1)
        setListdCollections([...currentListed])
    }
    const list = (url: string | undefined) => {
        if (!url) return
        const listingCollection = unListedCollections?.find((collection) => collection?.iconURL === url)
        setListdCollections((pre) => [...pre, listingCollection])
        const listingIndex = unListedCollections?.findIndex((collection) => collection?.iconURL === url)
        const currentUnListed = unListedCollections
        currentUnListed?.splice(listingIndex, 1)
        setUnListdCollections([...currentUnListed])
    }
    const handleClose = () => {
        setUnListdCollections([])
        setListdCollections(
            uniqBy(
                collectibles.map((x) => x.contractDetailed),
                (x) => x.address.toLowerCase(),
            )
                .map((x) => {
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
                .filter((collection) => collection?.iconURL),
        )
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
            )
            console.log('payload', payload.val)
            const signature = await personaSign({
                message: payload.val?.signPayload,
                method: 'eth',
            })

            console.log({ signature })

            const res = await NextIDStorage.set(
                payload.val?.uuid,
                currentPersona.publicHexKey?.replace(/^0x/, ''),
                toBase64(fromHex(signature?.signature?.signature)),
                NextIDPlatform.Ethereum,
                address,
                payload.val?.createdAt,
                patch,
            )
        } catch (err) {
            return
        }
    }

    return (
        <InjectedDialog
            classes={{ paper: classes.root, dialogContent: classes.content }}
            title={title}
            fullWidth={false}
            open={open}
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
