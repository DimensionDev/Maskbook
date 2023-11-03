import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, useTheme, Switch } from '@mui/material'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { useStyles } from './useStyles.js'
import { hidingScamSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'

export function HidingScamTx() {
    const t = useMaskSharedTrans()
    const theme = useTheme()
    const { classes } = useStyles()
    const hiding = useValueRef(hidingScamSettings)

    return (
        <ListItem className={classes.item}>
            <Box className={classes.itemBox}>
                <Icons.DangerOutline size={20} />
                <Typography className={classes.itemText}>
                    {t.popups_wallet_settings_hiding_scam_transactions()}
                </Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Switch
                    checked={hiding}
                    onChange={(e) => {
                        hidingScamSettings.value = e.target.checked
                    }}
                />
            </Box>
        </ListItem>
    )
}
