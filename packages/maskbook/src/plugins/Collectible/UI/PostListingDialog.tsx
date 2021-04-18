import { useState } from 'react'
import { createStyles, makeStyles, DialogContent, Tab, Tabs } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ChainState } from '../../../web3/state/useChainState'
import { ListingByPriceCard } from './ListingByPriceCard'
import { ListingByHighestBidCard } from './ListingByHighestBidCard'
import type { useAsset } from '../hooks/useAsset'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
    })
})

export interface PostListingDialogProps {
    asset?: ReturnType<typeof useAsset>
    open: boolean
    onClose: () => void
}

export function PostListingDialog(props: PostListingDialogProps) {
    const { asset, open, onClose } = props

    const { t } = useI18N()
    const classes = useStyles()

    const { chainId } = ChainState.useContainer()

    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [<Tab key="price" label="Set Price" />, <Tab key="bid" label="Highest Bid" />]

    return (
        <InjectedDialog title="Post Listing" open={open} onClose={onClose} DialogProps={{ maxWidth: 'md' }}>
            <DialogContent className={classes.content}>
                <Tabs
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
                {tabIndex === 0 ? <ListingByPriceCard onChange={() => {}} /> : null}
                {tabIndex === 1 ? <ListingByHighestBidCard onChange={() => {}} /> : null}
            </DialogContent>
        </InjectedDialog>
    )
}
