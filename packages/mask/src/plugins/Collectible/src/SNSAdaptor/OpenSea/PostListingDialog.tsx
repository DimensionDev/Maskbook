import { TabContext, TabPanel } from '@mui/lab'
import { DialogContent, Tab, Typography } from '@mui/material'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useI18N } from '../../../../../utils/index.js'
import { ListingByPriceCard } from './ListingByPriceCard.js'
import { ListingByHighestBidCard } from './ListingByHighestBidCard.js'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
            borderRadius: 0,
        },
        labelWrapper: {
            display: 'flex',
        },
    }
})

export interface PostListingDialogProps {
    asset?: Web3Helper.NonFungibleAssetScope<'all'>
    open: boolean
    onClose: () => void
}

export function PostListingDialog(props: PostListingDialogProps) {
    const { asset, open, onClose } = props
    const paymentTokens = asset?.auction?.offerTokens ?? asset?.paymentTokens ?? []

    const { t } = useI18N()
    const { classes } = useStyles()

    const [currentTab, onChange, tabs] = useTabs('price', 'bid')

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                title={t('plugin_collectible_post_listing')}
                open={open}
                onClose={onClose}
                maxWidth="md"
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange} aria-label="Redpacket">
                        <Tab
                            label={
                                <div className={classes.labelWrapper}>
                                    <Typography>{t('plugin_collectible_set_price')}</Typography>
                                </div>
                            }
                            value={tabs.price}
                        />
                        <Tab
                            label={
                                <div className={classes.labelWrapper}>
                                    <Typography>{t('plugin_collectible_highest_bid')}</Typography>
                                </div>
                            }
                            value={tabs.bid}
                        />
                    </MaskTabList>
                }>
                <DialogContent className={classes.content}>
                    <TabPanel value={tabs.price} style={{ padding: 0 }}>
                        <ListingByPriceCard asset={asset} paymentTokens={paymentTokens} open={open} onClose={onClose} />
                    </TabPanel>
                    <TabPanel value={tabs.bid} style={{ padding: 0 }}>
                        <ListingByHighestBidCard
                            asset={asset}
                            paymentTokens={paymentTokens}
                            open={open}
                            onClose={onClose}
                        />
                    </TabPanel>
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}
