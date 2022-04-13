import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DialogContent, Typography } from '@mui/material'
import type { Market } from '../types'
import DOMPurify from 'isomorphic-dompurify'
import { InjectedDialog } from '@masknet/shared'

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
            <path
                d="M0 4h1.3V2.5H0V4ZM0 1.3h1.3V0H0v1.3ZM2.6 14.4H4v-1.3H2.6v1.3ZM0 6.6h1.3V5.3H0v1.3ZM0 14.4h1.3v-1.3H0v1.3ZM0 11.8h1.3v-1.3H0v1.3ZM0 9.2h1.3V7.9H0v1.3ZM2.6 1.3H4V0H2.6v1.3ZM17 1.3h1.4V0H17v1.3ZM19.7 9.2H21V7.9h-1.3v1.3ZM19.7 6.6H21V5.3h-1.3v1.3ZM19.7 4H21V2.5h-1.3V4ZM19.7 14.4H21v-1.3h-1.3v1.3ZM17 14.4h1.4v-1.3H17v1.3zM19.7 11.8H21v-1.3h-1.3v1.3ZM19.7 0v1.3H21V0h-1.3ZM15.8 0H5.2v14.4h10.6V0Z"
                fill="currentColor"
            />
        </svg>
    )
}
