import { useStylesExtends, makeStyles } from '@masknet/theme'
import { Box, Link, Typography } from '@mui/material'
import { Copy } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../locales'
import { PlatformAvatar } from './PlatformAvatar'
import { useSnackbarCallback } from '@masknet/shared'
import { formatPublicKey } from '../utils'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => ({
    bottomFixed: {
        width: '100%',
        display: 'flex',
        boxShadow: '0px 0px 16px rgba(101, 119, 134, 0.2)',
        padding: '19px 16px',
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
        color: '#6E767D',
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
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            copyToClipboard(currentPersona?.identifier?.rawPublicKey ?? '')
        },
        [],
        undefined,
        undefined,
        undefined,
        'success',
    )

    return (
        <div className={classes.bottomFixed}>
            <PlatformAvatar networkIcon={currentVisitingProfile?.avatar} size={36} />
            <div style={{ marginLeft: '4px' }}>
                <Typography style={{ fontSize: '14px', fontWeight: '700', display: 'flex' }}>
                    {currentPersona?.nickname}
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    <Typography style={{ fontSize: '12px', fontWeight: '400', color: '#ACB4C1' }}>
                        {formatPublicKey(currentPersona?.identifier?.rawPublicKey)}
                    </Typography>
                    <Link
                        className={classes.link}
                        underline="none"
                        component="button"
                        title={t.persona_public_key_copy()}
                        onClick={onCopy}>
                        <Copy className={classes.linkIcon} size={14} />
                    </Link>
                </Box>
            </div>
        </div>
    )
}
