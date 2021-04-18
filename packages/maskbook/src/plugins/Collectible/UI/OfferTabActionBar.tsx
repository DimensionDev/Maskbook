import { makeStyles, createStyles, Box } from '@material-ui/core'
import { CollectibleState } from '../hooks/useCollectibleState'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { PluginCollectibleMessage } from '../messages'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useRemoteControlledDialogEvent } from '../../../utils/hooks/useRemoteControlledDialog'

const useStyles = makeStyles((theme) => {
    return createStyles({
        button: {
            marginLeft: theme.spacing(1),
        },
    })
})

export interface OfferTabActionBarProps {}

export function OfferTabActionBar(props: OfferTabActionBarProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const { asset, token } = CollectibleState.useContainer()

    const { onOpen: onOpenMakeOfferDialog } = useRemoteControlledDialogEvent(
        PluginCollectibleMessage.events.makeOfferDialogEvent,
    )

    return (
        <Box sx={{ padding: 2 }} display="flex" justifyContent="flex-end">
            <ActionButton
                className={classes.button}
                color="primary"
                variant="contained"
                onClick={onOpenMakeOfferDialog}>
                {t('plugin_collectible_make_offer')}
            </ActionButton>
        </Box>
    )
}
