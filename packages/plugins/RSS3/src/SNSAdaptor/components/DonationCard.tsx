import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import classnames from 'classnames'
import { HTMLProps, Fragment } from 'react'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import { useI18N } from '../../locales'
import type { GeneralAsset } from '../../types'

export interface DonationCardProps extends HTMLProps<HTMLDivElement> {
    donation: GeneralAsset
}

const useStyles = makeStyles()((theme) => ({
    card: {
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: MaskColorVar.twitterBg,
        flexGrow: 1,
        alignItems: 'stretch',
        padding: 3,
    },
    cover: {
        flexShrink: 1,
        height: 126,
        width: 126,
        borderRadius: 8,
        objectFit: 'cover',
    },
    title: {
        color: theme.palette.text.primary,
        fontSize: 16,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    info: {
        flexGrow: 1,
        marginLeft: '12px',
        fontSize: 16,
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'space-around',
        fontFamily: '-apple-system,system-ui,sans-serif',
    },
    infoRow: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    infoLabel: {
        color: theme.palette.text.primary,
    },
    infoValue: {
        color: theme.palette.text.secondary,
    },
}))

export const DonationCard = ({ donation, className, ...rest }: DonationCardProps) => {
    const { classes } = useStyles()
    const t = useI18N()
    return (
        <div className={classnames(classes.card, className)} {...rest}>
            <img
                className={classes.cover}
                src={donation.info.image_preview_url || RSS3_DEFAULT_IMAGE}
                alt={donation.info.title || t.inactive_project()}
            />
            <div className={classes.info}>
                <div className={classes.infoRow}>
                    <Typography
                        variant="h6"
                        color="textPrimary"
                        fontWeight={600}
                        className={classes.title}
                        title={donation.info.title || t.inactive_project()}>
                        {donation.info.title || t.inactive_project()}
                    </Typography>
                </div>
                <div className={classes.infoRow}>
                    <span className={classes.infoLabel}>{donation.info.total_contribs || 0} </span>
                    <span className={classes.infoValue}>
                        {t.contribution({ count: donation.info.total_contribs || 0 })}
                    </span>
                </div>
                <div className={classes.infoRow}>
                    {(donation.info.token_contribs || []).map((contrib, i) => (
                        <Fragment key={i}>
                            <span className={classes.infoLabel}>{contrib.amount}</span>
                            <span className={classes.infoValue}> {contrib.token} </span>
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}
