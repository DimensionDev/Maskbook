import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, Link, Typography } from '@mui/material'
import urlcat from 'urlcat'
import { useI18N } from '../../locales'
import type { GeneralAssetWithTags } from '../../types'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import { DonationCard } from '../components'
import { useDonations } from '../hooks'

const getDonationLink = (address: string, donation: GeneralAssetWithTags) => {
    const { platform, identity, id, type } = donation
    return urlcat('https://rss3.bio/:address/singlegitcoin/:platform/:identity/:id/:type', {
        address,
        platform,
        identity,
        id,
        type,
    })
}

const useStyles = makeStyles()((theme) => ({
    address: {
        color: theme.palette.primary.main,
    },
    link: {
        '&:hover': {
            textDecoration: 'none',
        },
    },
}))

export interface DonationPageProps {
    address: string
}

export function DonationPage(props: DonationPageProps) {
    const { address } = props
    const { classes } = useStyles()
    const { value: donations = [], loading } = useDonations(address)
    const t = useI18N()

    if (loading) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center">
                <CircularProgress />
            </Box>
        )
    }
    if (!donations.length) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center">
                <Typography color="textPrimary">No data.</Typography>
            </Box>
        )
    }
    return (
        <section className="grid grid-cols-1 gap-4 py-4">
            {donations.map((donation) => (
                <Link
                    className={classes.link}
                    href={getDonationLink(address, donation)}
                    key={donation.id}
                    target="_blank"
                    rel="noopener noreferrer">
                    <DonationCard
                        imageUrl={donation.info.image_preview_url || RSS3_DEFAULT_IMAGE}
                        name={donation.info.title || t.inactive_project()}
                        contribCount={donation.info.total_contribs || 0}
                        contribDetails={donation.info.token_contribs || []}
                    />
                </Link>
            ))}
        </section>
    )
}
