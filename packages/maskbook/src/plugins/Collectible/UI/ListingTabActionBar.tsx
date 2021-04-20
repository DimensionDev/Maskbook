import { makeStyles, createStyles, Box } from '@material-ui/core'
import { CollectibleState } from '../hooks/useCollectibleState'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useAccount } from '../../../web3/hooks/useAccount'
import { PostListingDialog } from './PostListingDialog'
import { useControlledDialog } from './useControlledDialog'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {},
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

    const {
        open: openListingDialog,
        onOpen: onOpenListingDialog,
        onClose: onCloseListingDialog,
    } = useControlledDialog()

    return (
        <Box className={classes.root} sx={{ padding: 2 }} display="flex" justifyContent="flex-end">
            <ActionButton className={classes.button} color="primary" variant="contained" onClick={onOpenListingDialog}>
                {t('plugin_collectible_sell')}
            </ActionButton>
            <PostListingDialog asset={asset} open={openListingDialog} onClose={onCloseListingDialog} />
        </Box>
    )
}
