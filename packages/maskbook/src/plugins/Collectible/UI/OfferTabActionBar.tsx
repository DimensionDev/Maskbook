import { makeStyles, createStyles, Box } from '@material-ui/core'
import { CollectibleState } from '../hooks/useCollectibleState'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useControlledDialog } from './useControlledDialog'
import { MakeOfferDialog } from './MakeOfferDialog'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {},
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

    const { open: openOfferDialog, onOpen: onOpenOfferDialog, onClose: onCloseOfferDialog } = useControlledDialog()

    return (
        <Box className={classes.root} sx={{ padding: 2 }} display="flex" justifyContent="flex-end">
            <ActionButton className={classes.button} color="primary" variant="contained" onClick={onOpenOfferDialog}>
                {t('plugin_collectible_make_offer')}
            </ActionButton>
            <MakeOfferDialog asset={asset} open={openOfferDialog} onClose={onCloseOfferDialog} />
        </Box>
    )
}
