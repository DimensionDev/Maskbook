import { useState } from 'react'
import { makeStyles, DialogContent, Tab, Tabs } from '@material-ui/core'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ChainState } from '../../../web3/state/useChainState'
import { ListingByPriceCard } from './ListingByPriceCard'
import { ListingByHighestBidCard } from './ListingByHighestBidCard'
import type { useAsset } from '../hooks/useAsset'
import { useTokenWatched } from '../../../web3/hooks/useTokenWatched'
import { first } from 'lodash-es'

const useStyles = makeStyles((theme) => {
    return {
        content: {
            padding: 0,
        },
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2, 2),
        },

        label: {},
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
    const classes = useStyles()

    const { chainId } = ChainState.useContainer()
    const tokenWatched = useTokenWatched(selectedPaymentToken)

    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [<Tab key="price" label="Set Price" />, <Tab key="bid" label="Highest Bid" />]

    return (
        <InjectedDialog title="Post Listing" open={open} onClose={onClose} DialogProps={{ maxWidth: 'md' }}>
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
