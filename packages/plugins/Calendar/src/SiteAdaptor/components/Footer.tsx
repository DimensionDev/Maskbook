import { Icons } from '@masknet/icons'
import { ApplicationSettingTabs, useOpenApplicationSettings } from '@masknet/shared'
import { PluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { IconButton, Typography } from '@mui/material'
import { type ReactNode } from 'react'
import { Trans } from '@lingui/macro'

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
    providerName: {
        color: theme.palette.maskColor.main,
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '18px',
        alignItems: 'center',
    },
}))

export interface FooterProps {
    provider: string
    disableSetting?: boolean
}

export function Footer({ provider, disableSetting }: FooterProps) {
    const { classes } = useStyles()
    const providerMap: Record<string, ReactNode> = {
        news: (
            <>
                <Typography className={classes.providerName}>CoinCarp</Typography>
                <Icons.CoinCarp size={24} />
            </>
        ),
        event: (
            <>
                <Typography className={classes.providerName}>LINK3</Typography>
                <Icons.Link3 size={24} />
            </>
        ),
        nfts: (
            <>
                <Typography className={classes.providerName}>NFTGO</Typography>
                <Icons.NFTGo size={24} />
            </>
        ),
    }
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
                    <Typography className={classes.poweredBy}>
                        <Trans>Powered By {providerMap[provider]}</Trans>
                    </Typography>
                    {disableSetting ? null : (
                        <IconButton
                            sx={{ width: '16px', height: '16px' }}
                            onClick={() =>
                                openApplicationBoardDialog(ApplicationSettingTabs.pluginSwitch, PluginID.Calendar)
                            }>
                            <Icons.Gear size={16} />
                        </IconButton>
                    )}
                </div>
            </div>
        </div>
    )
}
