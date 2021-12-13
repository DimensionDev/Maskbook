import { useEffect, useState, useMemo } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useChainId } from '@masknet/web3-shared-evm'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Button, TextField, Typography, Box, DialogContent, Grid, MenuItem, Snackbar } from '@mui/material'
import { PluginPetMessages, PluginPetRPC } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { initMeta, initCollection } from '../constants'
import { PreviewBox } from './previewBox'
import type { PetMetaDB, FilterContract, CollectionNFT } from '../types'
import { useUser } from '../hooks/useUser'
import { useNfts } from '../hooks/useNfts'

const useStyles = makeStyles()((theme) => ({
    desBox: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    input: {
        margin: theme.spacing(2, 0, 0),
    },
    btn: {
        margin: theme.spacing(4, 0),
    },
    thumbnail: {
        width: '25px',
        height: '25px',
        objectFit: 'cover',
        margin: theme.spacing(0, 1, 0, 0),
        display: 'inline-block',
        borderRadius: '4px',
    },
    itemFix: {
        display: 'flex',
        alignItems: 'center',
    },
    prevBox: {
        margin: theme.spacing(2, 0, 0),
        border: '1px dashed #ccc',
        borderRadius: '4px',
        height: 'calc(100% - 16px)',
        boxSizing: 'border-box',
        padding: '4px',
    },
}))

export function PetDialog() {
    const classes = useStylesExtends(useStyles(), {})
    const chainId = useChainId()
    const user = useUser()
    const nfts = useNfts(user)
    console.log('nfts', nfts)
    const [extraData, setExtraData] = useState<CollectionNFT[]>([])
    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.essayDialogUpdated, () => {})

    const [collection, setCollection] = useState<FilterContract>(initCollection)
    const [isCollectionsError, setCollectionsError] = useState(false)

    const [metaData, setMetaData] = useState<PetMetaDB>(initMeta)
    const [isImageError, setImageError] = useState(false)
    const [isTipShow, setTipShow] = useState(false)

    useEffect(() => {
        if (!open) {
            setMetaData(initMeta)
            setCollection(initCollection)
        }
    }, [open])

    useEffect(() => {
        Promise.all(nfts.map((i) => PluginPetRPC.getAssetContract(i.contract, chainId))).then((lists) => {
            setExtraData(lists)
        })
    }, [nfts])

    const saveHandle = async () => {
        if (!collection.name) {
            setCollectionsError(true)
            return
        }
        if (!metaData.image) {
            setImageError(true)
            return
        }
        const chosedToken = collection.tokens.find((item) => item.image === metaData.image)
        const meta = { ...metaData }
        meta.userId = user.userId
        meta.contract = collection.contract
        meta.tokenId = chosedToken?.tokenId ?? ''
        await PluginPetRPC.saveEssay(user?.address, meta, user?.userId ?? '')
        setTipShow(true)
        closeDialog()
        setTimeout(() => {
            setTipShow(false)
        }, 2000)
    }

    const onCollectionChange = (v: string) => {
        nfts.forEach((y) => {
            if (y.name === v) {
                setCollection(y)
            }
        })
        setCollectionsError(false)
    }

    const onImageChange = (v: string) => {
        setMetaData({ ...metaData, image: v })
        setImageError(false)
    }

    const setMsgValueCheck = (v: string) => {
        if (v.length <= 100) {
            setMetaData({ ...metaData, word: v })
        }
    }

    const imageChose = useMemo(() => {
        if (!metaData.image) return ''
        const imageChosed = collection.tokens.find((item) => item.image === metaData.image)
        return imageChosed?.image
    }, [metaData.image])

    return (
        <>
            <InjectedDialog open={open} onClose={closeDialog} title="Non-Fungible Friends">
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <PreviewBox message={metaData.word} imageUrl={imageChose} />
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                className={classes.input}
                                label="NFT Contract"
                                fullWidth
                                select
                                required
                                value={collection.name}
                                error={isCollectionsError}
                                variant="outlined"
                                onChange={(e) => onCollectionChange(e.target.value)}>
                                {nfts.map((y, idx) => (
                                    <MenuItem key={y.name} value={y.name} disabled={!y.tokens.length}>
                                        <Box className={classes.itemFix}>
                                            <img className={classes.thumbnail} src={extraData[idx]?.image_url ?? ''} />
                                            <Typography>{y.name}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                className={classes.input}
                                label="Token ID"
                                fullWidth
                                select
                                required
                                value={metaData.image}
                                error={isImageError}
                                variant="outlined"
                                disabled={!collection.name}
                                maxRows={2}
                                onChange={(e) => onImageChange(e.target.value)}>
                                {collection.tokens.map((item, index) => {
                                    return (
                                        <MenuItem key={`${item.name}${index}`} value={item.image}>
                                            <Box className={classes.itemFix}>
                                                <img className={classes.thumbnail} src={item.image} />
                                                <Typography>{item.name}</Typography>
                                            </Box>
                                        </MenuItem>
                                    )
                                })}
                            </TextField>
                            <TextField
                                className={classes.input}
                                label="message (Optional, 100 characters max.)"
                                fullWidth
                                multiline
                                rows={3}
                                disabled={!collection.name}
                                value={metaData.word}
                                onChange={(e) => setMsgValueCheck(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Button className={classes.btn} variant="contained" size="large" fullWidth onClick={saveHandle}>
                        Confirm Add
                    </Button>
                    <Box className={classes.desBox}>
                        <Typography className={classes.des}>Support By: MintTeam</Typography>
                        <Typography className={classes.des}>RSS3</Typography>
                    </Box>
                </DialogContent>
            </InjectedDialog>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={isTipShow}
                message="Your new pet has been successFully set up"
            />
        </>
    )
}
