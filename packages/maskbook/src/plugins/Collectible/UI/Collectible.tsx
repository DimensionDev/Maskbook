import { useState } from 'react'
import {
    makeStyles,
    createStyles,
    Avatar,
    Box,
    Card,
    CardHeader,
    CardContent,
    Link,
    Paper,
    Tab,
    Tabs,
    Typography,
} from '@material-ui/core'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import HourglassFullIcon from '@material-ui/icons/HourglassFull'
import LocalOfferIcon from '@material-ui/icons/LocalOffer'
import { ArticleTab } from './ArticleTab'
import { TokenTab } from './TokenTab'
import { OfferTab } from './OfferTab'
import { ListingTab } from './ListingTab'
import { HistoryTab } from './HistoryTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import { CollectibleState } from '../hooks/useCollectibleState'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            '--contentHeight': '400px',
            '--tabHeight': '35px',

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
            hegiht: 'calc(var(--contentHeight) - var(--tabHeight))',
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

    const { token, asset } = CollectibleState.useContainer()

    const [tabIndex, setTabIndex] = useState(0)

    const tabs = [
        <Tab className={classes.tab} key="article" label="Article" />, // This is the tab for the hero image
        <Tab className={classes.tab} key="details" label="Details" />, // This is the tab for the token detailed information
        <Tab className={classes.tab} key="offers" label="Offers" />, // This is the tab for listing offers
        <Tab className={classes.tab} key="listing" label="Listing" />, // This is the tab for listing article
        <Tab className={classes.tab} key="history" label="History" />, // This is the tab for the trade history
    ]

    return (
        <>
            <Card className={classes.root} elevation={0}>
                <CardHeader
                    avatar={
                        <Link
                            href="https://opensea.io/assets/0x31385d3520bced94f77aae104b406994d8f2168c/2244"
                            title="BASTARD GAN PUNKS V2"
                            target="_blank"
                            rel="noopener noreferrer">
                            <Avatar src="https://lh3.googleusercontent.com/1KYi3sOU5v2dnLLCaJ4yY1BRb-Jbr063nDEvA_4DMh5QD1EXZAAoMLHbCjV6k-lJ3AYhc72KHYo9AnGoKVbszkACAtofxMyXeZ7rSA=s0" />
                        </Link>
                    }
                    title="BASTARD GAN PUNK V2 #2244"
                    subheader={
                        <>
                            <Box display="flex" alignItems="center">
                                <Typography className={classes.subtitle} variant="body2">
                                    BASTARD GAN PUNKS V2 BASTARD GAN PUNKS V2 BASTARD GAN PUNKS V2 BASTARD GAN PUNKS V2
                                    BASTARD GAN PUNKS V2 BASTARD GAN PUNKS V2
                                </Typography>
                                <VerifiedUserIcon color="primary" fontSize="small" />
                            </Box>
                            <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
                                <Typography
                                    className={classes.description}
                                    component="span"
                                    dangerouslySetInnerHTML={{
                                        __html: t('plugin_collectible_description', {
                                            price: '0.632 ETH',
                                        }),
                                    }}
                                />
                            </Box>
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
            </Card>
            <Box className={classes.footnote}>
                <Typography className={classes.countdown}>Sale ends in 00:25:32.</Typography>
            </Box>
        </>
    )
}
