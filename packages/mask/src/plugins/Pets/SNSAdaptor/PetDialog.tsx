import { useEffect, useState, useMemo, ReactNode } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import {
    Button,
    TextField,
    Typography,
    Box,
    DialogContent,
    Grid,
    MenuItem,
    Snackbar,
    Autocomplete,
} from '@mui/material'
import { PluginPetMessages, PluginPetRPC } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { initMeta, initCollection, Punk3D } from '../constants'
import { PreviewBox } from './PreviewBox'
import { PetMetaDB, FilterContract, OwnerERC721TokenInfo, ImageType } from '../types'
import { useUser, useCurrentVisitingUser, useNFTs, useNFTsExtra } from '../hooks'
import { useI18N, getAssetAsBlobURL } from '../../../utils'
import { ShadowRootPopper } from '../../../utils/shadow-root/ShadowRootComponents'
import { ImgLoader } from './ImgLoader'

const useStyles = makeStyles()((theme) => ({
    desBox: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    des: {
        color: '#7b8192',
        fontSize: '12px',
    },
    input: {
        margin: theme.spacing(2, 0, 0),
    },
    inputOption: {
        margin: theme.spacing(4, 0, 0),
    },
    inputBorder: {
        borderRadius: theme.spacing(1),
        padding: theme.spacing(1),
    },
    inputArea: {
        borderRadius: theme.spacing(1),
        padding: theme.spacing(2),
    },
    menuItem: {
        width: '100%',
    },
    btn: {
        margin: theme.spacing(8, 0, 4),
    },
    thumbnail: {
        width: 25,
        height: 25,
        objectFit: 'cover',
        margin: theme.spacing(0, 1, 0, 0),
        display: 'inline-block',
        borderRadius: 4,
    },
    glbIcon: {
        width: 15,
        height: 18,
        marginLeft: theme.spacing(1),
    },
    itemFix: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    itemTxt: {
        flex: 1,
        marginLeft: theme.spacing(0.5),
    },
    prevBox: {
        margin: theme.spacing(2, 0, 0),
        border: '1px dashed #ccc',
        borderRadius: 4,
        height: 'calc(100% - 16px)',
        boxSizing: 'border-box',
        padding: 4,
    },
    boxPaper: {
        backgroundColor: theme.palette.mode === 'dark' ? '#1B1E38' : '#FFFFFF',
        marginBottom: 10,
        boxShadow: theme.palette.mode === 'dark' ? '0 0 5px #FFFFFF' : '0 0 5px #CCCCCC',
    },
}))

export function PetDialog() {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const GLB3DIcon = getAssetAsBlobURL(new URL('../assets/glb3D.png', import.meta.url))
    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.essayDialogUpdated, () => {})

    //should not use user address here
    const user = useUser()
    const visitor = useCurrentVisitingUser()
    const nfts = useNFTs(
        user.userId === visitor.userId && isSameAddress(user.address, visitor.address) ? visitor : undefined,
    )
    const extraData = useNFTsExtra()

    const [collection, setCollection] = useState<FilterContract>(initCollection)
    const [isCollectionsError, setCollectionsError] = useState(false)

    const [metaData, setMetaData] = useState<PetMetaDB>(initMeta)
    const [isImageError, setImageError] = useState(false)
    const [isTipShow, setTipShow] = useState(false)
    const [holderChange, setHolderChange] = useState(true)
    const [tokenInfoSelect, setTokenInfoSelect] = useState<OwnerERC721TokenInfo | null>(null)

    useEffect(() => {
        if (open) return
        setMetaData(initMeta)
        setCollection(initCollection)
        setTokenInfoSelect(null)
    }, [open])

    let timer: NodeJS.Timeout
    const saveHandle = async () => {
        if (!collection.name) {
            setCollectionsError(true)
            return
        }
        if (!metaData.image) {
            setImageError(true)
            return
        }
        const chosenToken = collection.tokens.find((item) => item.mediaUrl === metaData.image)
        const meta = { ...metaData }
        meta.userId = visitor.userId
        meta.contract = collection.contract
        meta.tokenId = chosenToken?.tokenId ?? ''
        await PluginPetRPC.saveEssay(visitor?.address, meta, visitor?.userId ?? '')
        setTipShow(true)
        closeDialog()
        clearTimeout(timer)
        timer = setTimeout(() => {
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

    const onImageChange = (v: OwnerERC721TokenInfo | null) => {
        setTokenInfoSelect(v)
        setMetaData({
            ...metaData,
            userId: visitor.userId,
            tokenId: v?.tokenId ?? '',
            image: v?.mediaUrl ?? '',
        })
        setImageError(false)
    }

    const setMsgValueCheck = (v: string) => {
        if (v.length <= 100) {
            setMetaData({ ...metaData, word: v })
        }
    }

    const setGlbSelect = (select: boolean) => {
        setMetaData({
            ...metaData,
            image: select ? Punk3D.url : tokenInfoSelect?.mediaUrl ?? '',
            type: select ? ImageType.GLB : ImageType.NORMAL,
        })
    }

    const imageChose = useMemo(() => {
        if (!metaData.image) return ''
        const imageChosen = collection.tokens.find((item) => item.tokenId === metaData.tokenId)
        return imageChosen?.mediaUrl
    }, [metaData.image])

    const renderImg = (address: string) => {
        const imgItem = extraData.filter((i) => isSameAddress(i.address, address))
        return imgItem ? <ImgLoader className={classes.thumbnail} src={imgItem[0]?.iconURL ?? ''} /> : null
    }

    const paperComponent = (children: ReactNode | undefined) => <Box className={classes.boxPaper}>{children}</Box>

    return (
        <>
            <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_pets_dialog_title')}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <PreviewBox
                                message={metaData.word}
                                imageUrl={imageChose}
                                tokenInfo={tokenInfoSelect}
                                glbTransferHandle={setGlbSelect}
                            />
                        </Grid>
                        <Grid item xs={8}>
                            <Autocomplete
                                disablePortal
                                id="collection-box"
                                options={nfts}
                                onChange={(_event, newValue) => onCollectionChange(newValue?.name ?? '')}
                                getOptionLabel={(option) => option.name}
                                PopperComponent={ShadowRootPopper}
                                PaperComponent={({ children }) => paperComponent(children)}
                                renderOption={(props, option) => (
                                    <MenuItem
                                        key={option.name}
                                        value={option.name}
                                        disabled={!option.tokens.length}
                                        className={classes.menuItem}>
                                        <Box {...props} component="li" className={classes.itemFix}>
                                            {renderImg(option.contract)}
                                            <Typography className={classes.itemTxt}>{option.name}</Typography>
                                        </Box>
                                    </MenuItem>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('plugin_pets_dialog_contract')}
                                        error={isCollectionsError}
                                        className={classes.input}
                                        inputProps={{ ...params.inputProps }}
                                        InputProps={{ ...params.InputProps, classes: { root: classes.inputBorder } }}
                                    />
                                )}
                            />
                            <Autocomplete
                                disablePortal
                                id="token-box"
                                options={collection.tokens}
                                onChange={(_event, newValue) => onImageChange(newValue)}
                                getOptionLabel={(option) => option.name ?? ''}
                                PaperComponent={({ children }) => paperComponent(children)}
                                PopperComponent={ShadowRootPopper}
                                renderOption={(props, option) => (
                                    <Box component="li" className={classes.itemFix} {...props}>
                                        <img className={classes.thumbnail} src={option.mediaUrl} />
                                        <Typography>{option.name}</Typography>
                                        {option.glbSupport ? <img className={classes.glbIcon} src={GLB3DIcon} /> : null}
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('plugin_pets_dialog_token')}
                                        error={isImageError}
                                        className={classes.input}
                                        inputProps={{ ...params.inputProps }}
                                        InputProps={{ ...params.InputProps, classes: { root: classes.inputBorder } }}
                                    />
                                )}
                            />
                            <TextField
                                className={classes.inputOption}
                                InputProps={{ classes: { root: classes.inputArea } }}
                                label={
                                    holderChange ? t('plugin_pets_dialog_msg_optional') : t('plugin_pets_dialog_msg')
                                }
                                fullWidth
                                multiline
                                rows={3}
                                disabled={!collection.name}
                                value={metaData.word}
                                onChange={(e) => setMsgValueCheck(e.target.value)}
                                onBlur={() => setHolderChange(true)}
                                onFocus={() => setHolderChange(false)}
                            />
                        </Grid>
                    </Grid>

                    <Button
                        className={classes.btn}
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={saveHandle}
                        disabled={!collection.name || !metaData.image}>
                        {t('plugin_pets_dialog_btn')}
                    </Button>
                    <Box className={classes.desBox}>
                        <Typography className={classes.des}>{t('plugin_pets_dialog_created')}</Typography>
                        <Typography className={classes.des}>{t('plugin_pets_dialog_powered')}</Typography>
                    </Box>
                </DialogContent>
            </InjectedDialog>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={isTipShow}
                message={t('plugin_pets_dialog_success')}
            />
        </>
    )
}
