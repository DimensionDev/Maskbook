import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { useAccount } from '@masknet/plugin-infra/web3'

import { useI18N } from '../locales'
import { SettingActions } from './components/SettingActions'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: 16,
        minHeight: 424,
        display: 'flex',
        flexDirection: 'column',
    },
    alert: {
        padding: theme.spacing(1.5),
        background: theme.palette.maskColor.bg,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 4,
        columnGap: 6,
    },
    alertTitle: {
        fontSize: 14,
        lineHeight: '18px',
    },
    placeholder: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        rowGap: 12,
    },
    placeholderText: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
    },
    placeholderIcon: {
        color: theme.palette.maskColor.third,
    },
}))
interface TipsSettingProps {
    onClose: () => void
}

export const TipsSetting = memo<TipsSettingProps>(({ onClose }) => {
    const { classes } = useStyles()
    const t = useI18N()
    const account = useAccount()

    return (
        <>
            <div className={classes.content}>
                <div className={classes.alert}>
                    <Icons.Info />
                    <Typography className={classes.alertTitle}>{t.setting_alert_title()}</Typography>
                </div>
                <div className={classes.placeholder}>
                    <Icons.Direct size={36} className={classes.placeholderIcon} />
                    <Typography className={classes.placeholderText}>{t.add_wallet_tips()}</Typography>
                </div>
            </div>
            <SettingActions />
        </>
    )
})
