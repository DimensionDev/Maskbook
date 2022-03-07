import { useI18N } from '../locales'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'
import { NextIDPlatform } from '@masknet/shared-base'
import type { NextIDPersonaBindings } from '@masknet/shared-base'
import { useMemo, useState } from 'react'
import { BindDialog } from './BindDialog'
import { useAsync, useAsyncRetry, useCounter } from 'react-use'
import Services from '../../../extension/service'
import { BindingItem } from './BindingItem'
import { UnbindDialog } from './UnbindDialog'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import { queryIsBound, queryExistedBindingByPersona } from '@masknet/web3-providers'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useNextIDConnectStatus } from '../../../components/DataSource/useNextID'
import { searchAllProfileTabSelector } from '../../../social-network-adaptor/twitter.com/utils/selector'

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
        fontWeight: 600,
        marginBottom: '12px',
    },
    verifyDetail: {
        fontWeight: 600,
        color: '#536471',
    },
    verifyWarning: {
        fontWeight: 600,
        color: '#536471',
        marginTop: '12px',
    },
    skeleton: {
        borderRadius: 8,
        margin: theme.spacing(1),
        marginTop: 0,
        backgroundColor: theme.palette.background.default,
        height: '48px',
    },
}))

interface NextIDPageProps {
    personaList: NextIDPersonaBindings[]
}

export function NextIdPage({ personaList }: NextIDPageProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const personaConnectStatus = usePersonaConnectStatus()
    const { reset, isVerified } = useNextIDConnectStatus()
    const [refresh, toggleRefresh] = useState(true)

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
        if (!visitingPersonaIdentifier) return Promise.resolve(undefined)
        return Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier, personaConnectStatus.hasPersona])

    const { value: isAccountVerified, loading: loadingVerifyInfo } = useAsync(() => {
        if (!currentPersona) return Promise.resolve(undefined)
        const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
        return queryIsBound(
            currentPersona.publicHexKey as string,
            platform,
            visitingPersonaIdentifier.identifier.userId,
        )
    }, [isOwn, currentPersona, visitingPersonaIdentifier, isVerified])

    const { value: bindings, loading } = useAsync(async () => {
        if (!currentPersona) return
        return queryExistedBindingByPersona(currentPersona.publicHexKey!)
    }, [currentPersona, isOwn, count])

    const onVerify = async () => {
        reset()
        const firstTab = searchAllProfileTabSelector().evaluate()?.querySelector('div')?.parentNode
            ?.firstChild as HTMLElement
        firstTab.click()
        toggleRefresh((pre) => !pre)
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

    if (!isAccountVerified) {
        return (
            <Box>
                {isOwn ? (
                    <Box className={classes.tip}>
                        <Typography className={classes.verifyIntro}>{t.verify_Twitter_ID_intro()}</Typography>
                        <Typography className={classes.verifyDetail}>{t.verify_Twitter_ID()}</Typography>
                    </Box>
                ) : (
                    <Box className={classes.tip}>
                        <Typography className={classes.verifyIntro}>
                            {t.connect_wallet__other_user_tip_intro()}
                        </Typography>
                        <Typography className={classes.verifyDetail}>{t.connect_wallet_other_user_tip1()}</Typography>
                        <Typography className={classes.verifyDetail}>{t.connect_wallet_other_user_tip2()}</Typography>
                        <Typography className={classes.verifyWarning}>
                            {t.connect_wallet_other_user_warning()}
                        </Typography>
                    </Box>
                )}
                {isOwn && (
                    <Stack justifyContent="center" direction="row" mt="24px">
                        <Button variant="contained" onClick={onVerify}>
                            {t.verify_Twitter_ID_button()}
                        </Button>
                    </Stack>
                )}
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
                                enableAction={isOwn}
                                key={x.identity}
                                platform={x.platform as NextIDPlatform}
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
                        <Typography className={classes.verifyIntro}>{t.verify_wallet_intro()}</Typography>
                        <Typography className={classes.verifyDetail}>{t.verify_wallet()}</Typography>
                    </Box>
                ) : (
                    <Box className={classes.tip}>
                        <Typography className={classes.verifyIntro}>
                            {t.connect_wallet__other_user_tip_intro()}
                        </Typography>
                        <Typography className={classes.verifyDetail}>{t.connect_wallet_other_user_tip1()}</Typography>
                        <Typography className={classes.verifyDetail}>{t.connect_wallet_other_user_tip2()}</Typography>
                        <Typography className={classes.verifyDetail}>
                            {t.connect_wallet_other_user_warning()}
                        </Typography>
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
