import urlcat from 'urlcat'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { CircularProgress, Link, Typography } from '@mui/material'
import config from '../apis/config'
import type { GeneralAssetWithTags } from '../apis/types'
import { useFootprints } from './hooks'
import { COLORS } from './common/variables'
import { Button, FootprintCard } from './components'

const useStyles = makeStyles()((theme) => ({
    msg: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
    },
    primaryText: {
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
    username: string
    address: string
}

export function FootprintPage(props: FootprintPageProps) {
    const { username, address } = props
    const { classes } = useStyles()

    const { footprints, loading } = useFootprints(address)

    if (loading) {
        return (
            <div className="flex justify-center items-center">
                <CircularProgress />
            </div>
        )
    }

    return (
        <div>
            <section className="flex flex-row justify-between items-center w-full gap-4">
                <Typography className={classes.primaryText} variant="subtitle1" color="textPrimary" title={address}>
                    {formatEthereumAddress(address, 6)}
                </Typography>
            </section>
            <section className="grid items-center justify-start grid-cols-1 gap-2 py-4">
                {footprints.map((footprint) => (
                    <Link
                        className={classes.link}
                        href={getFootprintLink(address, footprint)}
                        key={footprint.id}
                        target="_blank"
                        rel="noopener noreferrer">
                        <FootprintCard
                            imageUrl={footprint.info.image_preview_url || config.undefinedImageAlt}
                            startDate={footprint.info.start_date}
                            endDate={footprint.info.end_date}
                            city={footprint.info.country}
                            country={footprint.info.city}
                            username={username}
                            activity={footprint.info.title || ''}
                        />
                    </Link>
                ))}
            </section>
        </div>
    )
}
