import { useStylesExtends, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { useAsyncRetry, useCopyToClipboard } from 'react-use'
import { useI18N } from '../../locales'
import { PlatformAvatar } from './PlatformAvatar'
import { formatPublicKey } from '../utils'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { context } from '../context'
import { CopyIcon } from '@masknet/icons'
import { useCallback, useState } from 'react'

const useStyles = makeStyles()((theme) => ({
    bottomFixed: {
        width: '100%',
        height: '38px',
        display: 'flex',
        padding: 16,
    },
    link: {
        color: theme.palette.text.primary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        marginLeft: '4px',
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

interface PersonaActionProps {
    currentPersona?: PersonaInformation
    currentVisitingProfile?: IdentityResolved
}

export function PersonaAction(props: PersonaActionProps) {
    const classes = useStylesExtends(useStyles(), {})
    const { currentPersona, currentVisitingProfile } = props
    const t = useI18N()

    const [open, setOpen] = useState(false)

    const { value: avatar } = useAsyncRetry(async () => {
        const avatar = await context.getPersonaAvatar(currentPersona?.identifier)
        if (!avatar) return undefined
        return avatar
    })
    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            copyToClipboard(currentPersona?.identifier?.rawPublicKey ?? '')
            setOpen(true)
            // Close tooltip after five seconds of copying
            setTimeout(() => {
                setOpen(false)
            }, 5000)
        },
        [currentPersona?.identifier?.rawPublicKey, copyToClipboard],
    )

    return (
        <div className={classes.bottomFixed}>
            <PlatformAvatar networkIcon={avatar} size={36} />
            <div style={{ marginLeft: '4px' }}>
                <Typography style={{ fontSize: '14px', fontWeight: '700', display: 'flex' }}>
                    {currentPersona?.nickname}
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    <Typography className={classes.personaKey}>
                        {currentPersona?.identifier ? formatPublicKey(currentPersona?.identifier?.rawPublicKey) : '--'}
                    </Typography>
                    <ShadowRootTooltip
                        title={t.copied()}
                        open={open}
                        placement="top"
                        onMouseLeave={() => setOpen(false)}
                        disableFocusListener
                        disableTouchListener>
                        <CopyIcon onClick={onCopy} className={classes.linkIcon} />
                    </ShadowRootTooltip>
                </Box>
            </div>
        </div>
    )
}
