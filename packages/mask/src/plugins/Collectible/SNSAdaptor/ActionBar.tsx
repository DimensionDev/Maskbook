import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { CollectibleState } from '../hooks/useCollectibleState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useControlledDialog } from '../../../utils/hooks/useControlledDialog'
import { MakeOfferDialog } from './MakeOfferDialog'
import { PostListingDialog } from './PostListingDialog'
import { CheckoutDialog } from './CheckoutDialog'

const useStyles = makeStyles()((theme) => {
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
    const { classes } = useStyles()
    const { asset, token, assetOrder } = CollectibleState.useContainer()

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
    const is_show_buy_now =
        !asset.value.is_owner && !asset.value.is_sale_end && asset.value.num_sales && assetOrder.value
    const is_show_place_bid =
        !asset.value.is_owner && asset.value.end_time && !asset.value.is_sale_end && !asset.value.num_sales
    const is_show_make_offer = !asset.value.is_owner && asset.value.num_sales
    const is_show_sell = asset.value.is_owner
    return (
        <Box className={classes.root} sx={{ marginTop: 1 }} display="flex" justifyContent="center">
            {is_show_buy_now && (
                <ActionButton
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={onOpenCheckoutDialog}>
                    {t('plugin_collectible_buy_now')}
                </ActionButton>
            )}
            {is_show_place_bid && (
                <ActionButton
                    className={classes.button}
                    color="primary"
                    fullWidth
                    variant="contained"
                    onClick={onOpenOfferDialog}>
                    {t('plugin_collectible_place_bid')}
                </ActionButton>
            )}
            {is_show_make_offer && (
                <ActionButton
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={onOpenOfferDialog}>
                    {t('plugin_collectible_make_offer')}
                </ActionButton>
            )}
            {is_show_sell && (
                <ActionButton
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={onOpenListingDialog}>
                    {t('plugin_collectible_sell')}
                </ActionButton>
            )}
            <CheckoutDialog
                assetOrder={assetOrder}
                asset={asset}
                open={openCheckoutDialog}
                onClose={onCloseCheckoutDialog}
            />
            <MakeOfferDialog asset={asset} open={openOfferDialog} onClose={onCloseOfferDialog} />
            <PostListingDialog asset={asset} open={openListingDialog} onClose={onCloseListingDialog} />
        </Box>
    )
}
