import { useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import { delay } from '@masknet/kit'
import { useCustomSnackbar } from '@masknet/theme'
import { SmartPayOwner, SmartPayBundler } from '@masknet/web3-providers'
import { DashboardRoutes, type ECKeyIdentifier, type EC_Public_JsonWebKey } from '@masknet/shared-base'
import { useDashboardI18N } from '../../../locales/index.js'
import { SignUpRoutePath } from '../routePath.js'
import { Messages, PluginServices, Services } from '../../../API.js'
import { PersonaNameUI } from './PersonaNameUI.js'
import { useCreatePersonaByPrivateKey, useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2.js'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext.js'

export function PersonaRecovery() {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    const createPersona = useCreatePersonaV2()
    const createPersonaByPrivateKey = useCreatePersonaByPrivateKey()
    const { showSnackbar } = useCustomSnackbar()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const state = useLocation().state as {
        mnemonic?: string[]
        privateKey?: string
    }

    const [error, setError] = useState('')

    useAsync(async () => {
        if (state.mnemonic && (await Services.Identity.validateMnemonic(state.mnemonic.join(' ')))) return
        if (state.privateKey) return
        navigate(DashboardRoutes.SignUp, { replace: true })
    }, [state.mnemonic, state.privateKey])

    const [{ loading: submitLoading }, onNext] = useAsyncFn(
        async (personaName: string) => {
            setError('')
            try {
                let result:
                    | {
                          address: string
                          identifier: ECKeyIdentifier
                          publicKey: EC_Public_JsonWebKey
                      }
                    | undefined
                if (state.mnemonic) {
                    result = await Services.Identity.queryPersonaEOAByMnemonic(state?.mnemonic.join(' '), '')
                } else if (state.privateKey) {
                    result = await Services.Identity.queryPersonaEOAByPrivateKey(state.privateKey)
                } else {
                    setError('no available identifier')
                    return
                }

                const chainId = await SmartPayBundler.getSupportedChainId()
                if (result?.address) {
                    const smartPayAccounts = await SmartPayOwner.getAccountsByOwners(chainId, [result.address])
                    const hasPaymentPassword = await PluginServices.Wallet.hasPassword()
                    if (smartPayAccounts.filter((x) => x.deployed || x.funded).length && !hasPaymentPassword) {
                        await Services.Backup.addUnconfirmedPersonaRestore({
                            mnemonic: state?.mnemonic?.join(' '),
                            privateKeyString: state.privateKey,
                            personaName,
                        })
                        Messages.events.restoreSuccess.on(() => {
                            navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.ConnectSocialMedia}`)
                            changeCurrentPersona(result?.identifier)
                        })
                        return
                    }
                }

                let identifier: ECKeyIdentifier
                if (state.mnemonic) {
                    identifier = await createPersona(state?.mnemonic.join(' '), personaName)
                } else if (state.privateKey) {
                    identifier = await createPersonaByPrivateKey(state.privateKey, personaName)
                } else {
                    setError('no available identifier')
                    return
                }

                await changeCurrentPersona(identifier)
                showSnackbar(t.create_account_persona_successfully(), { variant: 'success' })

                await delay(300)
                const persona = await Services.Identity.queryPersona(identifier)
                Messages.events.restoreSuccess.sendToAll({
                    wallets: persona?.address ? [persona.address] : [],
                })
                navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.ConnectSocialMedia}`)
            } catch (error) {
                setError((error as Error).message)
            }
        },
        [state?.mnemonic, state?.privateKey],
    )

    return <PersonaNameUI onNext={onNext} loading={submitLoading} error={error} />
}
