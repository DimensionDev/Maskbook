import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DialogContent, Typography } from '@mui/material'
import type { Market } from '../types'
import DOMPurify from 'isomorphic-dompurify'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(2, 0),
    },
    message: {
        textAlign: 'center',
    },
}))

interface MarketDetailsProps {
    open: boolean
    onClose: () => void
    market: Market
}

export function MarketDescriptionPopup(props: MarketDetailsProps) {
    const { open, onClose, market } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    const cleanDescription = DOMPurify.sanitize(market.description)

    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onClose}
            title={t('plugin_realitycards_event_description_title')}
            maxWidth="xs">
            <DialogContent>
                <Typography
                    className={classes.message}
                    color="textPrimary"
                    dangerouslySetInnerHTML={{
                        __html: cleanDescription,
                    }}
                />
                <Typography className={classes.message} color="textPrimary">
                    {t('plugin_realitycards_event_description_opening_time') +
                        ': ' +
                        new Date(Number.parseInt(market.openingTime, 10) * 1000).toString()}
                    <br />
                    {t('plugin_realitycards_event_description_closing_time') +
                        ': ' +
                        new Date(Number.parseInt(market.lockingTime, 10) * 1000).toString()}
                </Typography>
            </DialogContent>
        </InjectedDialog>
    )
}

export function MarketDescriptionIcon() {
    return (
        <svg viewBox="0 0 21 15" xmlns="http://www.w3.org/2000/svg" height="18">
            <path d="M0 3.9375H1.3125V2.625H0V3.9375Z" fill="currentColor" />
            <path d="M0 1.3125H1.3125V0H0V1.3125Z" fill="currentColor" />
            <path d="M2.625 14.4375H3.9375V13.125H2.625V14.4375Z" fill="currentColor" />
            <path d="M0 6.5625H1.3125V5.25H0V6.5625Z" fill="currentColor" />
            <path d="M0 14.4375H1.3125V13.125H0V14.4375Z" fill="currentColor" />
            <path d="M0 11.8125H1.3125V10.5H0V11.8125Z" fill="currentColor" />
            <path d="M0 9.1875H1.3125V7.875H0V9.1875Z" fill="currentColor" />
            <path d="M2.625 1.3125H3.9375V0H2.625V1.3125Z" fill="currentColor" />
            <path d="M17.0625 1.3125H18.375V0H17.0625V1.3125Z" fill="currentColor" />
            <path d="M19.6875 9.1875H21V7.875H19.6875V9.1875Z" fill="currentColor" />
            <path d="M19.6875 6.5625H21V5.25H19.6875V6.5625Z" fill="currentColor" />
            <path d="M19.6875 3.9375H21V2.625H19.6875V3.9375Z" fill="currentColor" />
            <path d="M19.6875 14.4375H21V13.125H19.6875V14.4375Z" fill="currentColor" />
            <path d="m17.062 14.438h1.3125v-1.3125h-1.3125v1.3125z" fill="currentColor" />
            <path d="M19.6875 11.8125H21V10.5H19.6875V11.8125Z" fill="currentColor" />
            <path d="M19.6875 0V1.3125H21V0H19.6875Z" fill="currentColor" />
            <path d="M15.75 0H5.25V14.4375H15.75V0Z" fill="currentColor" />
        </svg>
    )
}
