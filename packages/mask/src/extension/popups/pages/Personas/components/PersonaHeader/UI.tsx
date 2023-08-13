// ! This file is used during SSR. DO NOT import new files that does not work in SSR
import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Avatar, Box, Link, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { formatPersonaFingerprint, formatPersonaName } from '@masknet/shared-base'
import urlcat from 'urlcat'
// import { CopyIconButton } from '../../../../components/CopyIconButton/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
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
        background: 'rgba(255, 255, 255, 0.8)',
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
        color: '#07101B',
        lineHeight: '18px',
        fontWeight: 700,
    },
    identifier: {
        fontSize: 10,
        color: '#767F8D',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        width: 12,
        height: 12,
        color: '#767F8D',
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
                {avatar ? (
                    <Avatar src={avatar} className={classes.avatar} />
                ) : (
                    <Icons.Masks className={classes.avatar} />
                )}
                <div>
                    <Typography className={classes.nickname}>{formatPersonaName(nickname)}</Typography>
                    <Typography className={classes.identifier}>
                        {formatPersonaFingerprint(fingerprint ?? '', 4)}
                        <Link
                            underline="none"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={urlcat('https://web3.bio/:address', { address: publicHexString })}
                            className={classes.icon}>
                            <Icons.LinkOut size={12} />
                        </Link>
                    </Typography>
                </div>
            </div>
        </Box>
    )
})
