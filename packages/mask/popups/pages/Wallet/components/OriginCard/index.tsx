import { memo, useState, useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import DisconnectModal from '../DisconnectModal/index.js'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { SOCIAL_MEDIA_NAME } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        padding: '8px',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '8px',
        border: '1px solid ' + theme.palette.maskColor.line,
    },
    site: {
        display: 'flex',
        flexDirection: 'column',
        width: '296px',
    },
    siteName: {
        color: theme.palette.maskColor.main,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
    },
    siteUrl: {
        color: theme.palette.maskColor.main,
        fontSize: 12,
        fontWeight: 400,
        lineHeight: '16px',
    },
    button: {
        outline: 'none',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
}))

interface OriginCardProps {
    origin: string
}

const OriginCard = memo(function OriginCard({ origin }: OriginCardProps) {
    const { classes } = useStyles()
    const [open, setOpen] = useState(false)
    const Icon = useMemo(() => SOCIAL_MEDIA_ROUND_ICON_MAPPING[origin], [origin])
    return (
        <Box className={classes.container}>
            {Icon ? <Icon size={24} /> : null}
            <Box className={classes.site}>
                <Typography className={classes.siteName}>{SOCIAL_MEDIA_NAME[origin]}</Typography>
                <Typography className={classes.siteUrl}>{origin}</Typography>
            </Box>
            <button className={classes.button} onClick={() => setOpen(true)} type="button">
                <Icons.Disconnect />
            </button>
            {open ? (
                <DisconnectModal
                    origin={origin}
                    setOpen={(open: boolean) => {
                        setOpen(open)
                    }}
                />
            ) : null}
        </Box>
    )
})

export default OriginCard
