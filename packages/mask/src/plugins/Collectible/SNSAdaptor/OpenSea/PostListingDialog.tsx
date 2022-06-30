import { useState } from 'react'
import { DialogContent, Tab, Typography } from '@mui/material'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../utils'
import { ListingByPriceCard } from './ListingByPriceCard'
import { ListingByHighestBidCard } from './ListingByHighestBidCard'
import { TabContext, TabPanel } from '@mui/lab'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
            borderRadius: 0,
        },
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2, 2),
        },
        button: {
            marginTop: theme.spacing(1.5),
        },
        labelWrapper: {
            display: 'flex',
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
    const paymentTokens = asset?.auction?.offerTokens ?? asset?.payment_tokens ?? []

    const { t } = useI18N()
    const { classes } = useStyles()

    const [tabIndex, setTabIndex] = useState(0)
    const _tabs = [
        <Tab key="price" label={t('plugin_collectible_set_price')} />,
        <Tab key="bid" label={t('plugin_collectible_highest_bid')} />,
    ]

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
