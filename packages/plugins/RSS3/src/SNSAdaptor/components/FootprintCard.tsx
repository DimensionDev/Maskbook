import { forwardRef, HTMLProps, memo } from 'react'
import formatDateTime from 'date-fns/format'
import { AssetPreviewer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import { Card, Typography } from '@mui/material'
import { RSS3_DEFAULT_IMAGE } from '../../constants.js'
import { useI18N } from '../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        padding: 3,
        marginBottom: 16,
        cursor: 'pointer',
    },
    content: {
        marginLeft: 12,
        marginTop: 15,
    },
    infoRow: {
        marginBottom: 8,
        fontWeight: 400,
        color: theme.palette.maskColor.main,
    },
    img: {
        width: 126,
        height: 126,
        borderRadius: '8px',
        objectFit: 'cover',
    },
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: 64,
        height: 64,
    },
}))

export interface FootprintCardProps extends Omit<HTMLProps<HTMLDivElement>, 'onSelect'>, withClasses<'img'> {
    footprint: RSS3BaseAPI.Footprint
    onSelect: (footprint: RSS3BaseAPI.Footprint) => void
    disableDescription?: boolean
}

export const FootprintCard = memo(
    forwardRef<HTMLDivElement, FootprintCardProps>(
        ({ footprint, onSelect, disableDescription, className, classes: externalClasses, ...rest }, ref) => {
            const t = useI18N()
            const { classes, cx } = useStyles(undefined, { props: { classes: externalClasses } })

            const date = footprint.timestamp
                ? formatDateTime(new Date(footprint.timestamp), 'MMM dd, yyyy')
                : t.no_activity_time()
            const action = footprint.actions[0]

            return (
                <div className={cx(classes.card, className)} {...rest} ref={ref} onClick={() => onSelect?.(footprint)}>
                    <Card className={classes.img}>
                        <AssetPreviewer
                            url={action.metadata?.image || RSS3_DEFAULT_IMAGE}
                            classes={{
                                fallbackImage: classes.fallbackImage,
                            }}
                        />
                    </Card>
                    {disableDescription ? null : (
                        <section className={classes.content}>
                            <Typography className={classes.infoRow}>{date}</Typography>
                            {/* TODO location is missed in RSS3 v1 API */}
                            {/* <Typography className={classes.infoRow}>@ {footprint.location}</Typography> */}
                            <Typography className={classes.infoRow}>{action.metadata?.name}</Typography>
                        </section>
                    )}
                </div>
            )
        },
    ),
)
