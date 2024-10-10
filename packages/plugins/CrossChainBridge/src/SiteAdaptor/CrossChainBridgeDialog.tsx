import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import { BridgeStack } from './components/BridgeStack.js'
import { Trans } from '@lingui/macro'

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
    const { classes } = useStyles(undefined, { props })
    const { open, onClose } = props

    return (
        <InjectedDialog title={<Trans>Cross-chain</Trans>} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <BridgeStack />
            </DialogContent>
        </InjectedDialog>
    )
}
