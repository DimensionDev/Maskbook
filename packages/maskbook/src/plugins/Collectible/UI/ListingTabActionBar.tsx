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

export interface ListingTabActionBarProps {}

export function ListingTabActionBar(props: ListingTabActionBarProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const { asset, token } = CollectibleState.useContainer()

    const { onOpen: onOpenMakeListingDialog } = useRemoteControlledDialogEvent(
        PluginCollectibleMessage.events.postListingDialogEvent,
    )

    return (
        <Box sx={{ padding: 2 }} display="flex" justifyContent="flex-end">
            <ActionButton
                className={classes.button}
                color="primary"
                variant="contained"
                onClick={onOpenMakeListingDialog}>
                {t('plugin_collectible_sell')}
            </ActionButton>
        </Box>
    )
}
