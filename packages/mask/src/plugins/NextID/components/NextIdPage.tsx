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
    }, [currentProfileIdentifier, personaConnectStatus.hasPersona])

    const { value: bindings, loading } = useAsync(async () => {
        if (!currentPersona) return
        if (isOwn) {
            return Services.Helper.queryExistedBinding(currentPersona.identifier)
        }

        if (!visitingPersonaIdentifier) return null
        const visitingPersona = await Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)

        if (!visitingPersona) return null
        return Services.Helper.queryExistedBinding(visitingPersona.identifier)
    }, [currentPersona, count, visitingPersonaIdentifier, isOwn])

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
                {isOwn ? (
                    <Box className={classes.tip}>
                        <Typography>{t.connect_wallet_tip_intro()}</Typography>
                        <Typography>{t.connect_wallet_tip()}</Typography>
                    </Box>
                ) : (
                    <Box className={classes.tip}>
                        <Typography>{t.connect_wallet__other_user_tip_intro()}</Typography>
                    </Box>
                )}
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
