import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, Link, Typography } from '@mui/material'
import urlcat from 'urlcat'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import type { GeneralAssetWithTags } from '../../types'
import { FootprintCard } from '../components'
import { useFootprints, useRss3Profile } from '../hooks'

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
        type,
    })
}

export interface FootprintPageProps {
    address: string
}

export function FootprintPage(props: FootprintPageProps) {
    const { address } = props
    const { classes } = useStyles()
    const { value: profile } = useRss3Profile(address)
    const username = profile?.name

    const { value: footprints = [], loading } = useFootprints(address)

    if (loading) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center">
                <CircularProgress />
            </Box>
        )
    }
    if (!footprints.length) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center">
                <Typography color="textPrimary">No data.</Typography>
            </Box>
        )
    }

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
