import { Trans, useLingui } from '@lingui/react/macro'
import { attachProfile } from '@masknet/plugin-infra/dom/context'
import { PersonaContext, PopupHomeTabType } from '@masknet/shared'
import {
    AbortError,
    EnhanceableSite,
    FarcasterPatchSignerError,
    FireflyAlreadyBoundError,
    FireflyBindTimeoutError,
    PopupRoutes,
    ProfileIdentifier,
    TimeoutError,
} from '@masknet/shared-base'
import { LoadingBase, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { addAccount, type AccountOptions, type FireflyAccount } from '@masknet/web3-providers'
import { Social } from '@masknet/web3-providers/types'
import { Box } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { QRCode } from 'react-qrcode-logo'
import { useNavigate } from 'react-router-dom'
import { useMount } from 'react-use'
import urlcat from 'urlcat'
import { useTitle } from '../../../hooks/index.js'
import { createAccountByRelayService } from './createAccountByRelayService.js'

const useStyles = makeStyles()({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    loading: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

function useLogin() {
    const { showSnackbar } = usePopupCustomSnackbar()
    return useCallback(
        async function login(createAccount: () => Promise<FireflyAccount>, options?: Omit<AccountOptions, 'source'>) {
            try {
                const account = await createAccount()

                const done = await addAccount(account, options)
                console.log('created account', account)
                if (done) showSnackbar(<Trans>Your {Social.Source.Farcaster} account is now connected.</Trans>)
            } catch (error) {
                // skip if the error is abort error
                if (AbortError.is(error)) return

                // if login timed out, let the user refresh the QR code
                if (error instanceof TimeoutError || error instanceof FireflyBindTimeoutError) {
                    showSnackbar(<Trans>This QR code is longer valid. Please scan a new one to continue.</Trans>)
                    return
                }

                // failed to patch the signer
                if (error instanceof FarcasterPatchSignerError) throw error

                // if any error occurs, close the modal
                // by this we don't need to do error handling in UI part.
                // if the account is already bound to another account, show a warning message
                if (error instanceof FireflyAlreadyBoundError) {
                    showSnackbar(
                        <Trans>
                            The account you are trying to log in with is already linked to a different Firefly account.
                        </Trans>,
                    )
                    return
                }

                throw error
            }
        },
        [showSnackbar],
    )
}

export const Component = memo(function ConnectFireflyPage() {
    const { t } = useLingui()
    const { classes } = useStyles()
    const [url, setUrl] = useState('')

    const navigate = useNavigate()
    const login = useLogin()
    const { currentPersona } = PersonaContext.useContainer()

    useMount(async () => {
        login(async () => {
            try {
                const account = await createAccountByRelayService((url) => {
                    setUrl(url)
                })
                console.log('account', account)
                if (attachProfile && currentPersona) {
                    await attachProfile(
                        ProfileIdentifier.of(EnhanceableSite.Farcaster, account.session.profileId).unwrap(),
                        currentPersona.identifier,
                        { connectionConfirmState: 'pending', token: account.session.token },
                    )
                }
                console.log('account', account)
                return account
            } catch (err) {
                console.log('error', err)
                throw err
            }
        })
    })

    const handleBack = useCallback(() => {
        navigate(urlcat(PopupRoutes.Personas, { tab: PopupHomeTabType.ConnectedWallets }), {
            replace: true,
        })
    }, [])

    useTitle(t`Connect Firefly`, handleBack)

    return (
        <Box className={classes.container}>
            <QRCode value={url} ecLevel="L" size={220} quietZone={16} eyeRadius={100} qrStyle="dots" />
            {!url ?
                <div className={classes.loading}>
                    <LoadingBase size={30} />
                </div>
            :   null}
        </Box>
    )
})
