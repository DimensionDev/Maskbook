import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '../../../contexts'
import { useSharedI18N } from '../../../locales'
import { Box, DialogContent, Link, Typography } from '@mui/material'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import differenceInCalendarDays from 'date-fns/differenceInDays'
import differenceInCalendarHours from 'date-fns/differenceInHours'
import { LinkOut } from '@masknet/icons'
import { ChainId, explorerResolver } from '@masknet/web3-shared-evm'

interface CollectionDetailCardProps {
    img?: string
    open: boolean
    title?: string
    referenceUrl?: string
    description?: string
    contributions?: RSS3BaseAPI.DonationTx[]
    onClose: () => void
    date?: string
    location?: string
}
const useStyles = makeStyles()((theme) => ({
    img: {
        flexShrink: 1,
        height: 300,
        width: 300,
        borderRadius: 8,
        objectFit: 'cover',
    },
    flexItem: {
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
    },
    dayBox: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.maskColor.highlight,
    },
    linkBox: {
        display: 'flex',
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: theme.palette.maskColor.highlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 24,
    },
    link: {
        color: theme.palette.maskColor.highlight,
    },
    txItem: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    donationAmount: {
        fontSize: 16,
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
    },
    threeLine: {
        display: '-webkit-box',
        '-webkit-line-clamp': 3,
        height: 60,
        fontSize: 14,
        fontWeight: 400,
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '-webkit-box-orient': 'vertical',
    },
    themeColor: {
        color: theme.palette.maskColor.highlight,
    },
}))

export const CollectionDetailCard = memo<CollectionDetailCardProps>(
    ({ img, open, onClose, title, referenceUrl, description, contributions, date, location }) => {
        const t = useSharedI18N()
        const { classes } = useStyles()

        return (
            <InjectedDialog open={open} onClose={onClose} title={t.details()}>
                <DialogContent>
                    <Box className={classes.flexItem}>
                        <img className={classes.img} src={img} />
                    </Box>
                    <Typography fontSize="16px" fontWeight={700} marginTop="38px">
                        {title}
                    </Typography>
                    <Link rel="noopener noreferrer" target="_blank" href={referenceUrl} className={classes.link}>
                        {referenceUrl}
                    </Link>
                    {date && (
                        <Typography fontSize="14px" fontWeight={400} marginTop="12px">
                            {date}
                        </Typography>
                    )}
                    {location && (
                        <Typography fontSize="14px" fontWeight={400} marginTop="8px">
                            <span className={classes.themeColor}>@</span>
                            {location}
                        </Typography>
                    )}
                    <Typography fontSize="16px" fontWeight={700} marginTop="16px">
                        {t.description()}
                    </Typography>
                    <div style={{ display: '-webkit-box' }} className={classes.threeLine}>
                        {description}
                    </div>
                    {contributions ? (
                        <Typography fontSize="16px" fontWeight={700} marginTop="16px">
                            {t.contributions()}
                        </Typography>
                    ) : null}
                    {contributions ? (
                        <Typography fontSize="16px" fontWeight={700} marginBottom="16px">
                            {contributions?.length ?? 0}
                        </Typography>
                    ) : null}
                    {contributions?.map((contribution) => (
                        <div key={contribution.txHash} className={classes.txItem}>
                            <Typography className={classes.donationAmount}>
                                {contribution.formatedAmount} {contribution.symbol}
                            </Typography>
                            <div className={classes.dayBox}>
                                {differenceInCalendarDays(new Date(), new Date(Number(contribution.timeStamp) * 1000))}{' '}
                                {t.days()}{' '}
                                {differenceInCalendarHours(
                                    new Date(),
                                    new Date(Number(contribution.timeStamp) * 1000),
                                ) % 24}{' '}
                                {t.hours()} {t.ago()}
                                <Link
                                    className={classes.linkBox}
                                    target="_blank"
                                    href={explorerResolver.transactionLink(ChainId.Mainnet, contribution.txHash)}>
                                    <LinkOut size={18} color="white" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </DialogContent>
            </InjectedDialog>
        )
    },
)
