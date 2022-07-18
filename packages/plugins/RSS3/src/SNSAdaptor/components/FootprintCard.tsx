import { Typography } from '@mui/material'
import fromUnixTime from 'date-fns/fromUnixTime'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import type { GeneralAsset } from '../../types'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        padding: 3,
        marginBottom: 16,
    },
    cover: {
        flexShrink: 1,
        height: 126,
        width: 126,
        borderRadius: 8,
        objectFit: 'cover',
    },
    content: {
        marginLeft: 12,
        marginTop: 12,
    },
}))

const formatDate = (ts: string): string => {
    return fromUnixTime(Number.parseInt(ts, 16)).toLocaleDateString('en-US')
}
export interface FootprintProps {
    username: string
    footprint: GeneralAsset
}

export const FootprintCard = ({ footprint }: FootprintProps) => {
    const t = useI18N()
    const { classes } = useStyles()

    // Calc display date
    let displayDate: string
    if (footprint.info.start_date && footprint.info.end_date) {
        displayDate = formatDate(footprint.info.start_date)
        if (footprint.info.start_date !== footprint.info.end_date) {
            displayDate += ` ~ ${formatDate(footprint.info.end_date)}`
        }
    } else {
        displayDate = t.no_activity_time()
    }

    // Calc location
    const location = footprint.info.city || footprint.info.country || 'Metaverse'

    return (
        <div className={classes.card}>
            <section className="flex flex-row flex-shrink-0 w-max h-max">
                <img
                    className={classes.cover}
                    src={footprint.info.image_preview_url || RSS3_DEFAULT_IMAGE}
                    alt={t.inactive_project()}
                />
            </section>
            <section className={classes.content}>
                <div className="flex flex-row items-center gap-2 no-underline">
                    <Typography variant="body1" color="textPrimary">
                        {displayDate}
                    </Typography>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Typography variant="body1" color="textPrimary">
                        @ {location}
                    </Typography>
                </div>
                <div className="flex flex-row gap-2 font-medium">
                    <Typography variant="body1" className="capitalize" style={{ color: 'rgb(255, 180, 38)' }}>
                        {t.attended()}
                    </Typography>
                    <Typography variant="body1" color="textPrimary">
                        {footprint.info.title || ''}
                    </Typography>
                </div>
            </section>
        </div>
    )
}
