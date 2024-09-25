import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, Switch } from '@mui/material'
import { useStyles } from './useStyles.js'
import { hidingScamSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { Trans } from '@lingui/macro'

export function HidingScamTx() {
    const { classes } = useStyles()
    const hiding = useValueRef(hidingScamSettings)

    return (
        <ListItem className={classes.item}>
            <Box className={classes.itemBox}>
                <Icons.DangerOutline size={20} />
                <Typography className={classes.itemText}>
                    <Trans>Hiding Scam Transactions</Trans>
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
