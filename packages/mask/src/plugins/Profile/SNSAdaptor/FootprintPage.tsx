import urlcat from 'urlcat'
import { makeStyles } from '@masknet/theme'
import { Link } from '@mui/material'
import type { GeneralAsset, GeneralAssetWithTags } from '../types'
import { RSS3_DEFAULT_IMAGE } from '../constants'
import { FootprintCard } from './components'
import { useRss3Profile } from './hooks'

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

const getFootprintLink = (address: string, footprint: GeneralAssetWithTags) => {
    const { platform, identity, id, type } = footprint
    return urlcat('https://rss3.bio/:address/singlefootprint/:platform/:identity/:id/:type', {
        address,
        platform,
        identity,
        id,
        type: type.replaceAll('-', '.'),
    })
}

export interface FootprintPageProps {
    address: string
    footprints?: GeneralAsset[]
}

export function FootprintPage(props: FootprintPageProps) {
    const { address, footprints = [] } = props
    const { classes } = useStyles()
    const { value: profile } = useRss3Profile(address)
    const username = profile?.name

    return (
        <section className="grid items-center justify-start grid-cols-1 gap-2 py-4">
            {footprints.map((footprint) => (
                <Link
                    className={classes.link}
                    href={getFootprintLink(address, footprint)}
                    key={footprint.id}
                    target="_blank"
                    rel="noopener noreferrer">
                    <FootprintCard
                        imageUrl={footprint.info.image_preview_url || RSS3_DEFAULT_IMAGE}
                        startDate={footprint.info.start_date}
                        endDate={footprint.info.end_date}
                        city={footprint.info.country}
                        country={footprint.info.city}
                        username={username ?? ''}
                        activity={footprint.info.title || ''}
                    />
                </Link>
            ))}
        </section>
    )
}
