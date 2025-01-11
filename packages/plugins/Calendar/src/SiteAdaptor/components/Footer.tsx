import { Icons } from '@masknet/icons'
import { ApplicationSettingTabs, useOpenApplicationSettings } from '@masknet/shared'
import { PluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { IconButton, Typography } from '@mui/material'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        backdropFilter: 'blur(10px)',
        borderRadius: '0 0 12px 12px',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
    },
    lineWrap: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        width: '100%',
    },
    poweredByWrap: {
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
    },
    poweredBy: {
        display: 'flex',
        color: theme.palette.maskColor.second,
        fontSize: '14px',
        fontWeight: 700,
        gap: theme.spacing(0.5),
        lineHeight: '18px',
        alignItems: 'center',
        whiteSpace: 'nowrap',
    },
    calender: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    calendarText: {
        color: theme.palette.maskColor.main,
        fontSize: '16px',
        fontWeight: 700,
        lineHeight: '20px',
        alignItems: 'center',
    },
}))

export interface FooterProps {
    tab: 'news' | 'events'
}

export function Footer({ tab }: FooterProps) {
    const { classes } = useStyles()
    const providerMap = {
        news: <Icons.CoinCarp size={24} />,
        events: <Icons.Luma size={24} />,
    } as const
    const openApplicationBoardDialog = useOpenApplicationSettings()
    return (
        <div className={classes.container}>
            <div className={classes.lineWrap}>
                <div className={classes.calender}>
                    <Icons.Calendar size={24} />
                    <Typography className={classes.calendarText}>
                        <Trans>Calendar</Trans>
                    </Typography>
                </div>
                <div className={classes.poweredByWrap}>
                    <Typography className={classes.poweredBy} component="div">
                        <Trans>Powered By {providerMap[tab]}</Trans>
                    </Typography>
                    <IconButton
                        sx={{ width: '16px', height: '16px' }}
                        onClick={() =>
                            openApplicationBoardDialog(ApplicationSettingTabs.pluginSwitch, PluginID.Calendar)
                        }>
                        <Icons.Gear size={16} />
                    </IconButton>
                </div>
            </div>
        </div>
    )
}
