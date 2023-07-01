import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { PersonaSelectPanel, type PositionOption } from '../../components/PersonaSelectPanel/index.js'
import { useSharedI18N } from '../../../locales/index.js'
import { InjectedDialog } from '../../contexts/components/InjectedDialog.js'

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

interface PersonaSelectPanelDialogProps {
    finishTarget?: string
    enableVerify?: boolean
    position?: PositionOption
    open: boolean
    onClose: () => void
}
export function PersonaSelectPanelDialog({
    open,
    enableVerify = true,
    position = 'center',
    finishTarget,
    onClose,
}: PersonaSelectPanelDialogProps) {
    const t = useSharedI18N()

    const { classes } = useStyles({ positionStyle: positionStyleMap[position] })

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
            title={t.applications_persona_title()}
            titleBarIconStyle="close">
            <DialogContent classes={{ root: classes.content }}>
                <PersonaSelectPanel enableVerify={enableVerify} finishTarget={finishTarget} onClose={onClose} />
            </DialogContent>
        </InjectedDialog>
    ) : null
}
