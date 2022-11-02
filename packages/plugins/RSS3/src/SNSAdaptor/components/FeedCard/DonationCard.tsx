import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import { FC, HTMLProps, memo, useState } from 'react'
import Markdown from 'react-markdown'
import { Translate } from '../../../locales/i18n_generated'
import { useAddressLabel } from '../../hooks'
import { CardType } from '../share'
import { Slider } from '../Slider'
import { CardFrame, FeedCardProps } from '../base'
import { formatValue, Label } from './common'

const useStyles = makeStyles<void, 'image'>()((theme, _, refs) => ({
    summary: {
        fontSize: '14px',
        color: theme.palette.maskColor.third,
    },
    content: {
        marginTop: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
        alignItems: 'flex-start',
    },
    body: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        [`.${refs.image}`]: {
            width: 64,
            height: 64,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
        },
    },
    image: {},
    info: {
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: 14,
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        marginLeft: theme.spacing(1.5),
        height: 80,
    },
    title: {
        fontWeight: 700,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    subtitle: {
        fontWeight: 400,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
    },
}))

const { Tag } = RSS3BaseAPI
export function isDonationFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.DonationFeed {
    return feed.tag === Tag.Donation
}

interface DonationCardProps extends Omit<FeedCardProps, 'feed' | 'action'> {
    feed: RSS3BaseAPI.DonationFeed
    action?: RSS3BaseAPI.DonationFeed['actions'][number]
}

interface CardBodyProps extends HTMLProps<HTMLDivElement> {
    metadata: RSS3BaseAPI.DonateMetadata
}
const CardBody: FC<CardBodyProps> = memo(({ metadata, className, ...rest }) => {
    const { classes, cx } = useStyles()
    return (
        <div className={cx(classes.body, className)} {...rest}>
            <Image classes={{ container: classes.image }} src={metadata.logo} height={64} width={64} />
            <div className={classes.info}>
                <Typography className={classes.title}>{metadata.title}</Typography>
                <Typography className={classes.subtitle}>{metadata.description}</Typography>
            </div>
        </div>
    )
})

/**
 * DonationCard
 * Including:
 *
 * - DonationDonate
 */
export const DonationCard: FC<DonationCardProps> = ({ feed, action: feedAction, ...rest }) => {
    const { verbose } = rest
    const { classes } = useStyles()

    const [index, setIndex] = useState(0)
    const action = feedAction ?? feed.actions[index]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)

    if (verbose) {
        return (
            <CardFrame type={CardType.DonationDonate} feed={feed} {...rest}>
                <Typography className={classes.summary}>
                    <Translate.donation_donate_verbose
                        values={{
                            user,
                            cost_value: formatValue(metadata?.token),
                            cost_symbol: metadata?.token?.symbol ?? '',
                            project: action.metadata?.title ?? '',
                        }}
                        components={{
                            bold: <Label />,
                        }}
                    />
                </Typography>
                <Image src={metadata!.logo} width="100%" />
                <Markdown>{metadata!.description}</Markdown>
            </CardFrame>
        )
    }

    return (
        <CardFrame type={CardType.DonationDonate} feed={feed} action={action} {...rest}>
            <Typography className={classes.summary}>
                <Translate.donation_donate
                    values={{
                        user,
                        cost_value: formatValue(metadata?.token),
                        cost_symbol: metadata?.token?.symbol ?? '',
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            {feed.actions.length > 1 ? (
                <Slider className={classes.content} onUpdate={setIndex}>
                    {feed.actions.map((action, index) => (
                        <CardBody key={index} metadata={action.metadata!} />
                    ))}
                </Slider>
            ) : (
                <CardBody className={classes.content} metadata={feed.actions[0].metadata!} />
            )}
        </CardFrame>
    )
}
