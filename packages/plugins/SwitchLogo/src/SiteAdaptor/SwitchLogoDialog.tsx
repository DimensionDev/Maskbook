import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { InjectedDialog, useOpenApplicationSettings } from '@masknet/shared'
import { Button, Checkbox, DialogContent, FormControlLabel, IconButton, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { CrossIsolationMessages, SwitchLogoType, switchLogoSettings } from '@masknet/shared-base'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { share } from '@masknet/plugin-infra/content-script/context'
import { useValueRef } from '@masknet/shared-base-ui'
import { delay } from '@masknet/kit'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
        border: `1px solid ${theme.palette.maskColor.secondaryLine}`,
        width: 170,
        height: 74,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        cursor: 'pointer',
        gap: 8,
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

export const SwitchLogoDialog = memo(() => {
    const { _ } = useLingui()
    const { classes, cx } = useStyles()
    const identity = useLastRecognizedIdentity()
    const defaultLogoType = useValueRef(switchLogoSettings[identity?.identifier?.userId || ''])
    const [logoType, setLogoType] = useState<SwitchLogoType>(SwitchLogoType.Classics)
    const [needShare, setNeedShare] = useState(true)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.switchLogoDialogUpdated.on(async (data) => {
            setOpen(data.open)
        })
    }, [])

    const onSave = useCallback(async () => {
        if (!identity?.identifier?.userId || !switchLogoSettings) return

        switchLogoSettings[identity.identifier.userId].value = logoType ?? defaultLogoType
        await delay(300)
        Telemetry.captureEvent(EventType.Access, EventID.EntrySwitchLogoSave)
        setOpen(false)
        if (needShare && logoType === SwitchLogoType.Classics) {
            share?.(
                [
                    _(msg`I just replaced Twitter X logo with the original blue bird one with Mask Network extension.`),
                    '#TwitterLogo #TwitterX #SaveTheBird\n',
                    _(msg`Download https://mask.io to try more powerful tools on Twitter.`),
                ].join('\n'),
            )
        }
    }, [logoType, identity?.identifier?.userId, defaultLogoType, needShare])

    const onChange = useCallback((logoType: SwitchLogoType) => {
        setLogoType(logoType)
    }, [])

    const openApplicationBoardDialog = useOpenApplicationSettings()
    const disabled = useMemo(() => {
        if (defaultLogoType === SwitchLogoType.None) return false
        if (defaultLogoType === logoType) return true
        return false
    }, [defaultLogoType, logoType])

    if (!open) return

    return (
        <InjectedDialog
            open={open}
            onClose={() => setOpen(false)}
            title={<Trans>Switch Twitter Logo</Trans>}
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
                        <Typography fontSize={14} fontWeight={700}>
                            <Trans>Classics Logo</Trans>
                        </Typography>
                    </Stack>
                    <Stack
                        className={cx(
                            classes.iconButton,
                            (logoType || defaultLogoType) === SwitchLogoType.New ? classes.selected : '',
                        )}
                        onClick={() => onChange(SwitchLogoType.New)}>
                        <Icons.TwitterX />
                        <Typography fontSize={14} fontWeight={700}>
                            <Trans>New Logo</Trans>
                        </Typography>
                    </Stack>
                </Stack>
                <Stack>
                    {logoType === SwitchLogoType.Classics ?
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="primary"
                                    checked={needShare}
                                    onChange={(event) => setNeedShare(event.target.checked)}
                                />
                            }
                            label={
                                <Typography
                                    fontSize={14}
                                    fontWeight={400}
                                    lineHeight="18px"
                                    color={(theme) => theme.palette.maskColor.secondaryDark}>
                                    <Trans>Share and recommend this feature after saving.</Trans>
                                </Typography>
                            }
                        />
                    :   <br />}
                </Stack>
                <Stack className={classes.buttons}>
                    <Button variant="roundedContained" fullWidth onClick={onSave} disabled={disabled}>
                        <Trans>Save</Trans>
                    </Button>
                </Stack>
                <Stack className={classes.powered_by}>
                    <Trans>
                        <Typography
                            fontSize="14px"
                            fontWeight={700}
                            marginRight="5px"
                            color={(theme) => theme.palette.maskColor.secondaryDark}>
                            Powered by{' '}
                        </Typography>
                        <Typography fontSize="14px" fontWeight={700} marginRight="4px">
                            Mask Network
                        </Typography>
                    </Trans>
                    <IconButton size="small" sx={{ margin: '-5px' }} onClick={() => openApplicationBoardDialog()}>
                        <Icons.Gear size={24} />
                    </IconButton>
                </Stack>
            </DialogContent>
        </InjectedDialog>
    )
})
