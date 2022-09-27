import { forwardRef, HTMLProps, memo } from 'react'
import formatDateTime from 'date-fns/format'
import { AssetPreviewer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
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

const { MaskNetworkMap } = RSS3BaseAPI

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
            const pluginID = useCurrentWeb3NetworkPluginID()

            const date = footprint.timestamp
                ? formatDateTime(new Date(footprint.timestamp), 'MMM dd, yyyy')
                : t.no_activity_time()
            const action = footprint.actions[0]

            return (
                <div className={cx(classes.card, className)} {...rest} ref={ref} onClick={() => onSelect?.(footprint)}>
                    <Card className={classes.img}>
                        <AssetPreviewer
                            classes={{
                                fallbackImage: classes.fallbackImage,
                            }}
                            pluginID={pluginID}
                            chainId={RSS3BaseAPI.MaskNetworkMap[footprint.network]}
                            url={action.metadata?.image || RSS3_DEFAULT_IMAGE}
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
