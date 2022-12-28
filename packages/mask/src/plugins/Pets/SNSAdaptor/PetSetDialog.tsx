import { useState, useMemo, ReactNode } from 'react'
import { useTimeout } from 'react-use'
import type { Constant } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, useCustomSnackbar, ShadowRootPopper, ActionButton, LoadingBase } from '@masknet/theme'
import { useValueRef } from '@masknet/shared-base-ui'
import {
    Typography,
    Box,
    Grid,
    MenuItem,
    Snackbar,
    Autocomplete,
    FormControlLabel,
    Checkbox,
    useTheme,
    InputBase,
} from '@mui/material'
import { PluginPetMessages } from '../messages.js'
import { initMeta, initCollection, GLB3DIcon, PetsPluginID } from '../constants.js'
import { PreviewBox } from './PreviewBox.js'
import { PetMetaDB, FilterContract, OwnerERC721TokenInfo, ImageType } from '../types.js'
import { useUser, useNFTs } from '../hooks/index.js'
import { PluginWalletStatusBar } from '@masknet/shared'
import { useI18N } from '../locales/index.js'
import { ImageLoader } from './ImageLoader.js'
import { petShowSettings } from '../settings.js'
import { useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    desBox: {
        display: 'flex',
        justifyContent: 'flex-end',
        margin: theme.spacing(1, 0),
        alignItems: 'center',
    },
    poweredBy: {
        marginRight: theme.spacing(1),
        color: '#767F8D',
    },
    des: {
        marginRight: theme.spacing(1),
    },
    input: {
        margin: theme.spacing(2, 0, 0),
    },
    inputOption: {
        margin: theme.spacing(4, 0, 0),
    },
    menuItem: {
        width: '100%',
    },
    btn: {
        margin: 0,
        padding: 0,
        height: 40,
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
        textOverflow: 'ellipsis',
        WebkitLineCamp: '1',
        maxWidth: '260px',
        overflow: 'hidden',
    },
    boxPaper: {
        backgroundColor: theme.palette.mode === 'dark' ? '#1B1E38' : '#FFFFFF',
        marginBottom: 10,
        boxShadow: theme.palette.mode === 'dark' ? '0 0 5px #FFFFFF' : '0 0 5px #CCCCCC',
    },
    icon: {
        margin: theme.spacing(0, 1),
    },
    arrowIcon: {
        width: 22.5,
        height: 22.5,
        top: 'calc(50% - 11.25px)',
        color: theme.palette.maskColor.second,
    },
}))

interface PetSetDialogProps {
    configNFTs: Record<string, Constant> | undefined
    onClose: () => void
}

export function PetSetDialog({ configNFTs, onClose }: PetSetDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const theme = useTheme()
    const { showSnackbar } = useCustomSnackbar()
    const [loading, setLoading] = useState(false)
    const checked = useValueRef<boolean>(petShowSettings)
    const [isReady, cancel] = useTimeout(2000)

    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const user = useUser()
    const { nfts, state } = useNFTs(user)
    const blacklist = Object.values(configNFTs ?? {}).map((v) => v.Mainnet)

    const [collection, setCollection] = useState<FilterContract>(initCollection)
    const [isCollectionsError, setCollectionsError] = useState(false)

    const [metaData, setMetaData] = useState<PetMetaDB>(initMeta)
    const [isImageError, setImageError] = useState(false)
    const [isTipVisible, setTipVisible] = useState(false)
    const [holderChange, setHolderChange] = useState(true)
    const [tokenInfoSelect, setTokenInfoSelect] = useState<OwnerERC721TokenInfo | null>(null)
    const [inputTokenName, setInputTokenName] = useState('')

    const closeDialogHandle = () => {
        setTipVisible(true)
        onClose()
        isReady() ? setTipVisible(false) : cancel()
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
        const chosenToken = collection.tokens.find((item) => item?.metadata?.imageURL === metaData.image)
        const meta = {
            ...metaData,
            userId: user.userId,
            contract: collection.contract,
            tokenId: chosenToken?.tokenId ?? '',
            chainId: chosenToken?.chainId,
        }
        try {
            if (!Storage) return
            const kvStorage = Storage.createKVStorage(PetsPluginID)
            await kvStorage.set(user.userId, user.address)
            const signature = await connection?.signMessage('message', user.userId, { account: user.address })
            const storage = Storage.createRSS3Storage(user.address)
            storage.set('_pet', { address: user.address, signature, essay: meta })
            closeDialogHandle()
        } catch {
            showSnackbar(t.pets_dialog_fail(), { variant: 'error' })
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
        setInputTokenName(v?.metadata?.name ?? '')
        setMetaData({
            ...metaData,
            userId: user.userId,
            tokenId: v?.tokenId ?? '',
            image: v?.metadata?.imageURL ?? '',
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
        return imageChosen?.metadata?.imageURL
    }, [metaData.image, collection.tokens])

    const mediaChose = useMemo(() => {
        const imageChosen = collection.tokens.find((item) => item.tokenId === metaData.tokenId)
        return imageChosen?.metadata?.mediaURL
    }, [metaData.tokenId, collection.tokens])

    const renderImg = (item: FilterContract) => {
        return <ImageLoader className={classes.thumbnail} src={item.icon} />
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
                        key={option.contract}
                        value={option.name}
                        disabled={!option.tokens.length || blacklist.includes(option.contract)}
                        className={classes.menuItem}>
                        <Box {...props} component="span" className={classes.itemFix}>
                            {renderImg(option)}
                            <Typography className={classes.itemTxt}>{option.name}</Typography>
                            <Typography>
                                {blacklist.includes(option.contract) ? t.pets_dialog_unverified() : ''}
                            </Typography>
                        </Box>
                    </MenuItem>
                )}
                renderInput={(params) => (
                    <InputBase
                        {...params.InputProps}
                        fullWidth
                        placeholder={t.pets_dialog_contract()}
                        error={isCollectionsError}
                        className={classes.input}
                        inputProps={{ ...params.inputProps }}
                        endAdornment={
                            <Box pr={2} display="flex" alignItems="center">
                                {state ? <LoadingBase size={20} /> : <Icons.ArrowDrop className={classes.arrowIcon} />}
                            </Box>
                        }
                    />
                )}
            />
        )
    }, [nfts])

    const tokensRender = useMemo(() => {
        return (
            <Autocomplete
                disablePortal
                id="token-box"
                options={collection.tokens}
                inputValue={inputTokenName}
                onChange={(_event, newValue) => onImageChange(newValue)}
                getOptionLabel={(option) => option?.metadata?.name ?? ''}
                PaperComponent={({ children }) => paperComponent(children)}
                PopperComponent={ShadowRootPopper}
                renderOption={(props, option) => (
                    <Box component="li" className={classes.itemFix} {...props}>
                        {!option.glbSupport ? (
                            <img className={classes.thumbnail} src={option.metadata?.imageURL} />
                        ) : null}
                        <Typography>{option?.metadata?.name}</Typography>
                        {option.glbSupport ? <img className={classes.glbIcon} src={GLB3DIcon} /> : null}
                    </Box>
                )}
                renderInput={(params) => (
                    <InputBase
                        {...params.InputProps}
                        fullWidth
                        placeholder={t.pets_dialog_token()}
                        error={isImageError}
                        className={classes.input}
                        inputProps={{ ...params.inputProps }}
                        endAdornment={
                            <Box pr={2} display="flex" alignItems="center">
                                <Icons.ArrowDrop className={classes.arrowIcon} />
                            </Box>
                        }
                    />
                )}
            />
        )
    }, [collection.tokens, tokenInfoSelect])

    return (
        <>
            <Box style={{ padding: '16px 16px 0 16px' }}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <PreviewBox
                            message={metaData.word}
                            imageUrl={imageChose}
                            mediaUrl={mediaChose}
                            tokenInfo={tokenInfoSelect}
                        />
                    </Grid>
                    <Grid item xs={8}>
                        {nftsRender}
                        {tokensRender}
                        <InputBase
                            className={classes.inputOption}
                            placeholder={holderChange ? t.pets_dialog_msg_optional() : t.pets_dialog_msg()}
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
                <FormControlLabel
                    control={
                        <Checkbox checked={checked} onChange={(e) => (petShowSettings.value = e.target.checked)} />
                    }
                    label={t.pets_dialog_check_title()}
                    sx={{ marginTop: '4px' }}
                />
                <Box className={classes.desBox}>
                    <Typography fontSize={14} fontWeight={700} className={classes.poweredBy}>
                        {t.pets_powered_by()}
                    </Typography>
                    <Typography color="textPrimary" fontSize={14} fontWeight={700}>
                        NFF
                    </Typography>
                    <Icons.Pets className={classes.icon} />
                    <Typography fontSize={14} color="textSecondary" fontWeight={700} className={classes.des}>
                        &
                    </Typography>
                    <Typography fontSize={14} color="textSecondary" fontWeight={700} className={classes.des}>
                        RSS3
                    </Typography>
                    <Icons.RSS3 color={theme.palette.mode === 'light' ? '#000' : '#fff'} />
                </Box>
            </Box>

            <PluginWalletStatusBar>
                <ActionButton
                    loading={loading}
                    fullWidth
                    className={classes.btn}
                    onClick={saveHandle}
                    disabled={!collection.name || !metaData.image}>
                    {t.pets_dialog_btn()}
                </ActionButton>
            </PluginWalletStatusBar>

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={isTipVisible}
                message={t.pets_dialog_success()}
            />
        </>
    )
}
