import { useState, useMemo, ReactNode } from 'react'
import { useTimeout } from 'react-use'
import { Constant, isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
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
} from '@mui/material'
import { PluginPetMessages, PluginPetRPC } from '../messages'
import { initMeta, initCollection, GLB3DIcon } from '../constants'
import { PreviewBox } from './PreviewBox'
import { PetMetaDB, FilterContract, OwnerERC721TokenInfo, ImageType } from '../types'
import { useUser, useNFTs, useNFTsExtra } from '../hooks'
import { PluginWalletStatusBar, useI18N } from '../../../utils'
import { ImageLoader } from './ImageLoader'
import { petShowSettings } from '../settings'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { saveCustomEssayToRSS } from '../Services/rss3'
import { RSS3Icon } from '../assets/rss3'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
    desBox: {
        display: 'flex',
        justifyContent: 'flex-end',
        margin: theme.spacing(2, 0),
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
    icon: {
        margin: theme.spacing(0, 1),
        width: 21,
        height: 15,
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
    const nfts = useNFTs(user, configNFTs)
    const extraData = useNFTsExtra(configNFTs)
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

    const renderImg = (address: string) => {
        const matched = extraData.find((item) => isSameAddress(item.address, address))
        return <ImageLoader className={classes.thumbnail} src={matched?.logoURL ?? ''} />
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
                getOptionLabel={(option) => option?.metadata?.name ?? ''}
                PaperComponent={({ children }) => paperComponent(children)}
                PopperComponent={ShadowRootPopper}
                renderOption={(props, option) => (
                    <Box component="li" className={classes.itemFix} {...props}>
                        {!option.glbSupport ? (
                            <ImageLoader className={classes.thumbnail} src={option?.metadata?.imageURL} />
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
            <Box style={{ padding: '16px 16px 0 16px' }}>
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
                <Box className={classes.desBox}>
                    <Typography fontSize={14} fontWeight={700} className={classes.poweredBy}>
                        {t('powered_by')}
                    </Typography>
                    <Typography color="textPrimary" fontSize={14} fontWeight={700}>
                        MintTeam
                    </Typography>
                    <img className={classes.icon} src={new URL('../assets/pets.png', import.meta.url).toString()} />
                    <Typography fontSize={14} color="textSecondary" fontWeight={700} className={classes.des}>
                        &
                    </Typography>
                    <Typography fontSize={14} color="textSecondary" fontWeight={700} className={classes.des}>
                        RSS3
                    </Typography>
                    <RSS3Icon size={24} />
                </Box>
            </Box>

            <PluginWalletStatusBar>
                <ChainBoundary
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={ChainId.Mainnet}
                    predicate={(actualPluginID) => actualPluginID === NetworkPluginID.PLUGIN_EVM}
                    noSwitchNetworkTip
                    ActionButtonPromiseProps={{
                        size: 'large',
                        fullWidth: true,
                    }}>
                    <ActionButton
                        loading={loading}
                        fullWidth
                        className={classes.btn}
                        onClick={saveHandle}
                        disabled={!collection.name || !metaData.image}>
                        {t('plugin_pets_dialog_btn')}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={isTipVisible}
                message={t('plugin_pets_dialog_success')}
            />
        </>
    )
}
