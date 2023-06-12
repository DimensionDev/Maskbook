import { Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useCallback, useEffect, useState } from 'react'
import Services from '../../extension/service.js'
import { CrossIsolationMessages, DashboardRoutes, type OpenPageConfirmEvent } from '@masknet/shared-base'

type PositionStyle = {
    top?: number
    right?: number
    position?: 'absolute'
}

const useStyles = makeStyles<{
    positionStyle: PositionStyle
}>()((theme, props) => {
    return {
        root: {
            width: 384,
            background: theme.palette.maskColor.bottom,
            position: props.positionStyle.position,
            top: props.positionStyle.top,
            right: props.positionStyle.right,
        },
        content: {
            padding: theme.spacing(1, 2, 2, 2),
            minHeight: 148,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        header: {
            background: theme.palette.maskColor.bottom,
        },
        actions: {
            padding: theme.spacing(1, 2, 2, 2),
        },
    }
})

type PositionOption = 'center' | 'top-right'

const positionStyleMap: Record<PositionOption, PositionStyle> = {
    center: {},
    'top-right': {
        position: 'absolute',
        top: 0,
        right: 0,
    },
}

export function LeavePageConfirmDialog() {
    const [open, setOpen] = useState(false)
    const [info, setInfo] = useState<OpenPageConfirmEvent>()
    const { classes } = useStyles({ positionStyle: positionStyleMap[info?.position ?? 'center'] })

    const { closeDialog } = useRemoteControlledDialog(CrossIsolationMessages.events.openPageConfirm)

    useEffect(() => {
        return CrossIsolationMessages.events.openPageConfirm.on((evt) => {
            setOpen(evt.open)
            if (!evt.open) return
            setInfo(evt)
        })
    }, [])

    const onClick = useCallback(() => {
        if (!info) return
        if (info.target === 'dashboard') {
            Services.Helper.openDashboard(DashboardRoutes.Setup)
            closeDialog()
            return
        }
    }, [info])

    return open ? (
        <InjectedDialog
            disableTitleBorder
            open={open}
            classes={{
                paper: classes.root,
                dialogTitle: classes.header,
            }}
            maxWidth="sm"
            onClose={closeDialog}
            title={info?.title}
            titleBarIconStyle="close">
            <DialogContent classes={{ root: classes.content }}>
                <Stack>
                    <Typography>{info?.text}</Typography>
                </Stack>
            </DialogContent>
            <DialogActions classes={{ root: classes.actions }}>
                <Stack width="100%">
                    <Button color="primary" style={{ borderRadius: 20 }} onClick={onClick}>
                        {info?.actionHint}
                    </Button>
                </Stack>
            </DialogActions>
        </InjectedDialog>
    ) : null
}
