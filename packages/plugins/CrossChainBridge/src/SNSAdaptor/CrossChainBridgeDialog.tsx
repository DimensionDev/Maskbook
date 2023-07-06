import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../locales/index.js'
import { InjectedDialog } from '@masknet/shared'
import { BridgeStack } from './components/BridgeStack.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        height: 532,
        padding: theme.spacing(2),
    },
}))

export interface CrossChainBridgeDialogProps extends withClasses<'root'> {
    open: boolean
    onClose(): void
}

export function CrossChainBridgeDialog(props: CrossChainBridgeDialogProps) {
    const t = useI18N()
    const { classes } = useStyles(undefined, { props })
    const { open, onClose } = props

    return (
        <InjectedDialog title={t.__plugin_name()} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <BridgeStack />
            </DialogContent>
        </InjectedDialog>
    )
}
