import { useState } from 'react'
import { DialogContent } from '@mui/material'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { InjectedDialog, useRemoteControlledDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/index.js'
import { PersonaSelectPanel, type PositionOption } from './PersonaSelectPanel.js'

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
            height: 386,
            padding: theme.spacing(1),
            background: theme.palette.maskColor.bottom,
            position: props.positionStyle.position,
            top: props.positionStyle.top,
            right: props.positionStyle.right,
        },
        content: {
            padding: theme.spacing(0, 2, 2, 2),
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        header: {
            background: `${theme.palette.maskColor.bottom} !important`,
        },
    }
})

const positionStyleMap: Record<PositionOption, PositionStyle> = {
    center: {},
    'top-right': {
        position: 'absolute',
        top: 0,
        right: 0,
    },
}

export function PersonaSelectPanelDialog() {
    const { t } = useI18N()

    const [finishTarget, setFinishTarget] = useState<string>()
    const [position, setPosition] = useState<PositionOption>('center')
    const [enableVerify, setEnableVerify] = useState(true)
    const { classes } = useStyles({ positionStyle: positionStyleMap[position] })

    const { open, closeDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
        (ev) => {
            if (!ev.open) {
                setFinishTarget(undefined)
            } else {
                setFinishTarget(ev.target)
                setEnableVerify(ev.enableVerify)
                setPosition(ev.position ?? 'center')
            }
        },
    )

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
            title={t('applications_persona_title')}
            titleBarIconStyle="close">
            <DialogContent classes={{ root: classes.content }}>
                <PersonaSelectPanel enableVerify={enableVerify} finishTarget={finishTarget} onClose={closeDialog} />
            </DialogContent>
        </InjectedDialog>
    ) : null
}
