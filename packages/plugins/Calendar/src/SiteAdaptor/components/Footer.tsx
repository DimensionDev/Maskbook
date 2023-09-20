/* cspell: disable */
import React, { type ReactNode } from 'react'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Typography, IconButton } from '@mui/material'
import { useI18N } from '../../locales/i18n_generated.js'
import { useOpenApplicationSettings, ApplicationSettingTabs } from '@masknet/shared'
import { PluginID } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.80)' : 'rgba(255, 255, 255, 0.80)',
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

interface FooterProps {
    provider: string
}

export function Footer({ provider }: FooterProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const providerMap: Record<string, ReactNode> = {
        news: (
            <>
                <Typography className={classes.providerName}>CoinCarp</Typography>
                <Icons.Coincarp size={24} />
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
                <Icons.Nftgo size={24} />
            </>
        ),
    }
    const openApplicationBoardDialog = useOpenApplicationSettings()
    return (
        <div className={classes.container}>
            <div className={classes.lineWrap}>
                <div className={classes.calender}>
                    <Icons.Calendar size={24} />
                    <Typography className={classes.calendarText}>{t.title()}</Typography>
                </div>
                <div className={classes.poweredByWrap}>
                    <Typography className={classes.poweredBy}>{t.powered_by()}</Typography>
                    {providerMap[provider]}
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
