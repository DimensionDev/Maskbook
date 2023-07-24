import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { ActionButton, MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, Button, Slider, Tab, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useDropArea } from 'react-use'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AvatarEditor from 'react-avatar-editor'
import { BottomController } from '../../../components/BottomController/index.js'
import { Web3ContextProvider, useChainContext } from '@masknet/web3-hooks-base'
import { useModalNavigate } from '../../../components/index.js'
import { NetworkPluginID, PopupModalRoutes } from '@masknet/shared-base'
import { ProfilePhotoType } from '../../Wallet/type.js'
import { NFTAvatarPicker } from '../../../components/NFTAvatarPicker/index.js'

const useStyles = makeStyles()((theme) => ({
    tabs: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    tabPanel: {
        padding: 0,
        height: '100%',
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
        boxShadow: '',
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
    header: {
        background: theme.palette.maskColor.modalTitleBg,
    },
    titleContainer: {
        display: 'grid',
        gridTemplateColumns: '24px auto 24px',
        padding: theme.spacing(2),

        lineHeight: 0,
        alignItems: 'center',
        flexShrink: 0,
    },
    back: {
        fontSize: 24,
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
    title: {
        fontSize: 14,
        lineHeight: '22px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        minHeight: 22,
        textAlign: 'center',
    },
}))

const PersonaAvatarSetting = memo(function PersonaAvatar() {
    const { t } = useI18N()
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()
    const [params] = useSearchParams()
    const { classes } = useStyles()
    const [currentTab, onChange] = useTabs(
        params.get('tab') || ProfilePhotoType.Image,
        ProfilePhotoType.Image,
        ProfilePhotoType.NFT,
    )

    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | string | null>()
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)

    const [bound] = useDropArea({
        onFiles(files) {
            setFile(files[0])
        },
    })

    const title = useMemo(() => {
        return (
            <Box className={classes.titleContainer}>
                <Icons.Comeback className={classes.back} onClick={() => navigate(-1)} />
                <Typography className={classes.title}>{t('popups_profile_photo')}</Typography>
            </Box>
        )
    }, [classes, navigate])

    const { account } = useChainContext()

    const handleChangeTab = useCallback(
        (event: unknown, value: any) => {
            if (value === ProfilePhotoType.NFT) {
                modalNavigate(PopupModalRoutes.SelectProvider, { onlyMask: true })
                return
            }
            onChange(event, value)
        },
        [onChange, account],
    )

    if (file) {
        return (
            <Box>
                <Box className={classes.header}>{title}</Box>
                <Box p={2}>
                    <AvatarEditor
                        ref={(e) => setEditor(e)}
                        image={file}
                        border={50}
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        scale={scale ?? 1}
                        rotate={0}
                        borderRadius={300}
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
                    <ActionButton fullWidth>{t('confirm')}</ActionButton>
                </BottomController>
            </Box>
        )
    }

    return (
        <Box flex={1}>
            <TabContext value={currentTab}>
                <Box className={classes.header}>
                    {title}
                    {!file ? (
                        <MaskTabList
                            onChange={handleChangeTab}
                            aria-label="profile-photo-tabs"
                            classes={{ root: classes.tabs }}>
                            <Tab label={t('popups_profile_photo_image')} value={ProfilePhotoType.Image} />
                            <Tab label={t('popups_profile_photo_nfts')} value={ProfilePhotoType.NFT} />
                        </MaskTabList>
                    ) : null}
                </Box>
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
                                            if (currentTarget.files) setFile(currentTarget.files.item(0))
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
                            <NFTAvatarPicker onChange={(image: string) => setFile(image)} />
                        </TabPanel>
                    </>
                ) : null}
            </TabContext>
        </Box>
    )
})

export default function PersonaAvatarPage() {
    return (
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
            <PersonaAvatarSetting />
        </Web3ContextProvider>
    )
}
