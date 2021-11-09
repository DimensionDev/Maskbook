import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DialogContent, Typography } from '@mui/material'
import type { Market } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(2, 0),
    },
    message: {
        textAlign: 'center',
    },
}))

interface GiveawayPopupProps {
    open: boolean
    onClose: () => void
    market: Market
}

export function GiveawayPopup(props: GiveawayPopupProps) {
    const { open, onClose, market } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    if (!market.giveawayText) {
        return null
    }
    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onClose}
            title={t('plugin_realitycards_event_giveaway_title')}
            maxWidth="xs">
            <DialogContent>
                <Typography className={classes.message} color="textPrimary">
                    {market.giveawayText}
                </Typography>
            </DialogContent>
        </InjectedDialog>
    )
}
