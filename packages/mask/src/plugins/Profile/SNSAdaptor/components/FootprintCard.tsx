import { ImageHolder } from './ImageHolder'
import { Typography } from '@mui/material'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import fromUnixTime from 'date-fns/fromUnixTime'

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

export const FootprintCard = ({ imageUrl, startDate, endDate, city, country, username, activity }: FootprintProps) => {
    // Calc display date
    let displayDate
    if (startDate && endDate) {
        displayDate = formatDate(startDate)
        if (endDate !== startDate) {
            displayDate += ' ~ ' + formatDate(endDate)
        }
    } else {
        displayDate = 'No activity time'
    }

    // Calc location
    const location = city || country || 'Metaverse'

    return (
        <div className="flex flex-row justify-start gap-2 p-4 cursor-pointer">
            <section className="flex flex-row flex-shrink-0 w-max h-max">
                <ImageHolder imageUrl={imageUrl} isFullRound={true} size={76} />
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
                    <Typography variant="body1" style={{ color: 'rgba(255, 180, 38, 1)' }}>
                        {username} attended
                    </Typography>
                    <Typography variant="body1" color="textPrimary">
                        {activity}
                    </Typography>
                </div>
            </section>
        </div>
    )
}
