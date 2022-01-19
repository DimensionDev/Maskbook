import { Box, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../locales'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { MasksIcon } from '@masknet/icons'
import { formatFingerprint, LoadingAnimation } from '@masknet/shared'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import DoneIcon from '@mui/icons-material/Done'
import { LoadingButton } from '@mui/lab'
import type { Persona } from '../../../database'
import type { Binding } from '../types'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'

const useStyles = makeStyles()((theme) => ({
    persona: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
        borderRadius: 8,
        alignItems: 'center',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '4px',
        width: 48,
        height: 48,
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
    },
    identifier: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
    },
    subTitle: {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 600,
        marginBottom: 11.5,
        color: theme.palette.text.primary,
    },
    stepNumber: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '30px',
        height: '30px',
        border: `1px solid ${getMaskColor(theme).twitterMain}`,
        borderRadius: '50%',
    },
    stepLine: {
        border: `1px solid ${getMaskColor(theme).twitterMain}`,
        height: 0,
        width: '60%',
        marginLeft: '24px',
        marginRight: '24px',
    },
    done: {
        background: '#60DFAB',
    },
    loadingIcon: {
        position: 'relative',
        right: -6,
    },
}))

interface VerifyWalletDialogProps {
    open: boolean
    persona: Persona
    onUnBind(): void
    onClose(): void
    bounds: Binding[]
}

enum SignSteps {
    personaSign = 'personaSign',
    walletSign = 'walletSign',
}

export const UnBindDialog = memo<VerifyWalletDialogProps>(({ open, onClose, persona, onUnBind, bounds }) => {
    const account = useAccount()
    const t = useI18N()
    const { classes } = useStyles()
    const currentIdentifier = persona.identifier
    const isBound = !!bounds.find((x) => isSameAddress(x.identity, account))

    const { value: message } = useAsyncRetry(() => {
        if (!currentIdentifier || !account) return Promise.resolve(null)
        return Services.Helper.createPersonaPayload(currentIdentifier, 'delete', account, 'ethereum')
    }, [currentIdentifier])

    const [personaSignState, handlePersonaSign] = useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        return Services.Identity.signWithPersona({
            method: 'eth',
            message: message,
            identifier: currentIdentifier.toText(),
        })
    }, [message, currentIdentifier, account])

    const [walletSignState, handleWalletSign] = useAsyncFn(async () => {
        if (!account || !message) return
        return Services.Ethereum.personalSign(message, account)
    }, [personaSignState.value, account, message])

    useAsyncRetry(async () => {
        if (!personaSignState.value && !walletSignState.value) return
        await Services.Helper.bindProof(
            currentIdentifier,
            'delete',
            'ethereum',
            account,
            walletSignState.value,
            personaSignState.value?.signature.signature,
        )
        onUnBind()
        onClose()
    }, [walletSignState.value, personaSignState.value])

    // move to panel
    return (
        <InjectedDialog open={open} title={t.unbind_dialog_title()} onClose={onClose}>
            <DialogContent style={{ minWidth: 515 }}>
                <Box>
                    <Typography className={classes.subTitle}>{t.persona()}</Typography>
                    <Stack direction="row" className={classes.persona}>
                        <div className={classes.iconContainer}>
                            <MasksIcon style={{ fontSize: '48px' }} />
                        </div>
                        <div>
                            <Typography className={classes.name}>{persona?.nickname}</Typography>
                            <Typography className={classes.identifier}>
                                {formatFingerprint(persona?.identifier.compressedPoint ?? '', 10)}
                            </Typography>
                        </div>
                    </Stack>
                </Box>
                <Box>
                    <Typography className={classes.subTitle}>{t.wallet()}</Typography>
                    <WalletStatusBox />
                </Box>
            </DialogContent>
            <DialogActions>
                <Stack direction="row" mb="24px" width="100%" justifyContent="space-around" alignItems="center">
                    <LoadingButton
                        classes={{
                            loadingIndicatorEnd: classes.loadingIcon,
                        }}
                        loadingPosition="end"
                        style={{ width: '40%' }}
                        className={personaSignState.value?.signature ? classes.done : ''}
                        loading={personaSignState.loading}
                        variant="contained"
                        onClick={handlePersonaSign}
                        endIcon={personaSignState.value?.signature ? <DoneIcon /> : null}
                        loadingIndicator={<LoadingAnimation />}>
                        {t.persona_sign()}
                    </LoadingButton>
                    <Box> {t.unbind_or()} </Box>
                    <LoadingButton
                        classes={{
                            loadingIndicatorEnd: classes.loadingIcon,
                        }}
                        loadingPosition="end"
                        disabled={!isBound}
                        style={{ width: '40%' }}
                        className={walletSignState.value ? classes.done : ''}
                        loading={walletSignState.loading}
                        variant="contained"
                        onClick={handleWalletSign}
                        endIcon={walletSignState.value ? <DoneIcon /> : null}
                        loadingIndicator={<LoadingAnimation />}>
                        {t.wallet_sign()}
                    </LoadingButton>
                </Stack>
            </DialogActions>
        </InjectedDialog>
    )
})
