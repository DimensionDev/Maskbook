import { Typography } from '@mui/material'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import fromUnixTime from 'date-fns/fromUnixTime'
import { ImageHolder } from './ImageHolder'
import { useI18N } from '../../locales'

const formatDate = (ts: string): string => {
    return fromUnixTime(Number.parseInt(ts, 16)).toLocaleDateString('en-US')
}
export interface FootprintProps {
    imageUrl: string
    startDate: string | undefined
    endDate: string | undefined
    city: string | undefined
    country: string | undefined
    username: string
    activity: string
}

export const FootprintCard = ({ imageUrl, startDate, endDate, city, country, activity }: FootprintProps) => {
    const t = useI18N()
    // Calc display date
    let displayDate: string
    if (startDate && endDate) {
        displayDate = formatDate(startDate)
        if (endDate !== startDate) {
            displayDate += ` ~ ${formatDate(endDate)}`
        }
    } else {
        displayDate = t.no_activity_time()
    }

    // Calc location
    const location = city || country || 'Metaverse'

    return (
        <div className="flex flex-row justify-start gap-2 p-4 cursor-pointer">
            <section className="flex flex-row flex-shrink-0 w-max h-max">
                <ImageHolder url={imageUrl} isFullRound size={76} />
            </section>
            <section className="flex flex-col justify-around flex-1 text-sm leading-normal text-body-text">
                <div className="flex flex-row items-center gap-2 no-underline">
                    <EventRoundedIcon className="text-footprint" fontSize="small" />
                    <Typography variant="body1" color="textPrimary">
                        {displayDate}
                    </Typography>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <LocationOnRoundedIcon className="text-footprint" fontSize="small" />
                    <Typography variant="body1" color="textPrimary">
                        {location}
                    </Typography>
                </div>
                <div className="flex flex-row gap-2 font-medium">
                    <Typography variant="body1" className="capitalize" style={{ color: 'rgba(255, 180, 38, 1)' }}>
                        {t.attended()}
                    </Typography>
                    <Typography variant="body1" color="textPrimary">
                        {activity}
                    </Typography>
                </div>
            </section>
        </div>
    )
}
