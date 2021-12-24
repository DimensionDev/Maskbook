import { makeStyles } from '@masknet/theme'
import { Link } from '@mui/material'
import urlcat from 'urlcat'
import type { GeneralAsset, GeneralAssetWithTags } from '../types'
import { RSS3_DEFAULT_IMAGE } from '../constants'
import { DonationCard } from './components'
import { useI18N } from '../../../utils'

const getDonationLink = (address: string, donation: GeneralAssetWithTags) => {
    const { platform, identity, id, type } = donation
    return urlcat('https://rss3.bio/:address/singlegitcoin/:platform/:identity/:id/:type', {
        address,
        platform,
        identity,
        id,
        type: type.replaceAll('-', '.'),
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
    donations?: GeneralAsset[]
}

export function DonationPage(props: DonationPageProps) {
    const { address, donations = [] } = props
    const { t } = useI18N()
    const { classes } = useStyles()

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
                        name={donation.info.title || t('plugin_profile_rss3_inactive_project')}
                        contribCount={donation.info.total_contribs || 0}
                        contribDetails={donation.info.token_contribs || []}
                    />
                </Link>
            ))}
        </section>
    )
}
