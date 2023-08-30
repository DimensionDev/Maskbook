import { memo, useState, type ReactNode } from 'react'
import { useI18N } from '../../../../../../utils/i18n-next-ui.js'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import DisconnectModal from '../DisconnectModal/index.js'

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

interface SiteCardProps {
    site: string
}

const siteMap: Record<string, { icon: ReactNode; name: string }> = {
    'twitter.com': {
        icon: <Icons.TwitterX />,
        name: 'Twitter',
    },
    'facebook.com': {
        icon: <Icons.Facebook />,
        name: 'Facebook',
    },
    'minds.com': {
        icon: <Icons.Minds />,
        name: 'Minds',
    },
    'instagram.com': {
        icon: <Icons.Instagram />,
        name: 'Instagram',
    },
}

const SiteCard = memo(function SiteCard({ site }: SiteCardProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [open, setOpen] = useState(false)
    return (
        <Box className={classes.container}>
            {siteMap[site].icon}
            <Box className={classes.site}>
                <Typography className={classes.siteName}>{siteMap[site].name}</Typography>
                <Typography className={classes.siteUrl}>{site}</Typography>
            </Box>
            <button className={classes.button} onClick={() => setOpen(true)} type="button">
                <Icons.Disconnect />
            </button>
            {open ? (
                <DisconnectModal
                    site={site}
                    setOpen={(open: boolean) => {
                        setOpen(open)
                    }}
                />
            ) : null}
        </Box>
    )
})

export default SiteCard
