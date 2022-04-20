import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Avatar, Box, Typography } from '@mui/material'
import { CopyIconButton } from '../../../../components/CopyIconButton'
import { ArrowDropIcon, MaskNotSquareIcon, MasksIcon } from '@masknet/icons'
import { formatPersonaFingerprint, formatPersonaName } from '@masknet/shared-base'

const useStyles = makeStyles()(() => ({
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

interface PersonaHeaderUIProps {
    avatar?: string | null
    onActionClick: () => void
    fingerprint: string
    nickname?: string
    isSelectPersonaPage: boolean
}

export const PersonaHeaderUI = memo<PersonaHeaderUIProps>(
    ({ avatar, onActionClick, fingerprint, nickname, isSelectPersonaPage }) => {
        const { classes } = useStyles()
        return (
            <Box className={classes.container}>
                <MaskNotSquareIcon className={classes.logo} />
                <div className={classes.action} onClick={onActionClick}>
                    {avatar ? (
                        <Avatar src={avatar} className={classes.avatar} />
                    ) : (
                        <MasksIcon className={classes.avatar} />
                    )}
                    <div>
                        <Typography className={classes.nickname}>{formatPersonaName(nickname)}</Typography>
                        <Typography className={classes.identifier}>
                            {formatPersonaFingerprint(fingerprint ?? '', 4)}
                            <CopyIconButton text={fingerprint} className={classes.icon} />
                        </Typography>
                    </div>
                    <ArrowDropIcon
                        className={classes.arrow}
                        style={{ transform: isSelectPersonaPage ? 'rotate(-180deg)' : undefined }}
                    />
                </div>
            </Box>
        )
    },
)
