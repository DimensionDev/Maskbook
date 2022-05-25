import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { CollectibleState } from '../hooks/useCollectibleState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useControlledDialog } from '../../../utils/hooks/useControlledDialog'
import { MakeOfferDialog } from './MakeOfferDialog'
import { PostListingDialog } from './PostListingDialog'
import { CheckoutDialog } from './CheckoutDialog'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: 'calc(100% - 24px)',
        },
        button: {
            flex: 1,
            backgroundColor: theme.palette.maskColor.dark,
            '&:hover': {
                backgroundColor: theme.palette.maskColor.dark,
            },
            color: 'white',
        },
    }
})

export interface ActionBarProps {}

export function ActionBar(props: ActionBarProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { asset, assetOrder } = CollectibleState.useContainer()
    const assets = asset.value

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
        <Box className={classes.root} sx={{ padding: 1.5 }} display="flex" justifyContent="center">
            <EthereumChainBoundary chainId={ChainId.Mainnet} renderInTimeline>
                {!asset.value.isOwner && asset.value.is_auction && assetOrder.value ? (
                    <ActionButton
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        onClick={onOpenCheckoutDialog}>
                        {t('plugin_collectible_buy_now')}
                    </ActionButton>
                ) : null}
                {!asset.value.isOwner && asset.value.is_auction ? (
                    <ActionButton
                        className={classes.button}
                        color="primary"
                        fullWidth
                        variant="contained"
                        onClick={onOpenOfferDialog}>
                        {t('plugin_collectible_place_bid')}
                    </ActionButton>
                ) : null}

                {!asset.value.isOwner && !asset.value.is_auction ? (
                    <ActionButton
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        onClick={onOpenOfferDialog}>
                        {t('plugin_collectible_make_offer')}
                    </ActionButton>
                ) : null}
                {assets?.isOwner ? (
                    <ActionButton
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        onClick={onOpenListingDialog}>
                        {t('plugin_collectible_sell')}
                    </ActionButton>
                ) : null}
                <CheckoutDialog
                    asset={asset}
                    order={assetOrder}
                    open={openCheckoutDialog}
                    onClose={onCloseCheckoutDialog}
                />
                <MakeOfferDialog asset={asset} open={openOfferDialog} onClose={onCloseOfferDialog} />
                <PostListingDialog asset={asset} open={openListingDialog} onClose={onCloseListingDialog} />
            </EthereumChainBoundary>
        </Box>
    )
}
