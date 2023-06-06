import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { useCopyToClipboard } from 'react-use'
import { PlatformAvatar } from './PlatformAvatar.js'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { type PropsWithChildren, useCallback, useState } from 'react'
import { formatPublicKey } from '../../../utils/index.js'
import { useSharedI18N } from '../../../locales/index.js'

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
    const t = useSharedI18N()

    const [open, setOpen] = useState(false)

    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            copyToClipboard(currentPersona?.identifier.rawPublicKey ?? '')
            setOpen(true)
            // Close tooltip after five seconds of copying
            setTimeout(() => {
                setOpen(false)
            }, 5000)
        },
        [currentPersona?.identifier.rawPublicKey, copyToClipboard],
    )

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
                            {currentPersona?.identifier
                                ? formatPublicKey(currentPersona.identifier.rawPublicKey)
                                : '--'}
                        </Typography>
                        <ShadowRootTooltip
                            title={t.copied()}
                            open={open}
                            placement="top"
                            onMouseLeave={() => setOpen(false)}
                            disableFocusListener
                            disableTouchListener>
                            <Icons.Copy size={16} onClick={onCopy} className={classes.linkIcon} />
                        </ShadowRootTooltip>
                    </Box>
                </div>
            </Box>
            {children}
        </div>
    )
}
