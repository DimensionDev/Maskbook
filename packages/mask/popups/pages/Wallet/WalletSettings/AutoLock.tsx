import { useMemo } from 'react'
import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { millisecondsToMinutes, millisecondsToHours } from 'date-fns'
import { useStyles } from './useStyles.js'
import { WalletAutoLockSettingModal } from '../../../modals/modal-controls.js'
import { useWalletAutoLockTime } from '../hooks/useWalletAutoLockTime.js'
import { Plural, Trans } from '@lingui/react/macro'

export function AutoLock() {
    const { classes, theme } = useStyles()

    const { value } = useWalletAutoLockTime()

    const minutes = useMemo(() => (value ? millisecondsToMinutes(value) : undefined), [value])
    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                WalletAutoLockSettingModal.open({
                    title: <Trans>Auto-lock</Trans>,
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.Time size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>
                    <Trans>Auto-lock Time</Trans>
                </Typography>
            </Box>
            <Box className={classes.itemBox}>
                {value ?
                    <Typography className={classes.itemText}>
                        {minutes && minutes >= 60 ?
                            <Plural value={millisecondsToHours(value)} one="# Hour" other="# Hours" />
                        :   <Trans>{millisecondsToMinutes(value)} Mins</Trans>}
                    </Typography>
                :   null}
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
