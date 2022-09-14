import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'relative',
        width: '100%',
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(249, 55, 55, 0.2) 100%), #FFFFFF;',
        borderRadius: '16px',
        padding: '16px',
        boxSizing: 'border-box',
        minHeight: 200,
    },
    topBox: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconBox: {
        display: 'flex',
        gap: 4,
        color: 'rgba(7, 16, 27, 1)',
    },
    provided: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.text.secondary,
        gap: 4,
        fontSize: 14,
    },
    badge: {
        cursor: 'pointer',
        fontSize: 14,
        color: 'rgba(7, 16, 27, 1)',
        fontWeight: 500,
    },
    linkIcon: {
        cursor: 'pointer',
        width: 16,
        textDecoration: 'none',
    },
    emptyImg: {
        margin: '16px 0',
        width: '100%',
    },
    actionBtn: {
        width: 254,
        cursor: 'pointer',
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        minWidth: 200,
        background: 'rgba(7, 16, 27, 1)',
        borderRadius: '99px',
        padding: '11px 0',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        justifyContent: 'center',
        maxHeight: 40,
        boxSizing: 'border-box',
    },
}))
interface EmptyStatusProps {
    toAdd: () => void
}
export const EmptyStatus = memo(({ toAdd }: EmptyStatusProps) => {
    const t = useI18N()
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            <div className={classes.topBox}>
                <div className={classes.iconBox}>
                    <Icons.TipCoin size={20} />
                    <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Tips</Typography>
                </div>
                <div className={classes.provided}>
                    <Typography sx={{ fontSize: 14 }}>Provided by</Typography>
                    <Typography className={classes.badge}>Mask Network</Typography>
                    <a href="https://mask.io" className={classes.linkIcon} target="_blank">
                        <Icons.LinkOut size={16} />
                    </a>
                </div>
            </div>
            <img
                className={classes.emptyImg}
                src={new URL('../../assets/emptyUnion.png', import.meta.url).toString()}
                alt=""
            />
            <div className={classes.actionBtn} onClick={toAdd}>
                <Icons.ConnectWallet size={18} />
                <Typography sx={{ fontSize: 14, lineHeight: 18, fontWeight: 700 }}>
                    {t.tip_connect_your_wallet()}
                </Typography>
            </div>
        </div>
    )
})
