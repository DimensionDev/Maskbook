import { useState } from 'react'
import { DialogContent, Tab, Tabs } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ListingByPriceCard } from './ListingByPriceCard'
import { ListingByHighestBidCard } from './ListingByHighestBidCard'
import type { useAsset } from '../hooks/useAsset'
import { useChainId, useFungibleTokenWatched } from '@masknet/web3-shared'
import { first } from 'lodash-es'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
        },
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2, 2),
        },
        button: {
            marginTop: theme.spacing(1.5),
        },
    }
})

export interface PostListingDialogProps {
    asset?: ReturnType<typeof useAsset>
    open: boolean
    onClose: () => void
}

export function PostListingDialog(props: PostListingDialogProps) {
    const { asset, open, onClose } = props
    const paymentTokens = asset?.value?.offer_payment_tokens ?? []
    const selectedPaymentToken = first(paymentTokens)

    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const tokenWatched = useFungibleTokenWatched(selectedPaymentToken)

    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab key="price" label={t('plugin_collectible_set_price')} />,
        <Tab key="bid" label={t('plugin_collectible_highest_bid')} />,
    ]

    return (
        <InjectedDialog title={t('plugin_collectible_post_listing')} open={open} onClose={onClose} maxWidth="md">
            <DialogContent className={classes.content}>
                <Tabs
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    value={tabIndex}
                    onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                    TabIndicatorProps={{
                        style: {
                            display: 'none',
                        },
                    }}>
                    {tabs}
                </Tabs>
                {tabIndex === 0 ? (
                    <ListingByPriceCard
                        asset={asset}
                        tokenWatched={tokenWatched}
                        paymentTokens={paymentTokens}
                        open={open}
                        onClose={onClose}
                    />
                ) : null}
                {tabIndex === 1 ? (
                    <ListingByHighestBidCard
                        asset={asset}
                        tokenWatched={tokenWatched}
                        paymentTokens={paymentTokens}
                        open={open}
                        onClose={onClose}
                    />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
