import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useCrossChainBridgeTrans } from '../locales/index.js'
import { InjectedDialog } from '@masknet/shared'
import { BridgeStack } from './components/BridgeStack.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        height: 532,
        padding: theme.spacing(2),
    },
}))

interface CrossChainBridgeDialogProps extends withClasses<'root'> {
    open: boolean
    onClose(): void
}

export function CrossChainBridgeDialog(props: CrossChainBridgeDialogProps) {
    const t = useCrossChainBridgeTrans()
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
