import { useState } from 'react'
import {
    makeStyles,
    createStyles,
    Avatar,
    Box,
    CardHeader,
    CardContent,
    Link,
    Paper,
    Tab,
    Tabs,
    Typography,
} from '@material-ui/core'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import { ArticleTab } from './ArticleTab'
import { TokenTab } from './TokenTab'
import { OfferTab } from './OfferTab'
import { ListingTab } from './ListingTab'
import { HistoryTab } from './HistoryTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleCard } from './CollectibleCard'
import { CollectibleSkeleton } from './CollectibleSkeleton'
import { head } from 'lodash-es'
import { formatBalance } from '../../Wallet/formatter'
import BigNumber from 'bignumber.js'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            width: '100%',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
        },
        content: {
            width: '100%',
            height: 'var(--contentHeight)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 !important',
        },
        body: {
            flex: 1,
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tabs: {
            height: 'var(--tabHeight)',
            width: '100%',
            minHeight: 'unset',
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
        },
        tab: {
            height: 'var(--tabHeight)',
            minHeight: 'unset',
            minWidth: 'unset',
        },
        subtitle: {
            fontSize: 12,
            marginRight: theme.spacing(0.5),
            wordBreak: 'break-word',
        },
        description: {
            fontSize: 12,
            '& > strong': {
                color: theme.palette.text.primary,
                fontWeight: 300,
            },
        },
        footnote: {
            margin: theme.spacing(1, 0, 0),
        },
        countdown: {
            fontSize: 12,
            borderRadius: 8,
            display: 'block',
            white: '100%',
            color: theme.palette.common.white,
            backgroundColor: '#eb5757',
            padding: theme.spacing(0.5, 2),
        },
    })
})

export interface CollectibleProps {}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const { asset } = CollectibleState.useContainer()

    const [tabIndex, setTabIndex] = useState(0)

    if (asset.loading) {
        return <CollectibleSkeleton />
    }

    if (!asset.value) return null

    const targetOrder = head(asset.value?.orders)

    const tabs = [
        <Tab className={classes.tab} key="article" label="Article" />, // This is the tab for the hero image
        <Tab className={classes.tab} key="details" label="Details" />, // This is the tab for the token detailed information
        <Tab className={classes.tab} key="offers" label="Offers" />, // This is the tab for listing offers
        <Tab className={classes.tab} key="listing" label="Listing" />, // This is the tab for listing article
        <Tab className={classes.tab} key="history" label="History" />, // This is the tab for the trade history
    ]

    return (
        <>
            <CollectibleCard classes={classes}>
                <CardHeader
                    avatar={
                        <Link
                            href={`https://opensea.io/accounts/${
                                asset.value.owner?.user?.username ?? asset.value.owner?.address ?? ''
                            }`}
                            title={asset.value.owner?.user?.username ?? asset.value.owner?.address ?? ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Avatar src={asset.value.owner?.profile_img_url} />
                        </Link>
                    }
                    title={asset.value.name ?? ''}
                    subheader={
                        <>
                            <Box display="flex" alignItems="center">
                                <Typography className={classes.subtitle} variant="body2">
                                    {asset.value.description}
                                </Typography>
                                {asset.value.collection.safelist_request_status === 'verified' ? (
                                    <VerifiedUserIcon color="primary" fontSize="small" />
                                ) : null}
                            </Box>

                            {targetOrder?.currentPrice ? (
                                <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
                                    <Typography
                                        className={classes.description}
                                        component="span"
                                        dangerouslySetInnerHTML={{
                                            __html: t('plugin_collectible_description', {
                                                price: formatBalance(new BigNumber(targetOrder?.currentPrice), 18),
                                            }),
                                        }}
                                    />
                                </Box>
                            ) : null}
                        </>
                    }
                />
                <CardContent className={classes.content}>
                    <Tabs
                        className={classes.tabs}
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
                    <Paper className={classes.body}>
                        {tabIndex === 0 ? <ArticleTab /> : null}
                        {tabIndex === 1 ? <TokenTab /> : null}
                        {tabIndex === 2 ? <OfferTab /> : null}
                        {tabIndex === 3 ? <ListingTab /> : null}
                        {tabIndex === 4 ? <HistoryTab /> : null}
                    </Paper>
                </CardContent>
            </CollectibleCard>
            <Box className={classes.footnote}>
                <Typography className={classes.countdown}>Sale ends in 00:25:32.</Typography>
            </Box>
        </>
    )
}
