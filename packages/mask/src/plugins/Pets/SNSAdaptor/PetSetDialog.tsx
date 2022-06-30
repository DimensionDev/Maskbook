import { useState, useMemo, ReactNode, Fragment } from 'react'
import { useTimeout } from 'react-use'
import { Constant, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { makeStyles, useStylesExtends, useCustomSnackbar, ShadowRootPopper } from '@masknet/theme'
import { useValueRef } from '@masknet/shared-base-ui'
import {
    TextField,
    Typography,
    Box,
    Grid,
    MenuItem,
    Snackbar,
    Autocomplete,
    FormControlLabel,
    Checkbox,
    CircularProgress,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { PluginPetMessages, PluginPetRPC } from '../messages'
import { initMeta, initCollection, GLB3DIcon } from '../constants'
import { PreviewBox } from './PreviewBox'
import { PetMetaDB, FilterContract, OwnerERC721TokenInfo, ImageType } from '../types'
import { useUser, useNFTs } from '../hooks'
import { useI18N } from '../../../utils'
import { ImageLoader } from './ImageLoader'
import { petShowSettings } from '../settings'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { saveCustomEssayToRSS } from '../Services/rss3'

const useStyles = makeStyles()((theme) => ({
    desBox: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: theme.spacing(3),
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
        margin: theme.spacing(8, 0, 2),
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
        '-webkit-line-clamp': '1',
        maxWidth: '260px',
        overflow: 'hidden',
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

interface PetSetDialogProps {
    configNFTs: Record<string, Constant> | undefined
    onClose: () => void
}

export function PetSetDialog({ configNFTs, onClose }: PetSetDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const { showSnackbar } = useCustomSnackbar()
    const [loading, setLoading] = useState(false)
    const checked = useValueRef<boolean>(petShowSettings)
    const [isReady, cancel] = useTimeout(2000)

    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

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
            await PluginPetRPC.setUserAddress(user)
            const signature = await connection?.signMessage(user.userId, 'personalSign', { account: user.address })
            if (signature && connection) {
                await saveCustomEssayToRSS(user.address, meta, signature, connection)
            }
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
    }, [metaData.image, collection.tokens])

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
                                {blacklist.includes(option.contract) ? t('plugin_pets_dialog_unverified') : ''}
                            </Typography>
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
                        InputProps={{
                            ...params.InputProps,
                            classes: { root: classes.inputBorder },
                            endAdornment: (
                                <Fragment>
                                    {state ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </Fragment>
                            ),
                        }}
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
            <Box>
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
                        <TextField
                            className={classes.inputOption}
                            InputProps={{ classes: { root: classes.inputArea } }}
                            label={holderChange ? t('plugin_pets_dialog_msg_optional') : t('plugin_pets_dialog_msg')}
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
                    label={t('plugin_pets_dialog_check_title')}
                    sx={{ marginTop: '4px' }}
                />
                <ChainBoundary
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={ChainId.Mainnet}
                    predicate={(actualPluginID) => actualPluginID === NetworkPluginID.PLUGIN_EVM}
                    noSwitchNetworkTip
                    ActionButtonPromiseProps={{
                        size: 'large',
                        fullWidth: true,
                    }}>
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
                </ChainBoundary>
                <Box className={classes.desBox}>
                    <Typography className={classes.des}>{t('plugin_pets_dialog_created')}</Typography>
                    <Typography className={classes.des}>{t('plugin_pets_dialog_powered')}</Typography>
                </Box>
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={isTipVisible}
                message={t('plugin_pets_dialog_success')}
            />
        </>
    )
}
