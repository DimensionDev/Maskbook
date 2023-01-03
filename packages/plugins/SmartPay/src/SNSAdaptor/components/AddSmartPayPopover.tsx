import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { memo } from 'react'
import { Box, Button, Popover, Typography } from '@mui/material'
import { useI18N } from '../../locales/i18n_generated.js'
import { Icon } from '@masknet/shared'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { useAsync } from 'react-use'
import { SmartPayFunder } from '@masknet/web3-providers'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(3),
        background: theme.palette.maskColor.bottom,
        maxWidth: 320,
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
        textAlign: 'center',
    },
    info: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(1.5),
        columnGap: theme.spacing(1.5),
    },
    name: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
    identifier: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
    tips: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5),
    },
}))

export interface AddSmartPayPopoverProps {
    open: boolean
    anchorEl: HTMLElement | null
    onClose: () => void
}

export const AddSmartPayPopover = memo<AddSmartPayPopoverProps>(({ open, anchorEl, onClose }) => {
    const t = useI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const currentProfile = useLastRecognizedIdentity()
    const { value = 0 } = useAsync(async () => {
        if (!currentProfile?.identifier?.userId) return 0
        return SmartPayFunder.getRemainFrequency(currentProfile.identifier.userId)
    }, [currentProfile])
    return usePortalShadowRoot((container) => (
        <Popover
            container={container}
            open={open}
            onClose={onClose}
            anchorEl={anchorEl}
            disableRestoreFocus
            classes={{ paper: classes.paper }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}>
            <Typography className={classes.title}>{t.add_smart_pay_wallet()}</Typography>
            <Box className={classes.info}>
                <Icon logoURL={currentProfile?.avatar} name={currentProfile?.nickname} size={30} />
                <Box>
                    <Typography className={classes.name}>{currentProfile?.nickname}</Typography>
                    <Typography className={classes.identifier}>@{currentProfile?.identifier?.userId}</Typography>
                </Box>
            </Box>
            <Typography className={classes.tips}>{t.remain_times_tips({ count: value })}</Typography>
            <Button
                fullWidth
                variant="roundedContained"
                onClick={() => {
                    navigate(RoutePaths.Deploy)
                }}>
                {t.create()}
            </Button>
        </Popover>
    ))
})
