import React, { useEffect, useRef, useState } from 'react'
import Welcome1a1a from '../../../components/Welcomes/1a1a'
import Welcome1a1b from '../../../components/Welcomes/1a1b'
import Welcome1a2 from '../../../components/Welcomes/1a2'
import Welcome1a3a from '../../../components/Welcomes/1a3a'
import Welcome1a3b from '../../../components/Welcomes/1a3b'
import Welcome1a4 from '../../../components/Welcomes/1a4'
import Welcome1b1 from '../../../components/Welcomes/1b1'
import Services from '../../service'
import { RouteComponentProps, withRouter } from 'react-router'
import { Dialog, useTheme, useMediaQuery, makeStyles } from '@material-ui/core'
import { Identifier, ProfileIdentifier } from '../../../database/type'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { Profile } from '../../../database'
import { getCurrentNetworkWorkerService } from '../../background-script/WorkerService'
import getCurrentNetworkWorker from '../../../social-network/utils/getCurrentNetworkWorker'
import { BackupJSONFileLatest } from '../../../utils/type-transform/BackupFile'
import { isNil } from 'lodash-es'
import { useSnackbar } from 'notistack'
import { geti18nString } from '../../../utils/i18n'

enum WelcomeState {
    // Create
    SelectIdentity,
    LinkNewSocialNetworks,
    Intro,
    GenerateKey,
    BackupKey,
    ProvePost,
    // Restore
    RestoreKeypair,
}
const WelcomeActions = {
    backupMyKeyPair() {
        return Services.Welcome.backupMyKeyPair({ download: true, onlyBackupWhoAmI: false })
    },
    /**
     *
     * @param json - The backup file
     * @param id   - Who am I?
     */
    restoreFromFile(json: BackupJSONFileLatest, id: ProfileIdentifier): Promise<void> {
        // This request MUST BE sync or Firefox will reject this request
        return browser.permissions
            .request({ origins: json.grantedHostPermissions })
            .then(granted =>
                granted
                    ? Services.Welcome.restoreBackup(json, id)
                    : Promise.reject(new Error('required permission is not granted.')),
            )
    },
    autoVerifyBio(network: ProfileIdentifier, provePost: string) {
        getCurrentNetworkWorkerService(network).autoVerifyBio!(network, provePost)
    },
    autoVerifyPost(network: ProfileIdentifier, provePost: string) {
        getCurrentNetworkWorkerService(network).autoVerifyPost!(network, provePost)
    },
    manualVerifyBio(user: ProfileIdentifier, prove: string) {
        this.autoVerifyBio(user, prove)
    },
}
interface Welcome {
    whoAmI: Profile
    // Display
    provePost: string
    currentStep: WelcomeState
    personHintFromSearch: Profile
    mnemonicWord: string | null
    currentIdentities: Profile[]
    // Actions
    onStepChange(state: WelcomeState): void
    onSelectIdentity(person: Profile): void
    onFinish(reason: 'done' | 'quit'): void
    onGenerateKey(password: string): void
    onRestoreByMnemonicWord(words: string, password: string): void
    onConnectOtherPerson(whoAmI: ProfileIdentifier, target: ProfileIdentifier): void
    sideEffects: typeof WelcomeActions
}
function Welcome(props: Welcome) {
    const { currentStep, onFinish, onStepChange, provePost, sideEffects, whoAmI, currentIdentities } = props
    const { onSelectIdentity, personHintFromSearch } = props
    const currentIdentitiesFiltered = React.useMemo(() => {
        return personHintFromSearch.identifier.isUnknown
            ? currentIdentities
            : [
                  personHintFromSearch,
                  ...currentIdentities.filter(x => x.identifier.equals(personHintFromSearch.identifier) === false),
              ]
    }, [currentIdentities, personHintFromSearch])
    switch (currentStep) {
        case WelcomeState.SelectIdentity:
            return (
                <Welcome1a1a
                    linkNewSocialNetworks={() => onStepChange(WelcomeState.LinkNewSocialNetworks)}
                    next={selected => {
                        onSelectIdentity(selected)
                        onStepChange(WelcomeState.Intro)
                    }}
                    identities={currentIdentitiesFiltered}
                />
            )
        case WelcomeState.LinkNewSocialNetworks:
            return (
                <Welcome1a1b
                    restoreBackup={() => onStepChange(WelcomeState.RestoreKeypair)}
                    useExistingAccounts={() => onStepChange(WelcomeState.SelectIdentity)}
                />
            )
        case WelcomeState.Intro:
            return (
                <Welcome1a2
                    back={() => onStepChange(WelcomeState.SelectIdentity)}
                    next={() => onStepChange(WelcomeState.GenerateKey)}
                />
            )
        case WelcomeState.GenerateKey:
            return (
                <Welcome1a3a
                    back={() => onStepChange(WelcomeState.Intro)}
                    availableIdentityCount={props.currentIdentities.length}
                    onConnectOtherPerson={x => props.onConnectOtherPerson(whoAmI.identifier, x)}
                    onRestoreByMnemonicWord={props.onRestoreByMnemonicWord}
                    generatedMnemonicWord={props.mnemonicWord}
                    onGenerateKey={props.onGenerateKey}
                    next={() => {
                        sideEffects
                            .backupMyKeyPair()
                            .then(updateProveBio)
                            .finally(() => {
                                onStepChange(WelcomeState.ProvePost)
                            })
                    }}
                />
            )
        case WelcomeState.BackupKey:
            return (
                <Welcome1a3b
                    next={() => {
                        sideEffects
                            .backupMyKeyPair()
                            .then(updateProveBio)
                            .finally(() => {
                                onStepChange(WelcomeState.ProvePost)
                            })
                    }}
                />
            )
        case WelcomeState.ProvePost:
            const worker = getCurrentNetworkWorker(props.whoAmI.identifier)
            const copyToClipboard = (provePost: string) => {
                try {
                    // This may throw on some (Safari) browsers.
                    navigator.clipboard.writeText(provePost)
                } catch {}
            }
            return (
                <Welcome1a4
                    back={() => onStepChange(WelcomeState.GenerateKey)}
                    hasManual={!isNil(worker.manualVerifyPost)}
                    hasBio={!isNil(worker.autoVerifyBio)}
                    hasPost={!isNil(worker.autoVerifyPost)}
                    bioDisabled={whoAmI.identifier.isUnknown}
                    provePost={provePost}
                    requestManualVerify={() => {
                        copyToClipboard(provePost)
                        sideEffects.manualVerifyBio(whoAmI.identifier, provePost)
                        onFinish('done')
                    }}
                    requestAutoVerify={type => {
                        copyToClipboard(provePost)
                        if (type === 'bio') sideEffects.autoVerifyBio(whoAmI.identifier, provePost)
                        else if (type === 'post') sideEffects.autoVerifyPost(whoAmI.identifier, provePost)
                        onFinish('done')
                    }}
                />
            )
        case WelcomeState.RestoreKeypair:
            return (
                <Welcome1b1
                    restore={json => {
                        sideEffects.restoreFromFile(json, props.whoAmI.identifier).then(
                            () => onFinish('done'),
                            // TODO: use a better UI
                            error => alert(error),
                        )
                    }}
                />
            )
    }
}
const provePostRef = new ValueRef('')
const personInferFromURLRef = new ValueRef<Profile>({
    identifier: ProfileIdentifier.unknown,
    createdAt: new Date(),
    updatedAt: new Date(),
})
const selectedIdRef = new ValueRef<Profile>(personInferFromURLRef.value)
const ownedIdsRef = new ValueRef<Profile[]>([])

provePostRef.addListener(val => console.log('New prove post:', val))
personInferFromURLRef.addListener(val => console.log('Infer user from URL:', val))
selectedIdRef.addListener(val => console.log('Selected id:', val))
ownedIdsRef.addListener(val => console.log('Owned id', val))

selectedIdRef.addListener(updateProveBio)

const fillRefs = async () => {
    if (selectedIdRef.value.identifier.isUnknown) {
        const all = await Services.Identity.queryMyProfiles()
        ownedIdsRef.value = all
        if (all[0]) selectedIdRef.value = all[0]
    }
    updateProveBio()
}
async function updateProveBio() {
    const post = await Services.Crypto.getMyProveBio(selectedIdRef.value.identifier)
    if (post) provePostRef.value = post
}

export type Query = {
    identifier: ProfileIdentifier
    avatar?: string
    nickname?: string
}
export const IdentifierRefContext = React.createContext(selectedIdRef)

const useStyles = makeStyles(theme => ({
    fullScreenDialog: {
        margin: 'auto 0 0',
        height: '90%',
    },
    Dialog: {
        width: '100%',
    },
}))

export default withRouter(function _WelcomePortal(props: RouteComponentProps) {
    const [step, setStep] = useState(WelcomeState.LinkNewSocialNetworks)

    useEffect(() => {
        fillRefs()
    }, [])

    const provePost = useValueRef(provePostRef)
    const personFromURL = useValueRef(personInferFromURLRef)
    const selectedId = useValueRef(selectedIdRef)
    const ownIds = useValueRef(ownedIdsRef)

    useEffect(() => {
        const search = new URLSearchParams(props.location.search)

        const isRestore = search.get('restore')
        if (isRestore !== null) {
            setStep(WelcomeState.RestoreKeypair)
            return
        }

        const identifier = search.get('identifier') || ''
        const avatar = search.get('avatar') || ''
        const nickname = search.get('nickname') || ''
        const id = Identifier.fromString(identifier)
        if (id && id.equals(selectedId.identifier)) return

        if (id instanceof ProfileIdentifier) {
            if (id.isUnknown) return
            Services.Identity.queryProfile(id)
                .then(x => [x].filter(y => y.linkedPersona?.hasPrivateKey))
                .then(([inDB = {} as Profile]) => {
                    const person = (personInferFromURLRef.value = {
                        identifier: id,
                        nickname: nickname || inDB.nickname,
                        avatar: avatar || inDB.avatar,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    } as Profile)
                    Services.Identity.updateProfileInfo(person.identifier, {
                        nickname: person.nickname,
                        avatarURL: person.avatar,
                    })
                })
                .then(() => setStep(WelcomeState.SelectIdentity))
        }
    }, [props.location.search, selectedId.identifier])

    const [mnemonic, setMnemonic] = useState<string | null>(null)

    const { enqueueSnackbar } = useSnackbar()

    const theme = useTheme()
    const classes = useStyles()
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'))

    return (
        <Dialog
            classes={{ paper: classes[fullScreen ? 'fullScreenDialog' : 'Dialog'] }}
            open
            fullScreen={fullScreen}
            onClose={() => props.history.replace('/')}>
            <IdentifierRefContext.Provider value={selectedIdRef}>
                <Welcome
                    onConnectOtherPerson={(w, t) => {
                        Services.Identity.attachProfile(w, t, { connectionConfirmState: 'confirmed' }).then(
                            () => setStep(WelcomeState.BackupKey),
                            alert,
                        )
                    }}
                    onRestoreByMnemonicWord={(w, p) => {
                        Services.Welcome.restoreNewIdentityWithMnemonicWord(selectedId.identifier, w, p).then(
                            () => setStep(WelcomeState.BackupKey),
                            alert,
                        )
                    }}
                    mnemonicWord={mnemonic}
                    onGenerateKey={password => {
                        Services.Welcome.createNewIdentityByMnemonicWord(selectedId.identifier, password).then(words =>
                            setMnemonic(words),
                        )
                    }}
                    provePost={provePost}
                    currentStep={step}
                    sideEffects={WelcomeActions}
                    onStepChange={setStep}
                    whoAmI={selectedId}
                    currentIdentities={ownIds}
                    personHintFromSearch={personFromURL}
                    onSelectIdentity={p => (selectedIdRef.value = p)}
                    onFinish={() => {
                        if (webpackEnv.firefoxVariant === 'GeckoView' || webpackEnv.target === 'WKWebview')
                            window.close()
                        enqueueSnackbar(geti18nString('dashboard_item_done'), {
                            variant: 'success',
                            autoHideDuration: 2000,
                        })
                        props.history.replace('/')
                    }}
                />
            </IdentifierRefContext.Provider>
        </Dialog>
    )
})
//#endregion
