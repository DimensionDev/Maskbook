import { Avatar, Box, Typography } from '@mui/material'
import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { ArrowDropIcon, MaskNotSquareIcon, MasksIcon } from '@masknet/icons'
import { useMatch, useNavigate } from 'react-router-dom'
import { formatPersonaFingerprint, PopupRoutes } from '@masknet/shared-base'
import { CopyIconButton } from '../CopyIconButton'

const useStyles = makeStyles()(() => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        padding: 16,
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: 104,
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
        fontSize: 14,
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
        fontSize: 12,
        fill: '#767F8D',
        cursor: 'pointer',
        marginLeft: 4,
    },
    arrow: {
        fontSize: 20,
        transition: 'all 300ms',
    },
}))

export interface PersonaHeaderUIProps {
    avatar?: string | null
    currentIdentifier: string
    nickname?: string
}

export const PersonaHeader = memo<PersonaHeaderUIProps>(({ avatar, currentIdentifier, nickname }) => {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const matchSelectPersona = useMatch(PopupRoutes.SelectPersona)

    return (
        <Box className={classes.container}>
            <MaskNotSquareIcon className={classes.logo} />
            <div
                className={classes.action}
                onClick={() => navigate(matchSelectPersona ? PopupRoutes.Personas : PopupRoutes.SelectPersona)}>
                {avatar ? <Avatar src={avatar} className={classes.avatar} /> : <MasksIcon className={classes.avatar} />}
                <div>
                    <Typography className={classes.nickname}>{nickname}</Typography>
                    <Typography className={classes.identifier}>
                        {formatPersonaFingerprint(currentIdentifier ?? '', 4)}
                        <CopyIconButton text={currentIdentifier} className={classes.icon} />
                    </Typography>
                </div>
                <ArrowDropIcon
                    className={classes.arrow}
                    style={{ transform: matchSelectPersona ? 'rotate(-180deg)' : undefined }}
                />
            </div>
        </Box>
    )
})
