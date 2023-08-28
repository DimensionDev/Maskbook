import { useMemo } from 'react'
import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import millisecondsToMinutes from 'date-fns/millisecondsToMinutes'
import millisecondsToHours from 'date-fns/millisecondsToHours'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { WalletAutoLockSettingModal } from '../../../modals/modals.js'
import { useWalletAutoLockTime } from '../hooks/useWalletAutoLockTime.js'

export function AutoLock() {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()

    const { value } = useWalletAutoLockTime()

    const minutes = useMemo(() => (value ? millisecondsToMinutes(value) : undefined), [value])
    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                WalletAutoLockSettingModal.open({
                    title: t('popups_wallet_settings_auto_unlock_time_title'),
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.Time size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('popups_wallet_settings_auto_unlock_time')}</Typography>
            </Box>
            <Box className={classes.itemBox}>
                {value ? (
                    <Typography className={classes.itemText}>
                        {minutes && minutes >= 60
                            ? t('popups_wallet_settings_auto-unlock_time_hour', { count: millisecondsToHours(value) })
                            : t('popups_wallet_settings_auto_unlock_time_mins', { time: millisecondsToMinutes(value) })}
                    </Typography>
                ) : null}
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
