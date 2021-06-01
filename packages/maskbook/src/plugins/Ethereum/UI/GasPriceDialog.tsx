import { DialogContent, makeStyles, Theme } from '@material-ui/core'
import { useGasPrices } from '@dimensiondev/web3-shared'
import { EthereumMessages } from '../messages'
import { useRemoteControlledDialog, useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'

const useStyles = makeStyles((theme: Theme) => ({
    content: {},
}))

export function GasPriceDialog() {
    const classes = useStyles()
    const { t } = useI18N()
    const { value: gasPrices, loading } = useGasPrices()
    const { open, closeDialog } = useRemoteControlledDialog(
        EthereumMessages.events.gasPriceDialogUpdated,
        (_ev) => void 0,
    )
    console.log({ gasPrices, loading })
    return (
        <InjectedDialog
            open={open}
            onClose={closeDialog}
            title={t('plugin_gas_fee_dialog_title')}
            DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>1123</DialogContent>
        </InjectedDialog>
    )
}
