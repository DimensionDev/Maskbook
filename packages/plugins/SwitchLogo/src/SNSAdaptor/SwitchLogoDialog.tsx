import { memo, useCallback, useEffect, useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { Button, Checkbox, DialogContent, FormControlLabel, IconButton, Stack, Typography } from '@mui/material'
import { useI18N } from '../locales/index.js'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { CrossIsolationMessages, SwitchLogoType, switchLogoSettings } from '@masknet/shared-base'
import { useLastRecognizedSocialIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { useValueRef } from '@masknet/shared-base-ui'

const useStyles = makeStyles()((theme) => ({
    dialog: {
        width: 400,
        position: 'absolute',
        top: 10,
        right: 10,
    },
    content: {
        padding: 24,
    },
    iconButton: {
        border: '1px solid Transparent',
        width: 170,
        height: 74,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        cursor: 'pointer',
    },
    selected: {
        border: `1px solid ${theme.palette.maskColor.highlight}`,
    },
    icons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    buttons: {
        display: 'flex',
        gap: 8,
        flexDirection: 'row',
    },
    powered_by: {
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 16,
        justifyContent: 'end',
        alignItems: 'center',
    },
}))

interface SwitchLogoDialogProps {}

export const SwitchLogoDialog = memo<SwitchLogoDialogProps>(() => {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const [open, setOpen] = useState(false)
    const { loading, value: socialIdentity } = useLastRecognizedSocialIdentity()
    const defaultLogoType = useValueRef(switchLogoSettings[socialIdentity?.identifier?.userId || ''])
    const [logoType, setLogoType] = useState<SwitchLogoType>()
    const { share } = useSNSAdaptorContext()
    const [needShare, setNeedShare] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.switchLogoUpdated.on((data) => {
            setOpen(data.open)
        })
    }, [])

    const openApplicationBoardDialog = useCallback(() => {}, [])

    const shareText = [t.share_text(), t.share_mask()].join('\n')
    const onSave = useCallback(async () => {
        if (!socialIdentity?.identifier?.userId) return
        switchLogoSettings[socialIdentity.identifier.userId].value = logoType ?? defaultLogoType
        setOpen(false)
        if (needShare) {
            share?.(shareText)
        }
    }, [logoType, socialIdentity, defaultLogoType, share, needShare, shareText])

    const onReset = useCallback(() => {
        if (!socialIdentity?.identifier?.userId) return
        switchLogoSettings[socialIdentity.identifier.userId].value = SwitchLogoType.New
        setOpen(false)
    }, [socialIdentity])

    const onChange = useCallback((logoType: SwitchLogoType) => {
        setLogoType(logoType)
    }, [])

    if (loading) return null

    return (
        <InjectedDialog
            open={open}
            onClose={() => setOpen(false)}
            title={t.title()}
            classes={{ paper: classes.dialog }}>
            <DialogContent className={classes.content}>
                <Stack className={classes.icons}>
                    <Stack
                        className={cx(
                            classes.iconButton,
                            (logoType || defaultLogoType) === SwitchLogoType.Classics ? classes.selected : '',
                        )}
                        onClick={() => onChange(SwitchLogoType.Classics)}>
                        <Icons.TwitterColored />
                        <Typography>{t.classics_logo()}</Typography>
                    </Stack>
                    <Stack
                        className={cx(
                            classes.iconButton,
                            (logoType || defaultLogoType) === SwitchLogoType.New ? classes.selected : '',
                        )}
                        onClick={() => onChange(SwitchLogoType.New)}>
                        <Icons.Twitter3 />
                        <Typography>{t.new_logo()}</Typography>
                    </Stack>
                </Stack>
                <Stack>
                    <FormControlLabel
                        control={
                            <Checkbox
                                color="primary"
                                checked={needShare}
                                onChange={(event) => setNeedShare(event.target.checked)}
                            />
                        }
                        label={
                            <Typography fontSize={14} fontWeight={400} lineHeight="18px">
                                {t.save_tip()}
                            </Typography>
                        }
                    />
                </Stack>
                <Stack className={classes.buttons}>
                    <Button variant="roundedContained" fullWidth onClick={onReset}>
                        {t.reset()}
                    </Button>
                    <Button variant="roundedContained" fullWidth onClick={onSave}>
                        {t.save()}
                    </Button>
                </Stack>
                <Stack className={classes.powered_by}>
                    <Typography
                        fontSize="14px"
                        fontWeight={700}
                        marginRight="5px"
                        color={(theme) => theme.palette.maskColor.secondaryDark}>
                        {t.powered_by()}
                    </Typography>
                    <Typography
                        fontSize="14px"
                        fontWeight={700}
                        marginRight="4px"
                        color={(theme) => theme.palette.maskColor.dark}>
                        {t.mask_network()}
                    </Typography>
                    <IconButton size="small" sx={{ margin: '-5px' }} onClick={openApplicationBoardDialog}>
                        <Icons.Gear size={24} />
                    </IconButton>
                </Stack>
            </DialogContent>
        </InjectedDialog>
    )
})
