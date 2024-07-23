import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useCalendarTrans } from '../../locales/i18n_generated.js'

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

export function Footer() {
    const { classes } = useStyles()
    const t = useCalendarTrans()
    return (
        <div className={classes.container}>
            <div className={classes.lineWrap}>
                <div className={classes.calender}>
                    <Icons.Calendar size={24} />
                    <Typography className={classes.calendarText}>{t.title()}</Typography>
                </div>
            </div>
        </div>
    )
}
