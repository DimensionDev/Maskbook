import { useCallback } from 'react'
import { Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import type { DashboardRoutes } from '@masknet/shared-base'

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

export interface OpenPageConfirm {
    target: 'dashboard' | 'other'
    url: string
    title: string
    text: string
    actionHint: string
    position?: 'center' | 'top-right'
}

export interface LeavePageConfirmProps {
    open: boolean
    onClose: () => void
    openDashboard?: (route?: DashboardRoutes, search?: string) => ReturnType<typeof browser.tabs.create>
    info?: OpenPageConfirm
}

export function LeavePageConfirm(props: LeavePageConfirmProps) {
    const { open, onClose, info, openDashboard } = props
    const { classes } = useStyles({ positionStyle: positionStyleMap[info?.position ?? 'center'] })

    const onClick = useCallback(() => {
        if (!info) return
        if (info.target === 'dashboard') {
            openDashboard?.(info.url as DashboardRoutes)
            onClose()
            return
        }
    }, [info, onClose, openDashboard])

    return open ? (
        <InjectedDialog
            disableTitleBorder
            open={open}
            classes={{
                paper: classes.root,
                dialogTitle: classes.header,
            }}
            maxWidth="sm"
            onClose={onClose}
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
