import { makeStyles, Box } from '@material-ui/core'
import { useI18N } from '../../../utils'
import { CollectibleState } from '../hooks/useCollectibleState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useControlledDialog } from './useControlledDialog'
import { MakeOfferDialog } from './MakeOfferDialog'
import { PostListingDialog } from './PostListingDialog'
import { CheckoutDialog } from './CheckoutDialog'
import { useAccount } from '@masknet/web3-shared'

const useStyles = makeStyles((theme) => {
    return {
        root: {
            marginLeft: theme.spacing(-0.5),
            marginRight: theme.spacing(-0.5),
        },
        button: {
            flex: 1,
            margin: `0 ${theme.spacing(0.5)}`,
        },
    }
})

export interface ActionBarProps {}

export function ActionBar(props: ActionBarProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const { asset, token } = CollectibleState.useContainer()

    const {
        open: openCheckoutDialog,
        onOpen: onOpenCheckoutDialog,
        onClose: onCloseCheckoutDialog,
    } = useControlledDialog()
    const { open: openOfferDialog, onOpen: onOpenOfferDialog, onClose: onCloseOfferDialog } = useControlledDialog()
    const {
        open: openListingDialog,
        onOpen: onOpenListingDialog,
        onClose: onCloseListingDialog,
    } = useControlledDialog()

    if (!asset.value) return null

    return (
        <Box className={classes.root} sx={{ marginTop: 1 }} display="flex" justifyContent="center">
            {!asset.value.is_owner && asset.value.is_auction ? (
                <ActionButton
                    className={classes.button}
                    color="primary"
                    fullWidth
                    variant="contained"
                    onClick={onOpenOfferDialog}>
                    {t('plugin_collectible_place_bid')}
                </ActionButton>
            ) : null}
            {!asset.value.is_owner && !asset.value.is_auction && asset.value?.order_ ? (
                <ActionButton
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={onOpenCheckoutDialog}>
                    {t('plugin_collectible_buy_now')}
                </ActionButton>
            ) : null}
            {!asset.value.is_owner && !asset.value.is_auction ? (
                <ActionButton
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={onOpenOfferDialog}>
                    {t('plugin_collectible_make_offer')}
                </ActionButton>
            ) : null}
            {asset.value.is_owner ? (
                <ActionButton
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={onOpenListingDialog}>
                    {t('plugin_collectible_sell')}
                </ActionButton>
            ) : null}
            <CheckoutDialog asset={asset} open={openCheckoutDialog} onClose={onCloseCheckoutDialog} />
            <MakeOfferDialog asset={asset} open={openOfferDialog} onClose={onCloseOfferDialog} />
            <PostListingDialog asset={asset} open={openListingDialog} onClose={onCloseListingDialog} />
        </Box>
    )
}
