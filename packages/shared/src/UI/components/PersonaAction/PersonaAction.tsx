import type { IdentityResolved } from '@masknet/plugin-infra'
import type { PersonaInformation } from '@masknet/shared-base'
import { formatPersonaFingerprint } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { type PropsWithChildren } from 'react'
import { CopyButton } from '../CopyButton/index.js'
import { PlatformAvatar } from './PlatformAvatar.js'

const useStyles = makeStyles()((theme) => ({
    bottomFixed: {
        width: '100%',
        minHeight: 36,
        display: 'flex',
        justifyContent: 'space-between',
        padding: 16,
        boxShadow: theme.palette.shadow.popup,
    },
    linkIcon: {
        marginRight: theme.spacing(1),
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
    },
    personaKey: {
        fontSize: '12px',
        fontWeight: '400',
        color: theme.palette.maskColor.third,
    },
}))

interface PersonaActionProps extends PropsWithChildren {
    currentPersona?: PersonaInformation
    currentVisitingProfile?: IdentityResolved
    avatar?: string
    classes?: {
        bottomFixed: string
    }
}

export function PersonaAction(props: PersonaActionProps) {
    const { classes } = useStyles(undefined, { props })
    const { currentPersona, avatar, children } = props

    return (
        <div className={classes.bottomFixed}>
            <Box display="flex">
                <PlatformAvatar networkIcon={avatar} size={36} />
                <div style={{ marginLeft: '4px' }}>
                    <Typography style={{ fontSize: '14px', fontWeight: '700', display: 'flex' }}>
                        {currentPersona?.nickname}
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                        <Typography className={classes.personaKey}>
                            {currentPersona?.identifier ?
                                formatPersonaFingerprint(currentPersona.identifier.rawPublicKey, 4)
                            :   '--'}
                        </Typography>
                        <CopyButton
                            size={16}
                            text={currentPersona?.identifier.rawPublicKey ?? ''}
                            className={classes.linkIcon}
                        />
                    </Box>
                </div>
            </Box>
            {children}
        </div>
    )
}
