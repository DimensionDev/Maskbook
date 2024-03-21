import { Icons } from '@masknet/icons'
import type { IdentityResolved } from '@masknet/plugin-infra'
import {
    formatPersonaFingerprint,
    isSamePersona,
    isSameProfile,
    resolveNextIDIdentityToProfile,
    type BindingProof,
    type ECKeyIdentifier,
    type PersonaInformation,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Avatar, Box, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { CopyButton } from '../CopyButton/index.js'
import { EmojiAvatar } from '../EmojiAvatar/index.js'

/* cspell:disable-next-line */
// TODO: Migrate to SocialIdentity by @Lanttcat
export interface PersonaNextIDMixture {
    persona: PersonaInformation
    proof: BindingProof[]
    avatar?: string
}

interface PersonaItemProps extends withClasses<'checked' | 'unchecked'> {
    data: PersonaNextIDMixture
    onClick: () => void
    currentPersona?: PersonaNextIDMixture
    currentPersonaIdentifier?: ECKeyIdentifier
    currentProfileIdentify?: IdentityResolved
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

export function PersonaItemUI(props: PersonaItemProps) {
    const { data, onClick, currentPersona, currentPersonaIdentifier, currentProfileIdentify } = props
    const { classes } = useStyles(undefined, { props })

    const isVerified = useMemo(() => {
        return data.proof.some(
            (p) =>
                isSameProfile(
                    resolveNextIDIdentityToProfile(p.identity, p.platform),
                    currentProfileIdentify?.identifier,
                ) && p.is_valid,
        )
    }, [data.proof])

    return (
        <Stack direction="row" alignItems="center" gap={1} onClick={onClick}>
            <Box flexGrow={0} position="relative">
                {data.avatar ?
                    <Avatar
                        src={data.avatar}
                        sx={{
                            width: 30,
                            height: 30,
                            display: 'inline-block',
                            borderRadius: '50%',
                        }}
                    />
                :   <EmojiAvatar value={data.persona.identifier.publicKeyAsHex} />}
                {isSamePersona(currentPersonaIdentifier, data.persona) && <Box className={classes.indicator} />}
            </Box>
            <Stack flexGrow={1}>
                <Typography className={classes.nickname}>
                    <Stack component="span" display="inline-flex" direction="row" alignItems="center" gap={0.25}>
                        {data.persona.nickname}
                        {isVerified ?
                            <Icons.NextIDMini width={32} height={18} />
                        :   null}
                    </Stack>
                </Typography>
                <Typography className={classes.fingerprint}>
                    <Stack component="span" display="inline-flex" direction="row" alignItems="center" gap={0.25}>
                        {formatPersonaFingerprint(data.persona.identifier.rawPublicKey, 4)}
                        <CopyButton size={14} text={data.persona.identifier.rawPublicKey} />
                    </Stack>
                </Typography>
            </Stack>
            <Stack flexGrow={0}>
                {isSamePersona(currentPersona?.persona, data.persona) ?
                    <Icons.CheckCircle size={20} className={classes.checked} />
                :   <Icons.RadioNo size={20} className={classes.unchecked} />}
            </Stack>
        </Stack>
    )
}
