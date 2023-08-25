import { memo, useCallback, useRef, useState } from 'react'
import { useAsyncFn, useDropArea } from 'react-use'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AvatarEditor from 'react-avatar-editor'
import { Box, Button, Slider, Tab, Typography } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { Icons } from '@masknet/icons'
import { ActionButton, MaskTabList, makeStyles, usePopupCustomSnackbar, useTabs } from '@masknet/theme'
import { useUpdateEffect } from '@react-hookz/web'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Web3, Web3Storage } from '@masknet/web3-providers'
import { PERSONA_AVATAR_DB_NAMESPACE, PersonaContext, type PersonaAvatarData } from '@masknet/shared'
import { BottomController } from '../../../components/BottomController/index.js'
import { DefaultWeb3ContextProvider, useChainContext } from '@masknet/web3-hooks-base'
import { NormalHeader, useModalNavigate } from '../../../components/index.js'
import { PopupModalRoutes, PopupRoutes, SignType } from '@masknet/shared-base'
import { ProfilePhotoType } from '../../Wallet/type.js'
import { NFTAvatarPicker } from '../../../components/NFTAvatarPicker/index.js'
import { useVerifiedWallets, useTitle } from '../../../hooks/index.js'
import Services from '../../../../service.js'
import { MAX_FILE_SIZE } from '../../../constants.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'

const useStyles = makeStyles()((theme) => ({
    tabs: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    tabPanel: {
        padding: 0,
        height: 508,
    },
    uploadBox: {
        background: theme.palette.maskColor.whiteBlue,
        padding: theme.spacing(3),
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        rowGap: 10,
    },
    uploadIcon: {
        width: 54,
        height: 54,
        borderRadius: '50%',
        background: theme.palette.maskColor.secondaryBottom,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: `0px 4px 6px 0px ${
            theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.10)' : 'rgba(102, 108, 135, 0.10)'
        }`,
    },
    typo: {
        color: theme.palette.maskColor.third,
        textAlign: 'center',
        lineHeight: '18px',
    },
    strong: {
        color: theme.palette.maskColor.second,
        textAlign: 'center',
        lineHeight: '18px',
    },
    file: {
        display: 'none',
    },
}))

const PersonaAvatarSetting = memo(function PersonaAvatar() {
    const { t } = useI18N()
    const editor = useRef<AvatarEditor | null>(null)
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()
    const [params] = useSearchParams()
    const { classes } = useStyles()
    const [currentTab, onChange] = useTabs(
        params.get('tab') || ProfilePhotoType.Image,
        ProfilePhotoType.Image,
        ProfilePhotoType.NFT,
    )
    const [avatarLoaded, setAvatarLoaded] = useState(false)

    const { showSnackbar } = usePopupCustomSnackbar()

    const { proofs, currentPersona } = PersonaContext.useContainer()

    const { data: bindingWallets } = useVerifiedWallets(proofs)

    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | string | null>()

    const [scale, setScale] = useState(1)

    const handleSetFile = useCallback((file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            showSnackbar(t('popups_set_avatar_failed'), { variant: 'error' })
            return
        }
        setFile(file)
    }, [])

    const [bound] = useDropArea({
        onFiles(files) {
            handleSetFile(files[0])
        },
    })
    const { account } = useChainContext()

    const handleChangeTab = useCallback(
        (event: unknown, value: any) => {
            if (value === ProfilePhotoType.NFT && !bindingWallets?.length && !account) {
                modalNavigate(PopupModalRoutes.SelectProvider, { onlyMask: true })
                return
            }
            onChange(event, value)
        },
        [onChange, account, bindingWallets],
    )

    const [{ loading: uploadLoading }, handleConfirm] = useAsyncFn(async () => {
        try {
            if (!editor.current || !file || !currentPersona?.identifier) return
            if (typeof file === 'string') {
                let sign: string | undefined
                const data = {
                    imageUrl: file,
                    updateAt: Date.now(),
                }
                // Verify Wallet sign with persona
                if (bindingWallets?.some((x) => isSameAddress(x.identity, account))) {
                    sign = await Services.Identity.signWithPersona(
                        SignType.Message,
                        JSON.stringify(data),
                        currentPersona.identifier,
                        location.origin,
                        true,
                    )
                } else {
                    sign = await Web3.signMessage('message', JSON.stringify(data), {
                        account,
                        silent: true,
                    })
                }

                const storage = Web3Storage.createKVStorage(PERSONA_AVATAR_DB_NAMESPACE)

                await storage.set<PersonaAvatarData>(currentPersona.identifier.rawPublicKey, {
                    ...data,
                    sign,
                })
            }

            await new Promise<void>((resolve, reject) => {
                editor.current?.getImage().toBlob(async (blob) => {
                    if (blob) {
                        const identifier = await Services.Settings.getCurrentPersonaIdentifier()
                        await Services.Identity.updatePersonaAvatar(identifier, blob)
                        resolve()
                    }
                    reject()
                })
            })
            showSnackbar(t('popups_set_avatar_successfully'))
            navigate(PopupRoutes.Personas, { replace: true })
        } catch {
            showSnackbar(t('popups_set_avatar_failed'), { variant: 'error' })
        }
    }, [file, currentPersona, account, bindingWallets])

    useTitle(t('popups_profile_photo'))

    // reset loaded state after file be changed

    useUpdateEffect(() => {
        if (file) setAvatarLoaded(false)
    }, [file])

    if (file) {
        return (
            <Box>
                <NormalHeader />
                <Box p={2}>
                    <AvatarEditor
                        ref={editor}
                        image={file}
                        border={50}
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        scale={scale ?? 1}
                        rotate={0}
                        borderRadius={300}
                        crossOrigin="anonymous"
                        onLoadSuccess={() => setAvatarLoaded(true)}
                    />
                    <Slider
                        max={2}
                        min={0.5}
                        step={0.1}
                        defaultValue={1}
                        onChange={(_, value) => setScale(value as number)}
                        aria-label="Scale"
                    />
                </Box>
                <BottomController>
                    <Button variant="outlined" onClick={() => setFile(null)} fullWidth>
                        {t('cancel')}
                    </Button>
                    <ActionButton fullWidth onClick={handleConfirm} loading={uploadLoading} disabled={!avatarLoaded}>
                        {t('confirm')}
                    </ActionButton>
                </BottomController>
            </Box>
        )
    }

    return (
        <Box flex={1}>
            <TabContext value={currentTab}>
                <NormalHeader
                    tabList={
                        !file ? (
                            <MaskTabList
                                onChange={handleChangeTab}
                                aria-label="profile-photo-tabs"
                                classes={{ root: classes.tabs }}>
                                <Tab label={t('popups_profile_photo_image')} value={ProfilePhotoType.Image} />
                                <Tab label={t('popups_profile_photo_nfts')} value={ProfilePhotoType.NFT} />
                            </MaskTabList>
                        ) : null
                    }
                />
                {!file ? (
                    <>
                        <TabPanel value={ProfilePhotoType.Image} className={classes.tabPanel}>
                            <Box p={2}>
                                <Box className={classes.uploadBox} {...bound}>
                                    <input
                                        className={classes.file}
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        ref={inputRef}
                                        onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                                            if (!currentTarget.files) return
                                            handleSetFile(currentTarget.files[0])
                                        }}
                                    />
                                    <Box className={classes.uploadIcon}>
                                        <Icons.Upload size={30} />
                                    </Box>
                                    <Typography className={classes.typo}>
                                        <strong>{t('popups_profile_photo_drag_file')}</strong>
                                        <br />
                                        {t('popups_profile_photo_size_limit')}
                                    </Typography>
                                    <Typography component="strong" className={classes.strong}>
                                        {t('or')}
                                    </Typography>
                                    <Button
                                        style={{ width: 164 }}
                                        color="info"
                                        onClick={() => inputRef.current?.click()}>
                                        {t('popups_profile_photo_browser_file')}
                                    </Button>
                                </Box>
                            </Box>
                        </TabPanel>
                        <TabPanel value={ProfilePhotoType.NFT} className={classes.tabPanel}>
                            <NFTAvatarPicker
                                onChange={(image: string) => setFile(image)}
                                bindingWallets={bindingWallets}
                            />
                        </TabPanel>
                    </>
                ) : null}
            </TabContext>
        </Box>
    )
})

export default function PersonaAvatarPage() {
    return (
        <DefaultWeb3ContextProvider>
            <PersonaAvatarSetting />
        </DefaultWeb3ContextProvider>
    )
}
