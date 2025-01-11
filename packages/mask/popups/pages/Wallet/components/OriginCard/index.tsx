import { memo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons, type GeneratedIcon } from '@masknet/icons'
import DisconnectModal from '../DisconnectModal/index.js'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { t } from '@lingui/core/macro'

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
        color: theme.palette.maskColor.main,
    },
}))

interface OriginCardProps {
    origin: string
}

const domainIconMap: Record<string, GeneratedIcon> = {
    'x.com': Icons.TwitterXRound,
    'facebook.com': Icons.FacebookRound,
    'minds.com': Icons.MindsRound,
    'instagram.com': Icons.InstagramRoundColored,
    'opensea.io': Icons.OpenSeaColored,
    'mirror.xyz': Icons.Mirror,
}

const domainNameMap: Record<string, string> = {
    'x.com': 'X',
    'facebook.com': 'Facebook',
    'minds.com': 'Minds',
    'instagram.com': 'Instagram',
    'opensea.io': 'OpenSea',
    'mirror.xyz': 'Mirror',
}

const OriginCard = memo(function OriginCard({ origin }: OriginCardProps) {
    const { classes } = useStyles()
    const [open, setOpen] = useState(false)
    const url = URL.canParse(origin) ? new URL(origin) : null
    const domain = url?.host.split('.').slice(-2).join('.')

    const Icon = SOCIAL_MEDIA_ROUND_ICON_MAPPING[origin] || domainIconMap[domain || ''] || Icons.MaskPlaceholder
    const siteName =
        url?.protocol === 'extension:' ? t`Chrome - external extension` : domainNameMap[domain || ''] || t`Website`
    return (
        <Box className={classes.container}>
            <Icon size={24} />
            <Box className={classes.site}>
                <Typography className={classes.siteName}>{siteName}</Typography>
                <Typography className={classes.siteUrl}>{url?.host || origin}</Typography>
            </Box>
            <button className={classes.button} onClick={() => setOpen(true)} type="button">
                <Icons.Disconnect />
            </button>
            {open ?
                <DisconnectModal origin={origin} onClose={() => setOpen(false)} />
            :   null}
        </Box>
    )
})

export default OriginCard
