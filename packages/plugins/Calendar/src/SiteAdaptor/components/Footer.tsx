/* cspell: disable */
import React, { type ReactNode } from 'react'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Typography, IconButton } from '@mui/material'
import { useI18N } from '../../locales/i18n_generated.js'
import { useOpenApplicationSettings } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.80)',
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
        padding: '16px',
        width: '100%',
    },
    poweredByWrap: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    poweredBy: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        alignItems: 'center',
    },
    calender: {
        display: 'flex',
        gap: '8px',
        color: theme.palette.maskColor.main,
        fontSize: '16px',
        fontWeight: 700,
        lineHeight: '20px',
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
                <Typography className={classes.calender}>CoinCarp</Typography>
                <Icons.Coincarp size={24} />
            </>
        ),
        event: (
            <>
                <Typography className={classes.calender}>LINK3</Typography>
                <Icons.Link3 size={24} />
            </>
        ),
        nfts: (
            <>
                <Typography className={classes.calender}>NFTGO</Typography>
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
                    <Typography>{t.title()}</Typography>
                </div>
                <div className={classes.poweredByWrap}>
                    <Typography className={classes.poweredBy}>{t.powered_by()}</Typography>
                    {providerMap[provider]}
                    <IconButton size="small" onClick={() => openApplicationBoardDialog()}>
                        <Icons.Gear size={24} />
                    </IconButton>
                </div>
            </div>
        </div>
    )
}
