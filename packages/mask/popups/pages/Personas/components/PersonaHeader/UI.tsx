import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Avatar, Box, Link, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { formatPersonaFingerprint, formatPersonaName } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        background: theme.palette.maskColor.modalTitleBg,
        padding: '11px 16px',
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: 96,
        height: 30,
    },
    action: {
        background: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 4px 6px 0px rgba(0, 0, 0, 0.10)'
            :   '0px 4px 6px 0px rgba(102, 108, 135, 0.10)',
        borderRadius: 99,
        padding: '5px 8px 5px 4px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    avatar: {
        marginRight: 4,
        width: 30,
        height: 30,
    },
    nickname: {
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        fontWeight: 700,
    },
    identifier: {
        fontSize: 10,
        color: theme.palette.maskColor.second,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        width: 12,
        height: 12,
        color: theme.palette.maskColor.main,
        cursor: 'pointer',
        marginLeft: 4,
    },
}))

interface PersonaHeaderUIProps {
    avatar?: string | null
    fingerprint: string
    nickname?: string
    publicHexString: string
}

export const PersonaHeaderUI = memo<PersonaHeaderUIProps>(({ avatar, fingerprint, nickname, publicHexString }) => {
    const { classes } = useStyles()
    return (
        <Box className={classes.container}>
            <Icons.Mask className={classes.logo} />
            <div className={classes.action}>
                {avatar ?
                    <Avatar src={avatar} className={classes.avatar} />
                :   <Icons.Masks className={classes.avatar} />}
                <div>
                    <Typography className={classes.nickname}>{formatPersonaName(nickname)}</Typography>
                    <Typography className={classes.identifier}>
                        {formatPersonaFingerprint(fingerprint ?? '', 4)}
                        <Link
                            underline="none"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://web3.bio/${publicHexString}`}
                            className={classes.icon}>
                            <Icons.LinkOut size={12} />
                        </Link>
                    </Typography>
                </div>
            </div>
        </Box>
    )
})
