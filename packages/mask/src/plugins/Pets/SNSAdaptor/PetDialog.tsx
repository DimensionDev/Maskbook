import { useEffect, useState, useMemo, ReactNode } from 'react'
import { useAsync } from 'react-use'
import { useRemoteControlledDialog } from '@masknet/shared'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { makeStyles, useStylesExtends, useCustomSnackbar } from '@masknet/theme'
import { TextField, Typography, Box, DialogContent, Grid, MenuItem, Snackbar, Autocomplete } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { PluginPetMessages, PluginPetRPC } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { initMeta, initCollection, GLB3DIcon } from '../constants'
import { PreviewBox } from './PreviewBox'
import { PetMetaDB, FilterContract, OwnerERC721TokenInfo, ImageType } from '../types'
import { useUser, useNFTs, useNFTsExtra } from '../hooks'
import { useI18N } from '../../../utils'
import { ShadowRootPopper } from '../../../utils/shadow-root/ShadowRootComponents'
import { ImageLoader } from './ImageLoader'
import type { Constant } from '@masknet/web3-shared-evm/constants/utils'

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
    const { showSnackbar } = useCustomSnackbar()
    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated, () => {})
    const [configNFTs, setConfigNFTs] = useState<Record<string, Constant> | undefined>(undefined)
    const [loading, setLoading] = useState(false)

    const user = useUser()
    const nfts = useNFTs(user, configNFTs)
    const extraData = useNFTsExtra(configNFTs)
    const [collection, setCollection] = useState<FilterContract>(initCollection)
    const [isCollectionsError, setCollectionsError] = useState(false)

    const [metaData, setMetaData] = useState<PetMetaDB>(initMeta)
    const [isImageError, setImageError] = useState(false)
    const [isTipShow, setTipShow] = useState(false)
    const [holderChange, setHolderChange] = useState(true)
    const [tokenInfoSelect, setTokenInfoSelect] = useState<OwnerERC721TokenInfo | null>(null)
    const [inputTokenName, setInputTokenName] = useState('')

    useAsync(async () => {
        setConfigNFTs(await PluginPetRPC.getConfigEssay())
    }, [])

    useEffect(() => {
        if (open) return
        setMetaData(initMeta)
        setCollection(initCollection)
        setTokenInfoSelect(null)
        setInputTokenName('')
    }, [open])

    let timer: NodeJS.Timeout | null = null
    const closeDialogHandle = () => {
        setTipShow(true)
        closeDialog()
        if (timer !== null) clearTimeout(timer)
        timer = setTimeout(() => {
            setTipShow(false)
        }, 2000)
        PluginPetMessages.events.setResult.sendToAll(Math.random())
    }

    const saveHandle = async () => {
        if (!collection.name) {
            setCollectionsError(true)
            return
        }
        if (!metaData.image) {
            setImageError(true)
            return
        }
        setLoading(true)
        const chosenToken = collection.tokens.find((item) => item.mediaUrl === metaData.image)
        const meta = {
            ...metaData,
            userId: user.userId,
            contract: collection.contract,
            tokenId: chosenToken?.tokenId ?? '',
        }
        try {
            await PluginPetRPC.setUserAddress(user)
            await PluginPetRPC.saveEssay(user.address, meta, user.userId)
            closeDialogHandle()
        } catch {
            showSnackbar(t('plugin_pets_dialog_fail'), { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const onCollectionChange = (v: string) => {
        const matched = nfts.find((item) => item.name === v)
        if (matched) {
            setCollection(matched)
            setTokenInfoSelect(null)
            setInputTokenName('')
            setMetaData({
                ...metaData,
                userId: user.userId,
                tokenId: '',
                image: '',
            })
        }
        setCollectionsError(false)
    }

    const onImageChange = (v: OwnerERC721TokenInfo | null) => {
        setTokenInfoSelect(v)
        setInputTokenName(v?.name ?? '')
        setMetaData({
            ...metaData,
            userId: user.userId,
            tokenId: v?.tokenId ?? '',
            image: v?.mediaUrl ?? '',
            type: v?.glbSupport ? ImageType.GLB : ImageType.NORMAL,
        })
        setImageError(false)
    }

    const setMsgValueCheck = (v: string) => {
        if (v.length <= 100) {
            setMetaData({ ...metaData, word: v })
        }
    }

    const imageChose = useMemo(() => {
        if (!metaData.image) return ''
        const imageChosen = collection.tokens.find((item) => item.tokenId === metaData.tokenId)
        return imageChosen?.mediaUrl
    }, [metaData.image, collection.tokens])

    const renderImg = (address: string) => {
        const matched = extraData.find((item) => isSameAddress(item.address, address))
        return <ImageLoader className={classes.thumbnail} src={matched?.iconURL ?? ''} />
    }

    const paperComponent = (children: ReactNode | undefined) => <Box className={classes.boxPaper}>{children}</Box>

    const nftsRender = useMemo(() => {
        return (
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
        )
    }, [nfts, extraData])

    const tokensRender = useMemo(() => {
        return (
            <Autocomplete
                disablePortal
                id="token-box"
                options={collection.tokens}
                inputValue={inputTokenName}
                onChange={(_event, newValue) => onImageChange(newValue)}
                getOptionLabel={(option) => option.name ?? ''}
                PaperComponent={({ children }) => paperComponent(children)}
                PopperComponent={ShadowRootPopper}
                renderOption={(props, option) => (
                    <Box component="li" className={classes.itemFix} {...props}>
                        {!option.glbSupport ? <img className={classes.thumbnail} src={option.mediaUrl} /> : null}
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
        )
    }, [collection.tokens, tokenInfoSelect])

    return (
        <>
            <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_pets_dialog_title')}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <PreviewBox message={metaData.word} imageUrl={imageChose} tokenInfo={tokenInfoSelect} />
                        </Grid>
                        <Grid item xs={8}>
                            {nftsRender}
                            {tokensRender}
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

                    <LoadingButton
                        loading={loading}
                        color="inherit"
                        size="large"
                        fullWidth
                        variant="contained"
                        className={classes.btn}
                        onClick={saveHandle}
                        disabled={!collection.name || !metaData.image}>
                        {t('plugin_pets_dialog_btn')}
                    </LoadingButton>
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
