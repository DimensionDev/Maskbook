import { Typography } from '@mui/material'
import fromUnixTime from 'date-fns/fromUnixTime'
import formatDateTime from 'date-fns/format'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import type { RSS3BaseAPI } from '@masknet/web3-providers'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        padding: 3,
        marginBottom: 16,
        cursor: 'pointer',
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
        marginTop: 15,
    },
    infoRow: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 400,
        color: theme.palette.maskColor.main,
    },
}))

const formatDate = (ts: string): string => {
    return fromUnixTime(Number.parseInt(ts, 16)).toLocaleDateString('en-US')
}
export interface FootprintProps {
    username: string
    footprint: RSS3BaseAPI.Collection
    onSelect: () => void
}

export const FootprintCard = ({ footprint, onSelect }: FootprintProps) => {
    const t = useI18N()
    const { classes } = useStyles()

    const date = footprint.timestamp
        ? formatDateTime(new Date(footprint.timestamp), 'MMM dd, yyyy')
        : t.no_activity_time()

    return (
        <div className={classes.card} onClick={onSelect}>
            <section className="flex flex-row flex-shrink-0 w-max h-max">
                <img
                    className={classes.cover}
                    src={footprint.imageURL || RSS3_DEFAULT_IMAGE}
                    alt={t.inactive_project()}
                />
            </section>
            <section className={classes.content}>
                <Typography className={classes.infoRow}>{date}</Typography>
                <Typography className={classes.infoRow}>@ {footprint.location}</Typography>
                <Typography className={classes.infoRow}>{footprint.title}</Typography>
            </section>
        </div>
    )
}
