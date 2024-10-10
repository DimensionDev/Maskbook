import { Icons } from '@masknet/icons'
import { PluginWalletStatusBar, useSharedTrans } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { ActionButton, LoadingBase, ShadowRootPopper, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useWallet } from '@masknet/web3-hooks-base'
import { Web3Storage } from '@masknet/web3-providers'
import { isSameAddress, type Constant } from '@masknet/web3-shared-base'
import {
    Autocomplete,
    Box,
    Checkbox,
    FormControlLabel,
    Grid,
    InputBase,
    MenuItem,
    Snackbar,
    Typography,
    inputBaseClasses,
    useTheme,
} from '@mui/material'
import { useMemo, useState, type ReactNode } from 'react'
import { useTimeout } from 'react-use'
import { GLB3DIcon, PetsPluginID, initMeta } from '../constants.js'
import { useNFTs, useUser } from '../hooks/index.js'
import { PluginPetMessages } from '../messages.js'
import { petShowSettings } from '../settings.js'
import { ImageType, type FilterContract, type OwnerERC721TokenInfo, type PetMetaDB } from '../types.js'
import { ImageLoader } from './ImageLoader.js'
import { PreviewBox } from './PreviewBox.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
        [`&.${inputBaseClasses.focused}`]: {
            backgroundColor: theme.palette.maskColor.bottom,
        },
    },
    inputOption: {
        margin: theme.spacing(4, 0, 0),
    },
    menuItem: {
        width: '100%',
        color: theme.palette.maskColor.main,
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
        backgroundColor: theme.palette.maskColor.bottom,
        marginBottom: 10,
        boxShadow: theme.palette.mode === 'dark' ? '0 0 5px #FFFFFF' : '0 0 5px #CCCCCC',
        '& > ul': {
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
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
    const { _ } = useLingui()
    const sharedI18N = useSharedTrans()
    const { classes } = useStyles()
    const theme = useTheme()
    const { showSnackbar } = useCustomSnackbar()
    const [loading, setLoading] = useState(false)
    const checked = useValueRef<boolean>(petShowSettings)
    const [isReady, cancel] = useTimeout(2000)

    const wallet = useWallet()
    const user = useUser()
    const { nfts, isPending } = useNFTs()
    const blacklist = Object.values(configNFTs ?? {}).map((v) => v.Mainnet)

    const [collection, setCollection] = useState<FilterContract>()
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
        PluginPetMessages.setResult.sendToAll(Math.random())
    }

    const saveHandle = async () => {
        if (!collection?.name) {
            setCollectionsError(true)
            return
        }
        if (!metaData.image) {
            setImageError(true)
            return
        }
        if (!user) return
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
            const kvStorage = Web3Storage.createKVStorage(PetsPluginID)
            await kvStorage.set(user.userId, user.address)
            const storage = Web3Storage.createFireflyStorage('Pets', user.address)
            await storage.set('pet', { address: user.address, essay: meta })
            closeDialogHandle()
        } catch {
            showSnackbar(<Trans>Setting failed, please try later</Trans>, { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const onCollectionChange = (v: FilterContract | null) => {
        if (!user || !v) return
        const matched = nfts.find((item) => isSameAddress(item.contract, v.contract))
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
        if (!user) return
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
        if (!metaData.image || !collection) return ''
        const imageChosen = collection.tokens.find((item) => item.tokenId === metaData.tokenId)
        return imageChosen?.metadata?.imageURL
    }, [metaData.image, collection?.tokens])

    const mediaChose = useMemo(() => {
        if (!collection) return
        const imageChosen = collection.tokens.find((item) => item.tokenId === metaData.tokenId)
        return imageChosen?.metadata?.mediaURL
    }, [metaData.tokenId, collection?.tokens])

    const renderImg = (item: FilterContract) => {
        return <ImageLoader className={classes.thumbnail} src={item.icon} />
    }

    const paperComponent = (children: ReactNode | undefined) => <Box className={classes.boxPaper}>{children}</Box>

    const nftsRender = (
        <Autocomplete
            id="collection-box"
            options={nfts}
            value={collection}
            onChange={(_event, newValue) => onCollectionChange(newValue)}
            isOptionEqualToValue={(op, value) => isSameAddress(op.contract, value.contract)}
            getOptionLabel={(option) => option.name}
            PopperComponent={ShadowRootPopper as any}
            PaperComponent={({ children }) => paperComponent(children)}
            renderOption={(props, option) => (
                <MenuItem
                    {...props}
                    key={option.contract}
                    value={option.name}
                    disabled={!option.tokens.length || blacklist.includes(option.contract)}
                    className={classes.menuItem}>
                    <Box component="span" className={classes.itemFix} key={option.contract}>
                        {renderImg(option)}
                        <Typography className={classes.itemTxt}>{option.name}</Typography>
                        <Typography>
                            {blacklist.includes(option.contract) ?
                                <Trans> (unverified)</Trans>
                            :   ''}
                        </Typography>
                    </Box>
                </MenuItem>
            )}
            renderInput={(params) => (
                <InputBase
                    {...params.InputProps}
                    fullWidth
                    placeholder={_(msg`NFT Contract`)}
                    error={isCollectionsError}
                    className={classes.input}
                    inputProps={{ ...params.inputProps }}
                    endAdornment={
                        <Box pr={2} display="flex" alignItems="center">
                            {isPending ?
                                <LoadingBase size={20} />
                            :   <Icons.ArrowDrop className={classes.arrowIcon} />}
                        </Box>
                    }
                />
            )}
        />
    )

    const tokensRender = (
        <Autocomplete
            id="token-box"
            options={collection?.tokens ?? EMPTY_LIST}
            inputValue={inputTokenName}
            onChange={(_event, newValue) => onImageChange(newValue)}
            getOptionLabel={(option) => option?.metadata?.name ?? ''}
            PaperComponent={({ children }) => paperComponent(children)}
            isOptionEqualToValue={(op, value) =>
                isSameAddress(op.address, value.address) && op.tokenId === value.tokenId
            }
            PopperComponent={ShadowRootPopper as any}
            renderOption={(props, option) => (
                <MenuItem {...props} key={option.tokenId}>
                    <Box className={classes.itemFix}>
                        {!option.glbSupport ?
                            <img className={classes.thumbnail} key="thumbnail" src={option.metadata?.imageURL} />
                        :   null}
                        <Typography color={(theme) => theme.palette.maskColor.main} key="name">
                            {option?.metadata?.name}
                        </Typography>
                        {option.glbSupport ?
                            <img className={classes.glbIcon} key="glb" src={GLB3DIcon} />
                        :   null}
                    </Box>
                </MenuItem>
            )}
            renderInput={(params) => (
                <InputBase
                    {...params.InputProps}
                    fullWidth
                    placeholder={_(msg`Token ID`)}
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
                            placeholder={
                                holderChange ? _(msg`Optional, 100 characters max.`) : _(msg`Greeting message`)
                            }
                            fullWidth
                            multiline
                            rows={3}
                            disabled={!collection?.name}
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
                    label={<Trans>Show NFT friends on the profile page.</Trans>}
                    sx={{ marginTop: '4px' }}
                />
                <Box className={classes.desBox}>
                    <Trans>
                        <Typography fontSize={14} fontWeight={700} className={classes.poweredBy}>
                            Powered by
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
                    </Trans>
                </Box>
            </Box>

            <PluginWalletStatusBar>
                <ActionButton
                    loading={loading}
                    fullWidth
                    className={classes.btn}
                    onClick={saveHandle}
                    disabled={!collection?.name || !metaData.image || !!wallet?.owner}>
                    {wallet?.owner ? sharedI18N.coming_soon() : <Trans>Confirm</Trans>}
                </ActionButton>
            </PluginWalletStatusBar>

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={isTipVisible}
                message={<Trans>Your Non-Fungible Friend has been set up successfully.</Trans>}
            />
        </>
    )
}
