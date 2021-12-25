import urlcat from 'urlcat'
import { makeStyles } from '@masknet/theme'
import type { AddressName } from '@masknet/web3-shared-evm'
import { Box, CircularProgress, Link, Typography } from '@mui/material'
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

const getFootprintLink = (label: string, footprint: GeneralAssetWithTags) => {
    const { platform, identity, id, type } = footprint
    return urlcat(`https://${label}.bio/singlefootprint/:platform/:identity/:id/:type`, {
        platform,
        identity,
        id,
        type: type.replaceAll('-', '.'),
    })
}

export interface FootprintPageProps {
    addressName?: AddressName
}

export function FootprintPage(props: FootprintPageProps) {
    const { addressName } = props
    const { classes } = useStyles()
    const { value: profile } = useRss3Profile(addressName?.resolvedAddress ?? '')
    const username = profile?.name

    const { value: footprints = [], loading } = useFootprints(addressName?.resolvedAddress ?? '')

    if (!addressName) return null

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
                    href={getFootprintLink(addressName.label, footprint)}
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
