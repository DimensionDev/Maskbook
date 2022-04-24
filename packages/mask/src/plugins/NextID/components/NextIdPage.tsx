import { NextIDPlatform } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useAsync, useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useNextIDConnectStatus } from '../../../components/DataSource/useNextID'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { activatedSocialNetworkUI } from '../../../social-network'
import { TAB_SELECTOR } from '../constants'
import { useI18N } from '../locales'
import { BindDialog } from './BindDialog'
import { BindingItem } from './BindingItem'
import { UnbindDialog } from './UnbindDialog'

const useStyles = makeStyles()((theme) => ({
    tip: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
        borderRadius: 8,
        alignItems: 'center',
        color: theme.palette.text.primary,
    },
    verifyIntro: {
        fontSize: '14px',
        fontWeight: 500,
        marginBottom: '12px',
    },
    verifyDetail: {
        fontSize: '14px',
        fontWeight: 400,
        color: theme.palette.grey[700],
    },
    verifyInstruction: {
        fontSize: '14px',
        fontWeight: 400,
        color: theme.palette.grey[700],
    },
    skeleton: {
        borderRadius: 8,
        margin: theme.spacing(1),
        marginTop: 0,
        backgroundColor: theme.palette.background.default,
        height: '48px',
    },
}))

interface NextIdPageProps {
    personaList: string[]
}

export function NextIdPage({ personaList }: NextIdPageProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const personaConnectStatus = usePersonaConnectStatus()
    const { reset, isVerified } = useNextIDConnectStatus()

    const [openBindDialog, toggleBindDialog] = useState(false)
    const [unbindAddress, setUnBindAddress] = useState<string>()
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const isOwn = currentProfileIdentifier.identifier === visitingPersonaIdentifier.identifier
    const tipable = !isOwn

    const personaActionButton = useMemo(() => {
        if (!personaConnectStatus.action) return null

        const button = personaConnectStatus.hasPersona ? t.connect_persona() : t.create_persona()
        return (
            <Button variant="contained" onClick={personaConnectStatus.action}>
                {button}
            </Button>
        )
    }, [personaConnectStatus, t])

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        return Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier, personaConnectStatus.hasPersona])

    const { value: isAccountVerified, loading: loadingVerifyInfo } = useAsync(async () => {
        if (!currentPersona?.publicHexKey) return
        if (!currentPersona.identifier) return
        if (!visitingPersonaIdentifier.identifier) return
        return NextIDProof.queryIsBound(
            currentPersona.publicHexKey,
            platform,
            visitingPersonaIdentifier.identifier.userId,
        )
    }, [isOwn, currentPersona, visitingPersonaIdentifier, isVerified])

    const {
        value: bindings,
        loading,
        retry: retryQueryBinding,
    } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey!)
    }, [currentPersona, isOwn])

    const onVerify = async () => {
        reset()
        const firstTab = TAB_SELECTOR?.[platform]?.evaluate()?.querySelector('div')?.parentNode
            ?.firstChild as HTMLElement
        firstTab.click()
    }

    if (personaActionButton) {
        return (
            <Stack justifyContent="center" direction="row" mt="24px">
                {personaActionButton}
            </Stack>
        )
    }

    if (loading || loadingPersona || loadingVerifyInfo) {
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

    if (!isAccountVerified && isOwn) {
        return (
            <Box>
                <Box className={classes.tip}>
                    <Typography className={classes.verifyIntro}>{t.verify_Twitter_ID_intro()}</Typography>
                    <Typography className={classes.verifyDetail}>{t.verify_Twitter_ID()}</Typography>
                </Box>

                <Stack justifyContent="center" direction="row" mt="24px">
                    <Button variant="contained" onClick={onVerify}>
                        {t.verify_Twitter_ID_button()}
                    </Button>
                </Stack>
            </Box>
        )
    }

    if (bindings?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum).length) {
        return (
            <>
                <Box>
                    <Box>
                        {bindings.proofs.map((x) => (
                            <BindingItem
                                deletable={isOwn}
                                tipable={tipable}
                                key={x.identity}
                                platform={x.platform}
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
                        onBound={retryQueryBinding}
                    />
                )}
                {unbindAddress && currentPersona && isOwn && (
                    <UnbindDialog
                        unbindAddress={unbindAddress}
                        onClose={() => setUnBindAddress(undefined)}
                        persona={currentPersona}
                        onUnBound={retryQueryBinding}
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
                        <Typography className={classes.verifyIntro}>{t.verify_wallet_intro()}</Typography>
                        <Typography className={classes.verifyDetail}>{t.verify_wallet()}</Typography>
                    </Box>
                ) : (
                    <Box className={classes.tip}>
                        <Typography className={classes.verifyIntro}>
                            {t.connect_wallet__other_user_tip_intro()}
                        </Typography>
                        <Typography className={classes.verifyInstruction}>
                            {t.connect_wallet_other_user_instruction()}
                        </Typography>
                        <Typography className={classes.verifyDetail}>{t.connect_wallet_other_user_tip1()}</Typography>
                        <Typography className={classes.verifyDetail}>{t.connect_wallet_other_user_tip2()}</Typography>
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
                    onBound={retryQueryBinding}
                />
            )}
        </>
    )
}
