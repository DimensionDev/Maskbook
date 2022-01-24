import { useI18N } from '../locales'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { BindDialog } from './BindDialog'
import { useAsync, useAsyncRetry, useCounter } from 'react-use'
import Services from '../../../extension/service'
import { BindingItem } from './BindingItem'
import type { Platform } from '../types'
import { UnbindDialog } from './UnbindDialog'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import { ECKeyIdentifier, Identifier } from '@masknet/shared-base'
import { activatedSocialNetworkUI } from '../../../social-network'

const useStyles = makeStyles()((theme) => ({
    tip: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
        borderRadius: 8,
        alignItems: 'center',
        color: theme.palette.text.primary,
    },
    skeleton: {
        borderRadius: 8,
        margin: theme.spacing(1),
        marginTop: 0,
        backgroundColor: theme.palette.background.default,
        height: '48px',
    },
}))

interface NextIDPageProps {}

export function NextIdPage({}: NextIDPageProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const personaConnectStatus = usePersonaConnectStatus()

    const [openBindDialog, toggleBindDialog] = useState(false)
    const [unbindAddress, setUnBindAddress] = useState<string>()
    const [count, { inc }] = useCounter(0)

    const isOwn = currentProfileIdentifier.identifier.toText() === visitingPersonaIdentifier.identifier.toText()

    const personaActionButton = useMemo(() => {
        if (!personaConnectStatus.action) return null

        const button = personaConnectStatus.hasPersona ? t.connect_persona() : t.create_persona()
        return (
            <Button variant="contained" onClick={personaConnectStatus.action}>
                {button}
            </Button>
        )
    }, [personaConnectStatus, t])

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(() => {
        if (!currentProfileIdentifier) return Promise.resolve(undefined)
        return Services.Identity.queryPersonaByProfile(currentProfileIdentifier.identifier)
    }, [currentProfileIdentifier])

    const { value: bindings, loading } = useAsync(async () => {
        if (!currentPersona) return
        if (isOwn) {
            return Services.Helper.queryExistedBinding(currentPersona.identifier)
        }
        // fetch visiting public key from kv server
        const identifierStringInKV = await Services.Helper.getNextIDRelationFromKV(
            activatedSocialNetworkUI.name,
            visitingPersonaIdentifier.identifier.userId,
        )

        if (identifierStringInKV) {
            const personaFromKV = Identifier.fromString(identifierStringInKV, ECKeyIdentifier).unwrapOr(undefined)
            if (personaFromKV) {
                return Services.Helper.queryExistedBinding(personaFromKV)
            }
        }

        // fetch visiting public key from local
        if (!visitingPersonaIdentifier) return Promise.resolve(null)
        const visitingPersona = await Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)

        if (!visitingPersona) return Promise.resolve(null)
        return Services.Helper.queryExistedBinding(visitingPersona.identifier)
    }, [currentPersona, count, visitingPersonaIdentifier])

    if (personaActionButton) {
        return (
            <Stack justifyContent="center" direction="row" mt="24px">
                {personaActionButton}
            </Stack>
        )
    }

    if (loading || loadingPersona) {
        return (
            <>
                {Array.from({ length: 2 })
                    .fill(0)
                    .map((_, i) => (
                        <div key={i}>
                            <Skeleton className={classes.skeleton} animation="wave" variant="rectangular" />
                        </div>
                    ))}
            </>
        )
    }

    if (bindings?.proofs.length) {
        return (
            <>
                <Box>
                    <Box>
                        {bindings.proofs.map((x) => (
                            <BindingItem
                                enableAction={isOwn}
                                key={x.identity}
                                platform={x.platform as Platform}
                                identity={x.identity}
                                onUnBind={setUnBindAddress}
                            />
                        ))}
                    </Box>
                    {isOwn && (
                        <Stack justifyContent="center" direction="row" mt="24px">
                            <Button variant="contained" onClick={() => toggleBindDialog(true)}>
                                {t.add_wallet_button()}
                            </Button>
                        </Stack>
                    )}
                </Box>
                {openBindDialog && currentPersona && isOwn && (
                    <BindDialog
                        open={openBindDialog}
                        onClose={() => toggleBindDialog(false)}
                        persona={currentPersona}
                        bounds={bindings?.proofs ?? []}
                        onBind={() => inc(1)}
                    />
                )}
                {unbindAddress && currentPersona && isOwn && (
                    <UnbindDialog
                        unbindAddress={unbindAddress}
                        onClose={() => setUnBindAddress(undefined)}
                        persona={currentPersona}
                        onUnBind={() => inc(1)}
                        bounds={bindings?.proofs ?? []}
                    />
                )}
            </>
        )
    }

    return (
        <>
            <Box>
                <Box className={classes.tip}>
                    <Typography>{t.connect_wallet_tip_intro()}</Typography>
                    <Typography>{t.connect_wallet_tip()}</Typography>
                </Box>
                {isOwn && (
                    <Stack justifyContent="center" direction="row" mt="24px">
                        <Button variant="contained" onClick={() => toggleBindDialog(true)}>
                            {t.verify_wallet_button()}
                        </Button>
                    </Stack>
                )}
            </Box>
            {openBindDialog && currentPersona && isOwn && (
                <BindDialog
                    open={openBindDialog}
                    onClose={() => toggleBindDialog(false)}
                    persona={currentPersona}
                    bounds={bindings?.proofs ?? []}
                    onBind={() => inc(1)}
                />
            )}
        </>
    )
}
