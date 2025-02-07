import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { disablePermitSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { Box, ListItem, Switch, Typography } from '@mui/material'
import { ConfirmModal } from '../../../modals/modal-controls.js'
import { useStyles as useSharedStyles } from './useStyles.js'

const useStyles = makeStyles()((theme) => ({
    texts: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    text: {
        color: theme.palette.maskColor.third,
        lineHeight: '18px',
        fontSize: 14,
        fontWeight: 700,
    },
}))

export function DisablePermit() {
    const { classes: sharedClasses } = useSharedStyles()
    const { classes, theme } = useStyles()
    const disabled = useValueRef(disablePermitSettings)

    return (
        <ListItem className={sharedClasses.item}>
            <Box className={sharedClasses.itemBox}>
                <Icons.DangerOutline size={20} />
                <Typography className={sharedClasses.itemText}>
                    <Trans>Disable Permit</Trans>
                </Typography>
                <Icons.Questions
                    color={theme.palette.maskColor.second}
                    size={20}
                    onClick={() => {
                        ConfirmModal.openAndWaitForClose({
                            title: <Trans>About Permit</Trans>,
                            buttonLabel: <Trans>Okay</Trans>,
                            message: (
                                <Typography component="div" className={classes.texts}>
                                    <Trans>
                                        <Typography className={classes.text}>
                                            Permit allows users to authorize an address to access their ERC-20 tokens
                                            without requiring a separate approval transaction, providing a more
                                            efficient way to manage token permissions.
                                        </Typography>

                                        <Typography className={classes.text}>
                                            However, if the authorized limit is exceeded or the Permit expires, the
                                            authorization automatically becomes invalid. Despite this, security risks
                                            remain.
                                        </Typography>

                                        <Typography className={classes.text}>
                                            To prevent potential misuse, you can disable the Permit feature.
                                        </Typography>
                                    </Trans>
                                </Typography>
                            ),
                        })
                    }}
                />
            </Box>
            <Box className={sharedClasses.itemBox}>
                <Switch
                    checked={disabled}
                    onChange={(e) => {
                        disablePermitSettings.value = e.target.checked
                    }}
                />
            </Box>
        </ListItem>
    )
}
