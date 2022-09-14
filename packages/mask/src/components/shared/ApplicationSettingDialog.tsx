import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../utils/index.js'

interface Props {
    open: boolean
    children: React.ReactNode
    onClose: () => void
}
const useStyles = makeStyles()((theme) => ({
    wrapper: {
        padding: 0,
    },
}))

export enum DialogTabs {
    appList = 0,
    pluginSwitch = 1,
}

export function ApplicationSettingDialog(props: Props) {
    const { open, onClose } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('application_settings')} disableTitleBorder>
            <DialogContent className={classes.wrapper}>{props.children}</DialogContent>
        </InjectedDialog>
    )
}
