import { useState } from 'react'
import { DialogContent, Tab, Tabs } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils'
import { InjectedDialog } from '@masknet/shared'
import { ListingByPriceCard } from './ListingByPriceCard'
import { ListingByHighestBidCard } from './ListingByHighestBidCard'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'

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
    asset?: NonFungibleAsset<ChainId, SchemaType>
    open: boolean
    onClose: () => void
}

export function PostListingDialog(props: PostListingDialogProps) {
    const { asset, open, onClose } = props
    const paymentTokens = asset?.auction?.offerTokens ?? []

    const { t } = useI18N()
    const { classes } = useStyles()

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
                    <ListingByPriceCard asset={asset} paymentTokens={paymentTokens} open={open} onClose={onClose} />
                ) : null}
                {tabIndex === 1 ? (
                    <ListingByHighestBidCard
                        asset={asset}
                        paymentTokens={paymentTokens}
                        open={open}
                        onClose={onClose}
                    />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
