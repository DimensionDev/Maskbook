import urlcat from 'urlcat'
import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, Link, List, ListItem, Typography } from '@mui/material'
import { AddressName, EMPTY_LIST } from '@masknet/web3-shared-evm'
import { useI18N } from '../../locales'
import type { GeneralAssetWithTags } from '../../types'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import { DonationCard } from '../components'
import { useDonations } from '../hooks'

const getDonationLink = (label: string, donation: GeneralAssetWithTags) => {
    const { platform, identity, id, type } = donation
    return urlcat(`https://${label}.bio/singlegitcoin/:platform/:identity/:id/:type`, {
        platform,
        identity,
        id,
        type: type.replaceAll('-', '.'),
    })
}

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(6),
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridGap: theme.spacing(2),
    },
    listItem: {
        overflow: 'auto',
        padding: 0,
    },
    donationCard: {
        width: '100%',
        overflow: 'auto',
    },
    address: {
        color: theme.palette.primary.main,
    },
    link: {
        width: '100%',
        '&:hover': {
            textDecoration: 'none',
        },
    },
}))

export interface DonationPageProps {
    addressName?: AddressName
}

export function DonationPage(props: DonationPageProps) {
    const { addressName } = props
    const { classes } = useStyles()
    const { value: donations = EMPTY_LIST, loading } = useDonations(addressName?.resolvedAddress ?? '')
    const t = useI18N()

    if (!addressName) return null

    if (loading) {
        return (
            <Box className={classes.statusBox}>
                <CircularProgress />
            </Box>
        )
    }
    if (!donations.length) {
        return (
            <Box className={classes.statusBox}>
                <Typography color="textPrimary">No data.</Typography>
            </Box>
        )
    }
    return (
        <List className={classes.list}>
            {donations.map((donation) => (
                <ListItem key={donation.id} className={classes.listItem}>
                    <Link
                        className={classes.link}
                        href={getDonationLink(addressName.label, donation)}
                        target="_blank"
                        rel="noopener noreferrer">
                        <DonationCard
                            className={classes.donationCard}
                            imageUrl={donation.info.image_preview_url || RSS3_DEFAULT_IMAGE}
                            name={donation.info.title || t.inactive_project()}
                            contribCount={donation.info.total_contribs || 0}
                            contribDetails={donation.info.token_contribs || []}
                        />
                    </Link>
                </ListItem>
            ))}
        </List>
    )
}
