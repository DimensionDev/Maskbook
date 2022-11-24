import { useMemo } from 'react'
import { Avatar, Box, Stack, Typography } from '@mui/material'
import {
    BindingProof,
    resolveNextIDIdentityToProfile,
    ECKeyIdentifier,
    formatPersonaFingerprint,
    isSamePersona,
    isSameProfile,
    PersonaInformation,
} from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import type { IdentityResolved } from '@masknet/plugin-infra'

/* cspell:disable-next-line */
// TODO: Migrate to SocialIdentity by @Lanttcat
export interface PersonaNextIDMixture {
    persona: PersonaInformation
    proof: BindingProof[]
    avatar?: string
}

interface PersonaItemProps extends withClasses<'checked' | 'unchecked'> {
    data: PersonaNextIDMixture
    onCopy: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
    onClick: () => void
    currentPersona?: PersonaNextIDMixture
    currentPersonaIdentifier?: ECKeyIdentifier
    currentProfileIdentify: IdentityResolved
}

const useStyles = makeStyles()((theme) => {
    return {
        nickname: {
            fontSize: 16,
            lineHeight: '20px',
            color: theme.palette.maskColor.main,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        fingerprint: {
            fontSize: 12,
            lineHeight: '16px',
            color: theme.palette.maskColor.second,
        },
        indicator: {
            display: 'inline-block',
            background: '#2DDF00',
            borderRadius: '50%',
            width: 7,
            height: 7,
            position: 'absolute',
            left: '77.62%',
            right: '5.84%',
            top: '5.84%',
            bottom: '77.62%',
            border: `1px solid ${theme.palette.maskColor.bottom}`,
        },
    }
})

export const PersonaItemUI = (props: PersonaItemProps) => {
    const { data, onCopy, onClick, currentPersona, currentPersonaIdentifier, currentProfileIdentify } = props
    const { classes } = useStyles(undefined, { props })

    const isVerified = useMemo(() => {
        return data.proof.some(
            (p) =>
                isSameProfile(
                    resolveNextIDIdentityToProfile(p.identity, p.platform),
                    currentProfileIdentify.identifier,
                ) && p.is_valid,
        )
    }, [data])

    return (
        <Stack
            key={data.persona.identifier.toText()}
            direction="row"
            alignItems="center"
            gap={1}
            onClick={() => onClick()}>
            <Box flexGrow={0} position="relative">
                {data.avatar && (
                    <Avatar
                        src={data.avatar}
                        sx={{
                            width: 30,
                            height: 30,
                            display: 'inline-block',
                            borderRadius: '50%',
                        }}
                    />
                )}
                {!data.avatar && <Icons.MenuPersonasActive size={30} />}
                {isSamePersona(currentPersonaIdentifier, data.persona) && <Box className={classes.indicator} />}
            </Box>
            <Stack flexGrow={1}>
                <Typography className={classes.nickname}>
                    <Stack component="span" display="inline-flex" direction="row" alignItems="center" gap={0.25}>
                        {data.persona.nickname}
                        <>{isVerified && <Icons.NextIDMini width={32} height={18} />}</>
                    </Stack>
                </Typography>
                <Typography className={classes.fingerprint}>
                    <Stack component="span" display="inline-flex" direction="row" alignItems="center" gap={0.25}>
                        {formatPersonaFingerprint(data.persona.identifier.rawPublicKey, 4)}
                        <Icons.Copy role="button" size={14} onClick={onCopy} />
                    </Stack>
                </Typography>
            </Stack>
            <Stack flexGrow={0}>
                {isSamePersona(currentPersona?.persona, data.persona) ? (
                    <Icons.CheckCircle size={20} className={classes.checked} />
                ) : (
                    <Icons.RadioNo size={20} className={classes.unchecked} />
                )}
            </Stack>
        </Stack>
    )
}
