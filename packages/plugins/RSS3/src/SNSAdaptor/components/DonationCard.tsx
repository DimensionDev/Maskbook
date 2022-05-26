import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import classnames from 'classnames'
import { HTMLProps, Fragment } from 'react'
import { useI18N } from '../../locales'

export interface DonationCardProps extends HTMLProps<HTMLDivElement> {
    imageUrl: string
    name: string
    contribCount: number
    contribDetails: {
        token: string
        amount: string
    }[]
}

const useStyles = makeStyles()((theme) => ({
    card: {
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: MaskColorVar.twitterBg,
        padding: theme.spacing(1),
        flexGrow: 1,
        alignItems: 'stretch',
    },
    cover: {
        flexShrink: 1,
        height: 90,
        width: 90,
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
        marginLeft: theme.spacing(1),
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

export const DonationCard = ({
    imageUrl,
    name,
    contribCount,
    contribDetails,
    className,
    ...rest
}: DonationCardProps) => {
    const { classes } = useStyles()
    const t = useI18N()
    return (
        <div className={classnames(classes.card, className)} {...rest}>
            <img className={classes.cover} src={imageUrl} alt={name} />
            <dl className={classes.info}>
                <dt className={classes.infoRow}>
                    <Typography
                        variant="h6"
                        color="textPrimary"
                        fontWeight={600}
                        className={classes.title}
                        title={name}>
                        {name}
                    </Typography>
                </dt>
                <dd className={classes.infoRow}>
                    <span className={classes.infoLabel}>{contribCount}</span>
                    <span className={classes.infoValue}> {t.contribution({ count: contribCount })}</span>
                </dd>
                <dd className={classes.infoRow}>
                    {contribDetails.map((contrib, i) => (
                        <Fragment key={i}>
                            <span className={classes.infoLabel}>{contrib.amount}</span>
                            <span className={classes.infoValue}> {contrib.token} </span>
                        </Fragment>
                    ))}
                </dd>
            </dl>
        </div>
    )
}
