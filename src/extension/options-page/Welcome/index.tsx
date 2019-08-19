import React, { useState, useEffect } from 'react'
import Welcome0 from '../../../components/Welcomes/0'
import Welcome1a1a from '../../../components/Welcomes/1a1a'
import Welcome1a1b from '../../../components/Welcomes/1a1b'
import Welcome1a2 from '../../../components/Welcomes/1a2'
import Welcome1a3 from '../../../components/Welcomes/1a3'
import Welcome1a4v2 from '../../../components/Welcomes/1a4.v2'
import Welcome1b1 from '../../../components/Welcomes/1b1'
import Welcome2 from '../../../components/Welcomes/2'
import Services from '../../service'
import { RouteComponentProps, withRouter } from 'react-router'
import { Dialog, withMobileDialog } from '@material-ui/core'
import { Identifier, PersonIdentifier } from '../../../database/type'
import { MessageCenter } from '../../../utils/messages'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { Person } from '../../../database'
import { getCurrentNetworkWorkerService } from '../../background-script/WorkerService'
import getCurrentNetworkWorker from '../../../social-network/utils/getCurrentNetworkWorker'

enum WelcomeState {
    // Step 0
    Start,
    // Step 1
    SelectIdentity,
    DidntFindAccount,
    Intro,
    BackupKey,
    ProvePost,
    RestoreKeypair,
    // End
    End,
}

const WelcomeActions = {
    backupMyKeyPair(whoAmI: PersonIdentifier) {
        return Services.Welcome.backupMyKeyPair(whoAmI)
    },
    restoreFromFile(file: File | string, id: PersonIdentifier) {
        if (typeof file === 'string') {
            Services.People.restoreBackup(JSON.parse(file as string), id)
        } else {
            const fr = new FileReader()
            fr.readAsText(file)
            fr.addEventListener('loadend', async f => {
                const json = JSON.parse(fr.result as string)
                Services.People.restoreBackup(json, id)
            })
        }
    },
    autoVerifyBio(network: PersonIdentifier, provePost: string) {
        getCurrentNetworkWorkerService(network).autoVerifyBio(network, provePost)
    },
    autoVerifyPost(network: PersonIdentifier, provePost: string) {
        getCurrentNetworkWorkerService(network).autoVerifyPost(network, provePost)
    },
    manualVerifyBio(user: PersonIdentifier, prove: string) {
        this.autoVerifyBio(user, prove)
    },
}
interface Welcome {
    whoAmI: Person
    // Display
    provePost: string
    currentStep: WelcomeState
    personHintFromSearch: Person
    currentIdentities: Person[]
    // Actions
    onStepChange(state: WelcomeState): void
    onSelectIdentity(person: Person): void
    onFinish(reason: 'done' | 'quit'): void
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
        case WelcomeState.Start:
            return (
                <Welcome0
                    create={() => onStepChange(WelcomeState.SelectIdentity)}
                    restore={() => onStepChange(WelcomeState.RestoreKeypair)}
                    close={() => onFinish('quit')}
                />
            )
        case WelcomeState.SelectIdentity:
            return (
                <Welcome1a1a
                    back={() => onStepChange(WelcomeState.Start)}
                    didntFindAccount={() => onStepChange(WelcomeState.DidntFindAccount)}
                    next={selected => {
                        onSelectIdentity(selected)
                        onStepChange(WelcomeState.Intro)
                    }}
                    identities={currentIdentitiesFiltered}
                />
            )
        case WelcomeState.DidntFindAccount:
            return (
                <Welcome1a1b
                    useExistingAccounts={() => onStepChange(WelcomeState.SelectIdentity)}
                    back={() => onStepChange(WelcomeState.Start)}
                />
            )
        case WelcomeState.Intro:
            return (
                <Welcome1a2
                    back={() => onStepChange(WelcomeState.Start)}
                    next={() => onStepChange(WelcomeState.BackupKey)}
                />
            )
        case WelcomeState.BackupKey:
            sideEffects.backupMyKeyPair(props.whoAmI.identifier)
            return <Welcome1a3 next={() => onStepChange(WelcomeState.ProvePost)} />
        case WelcomeState.ProvePost:
            const worker = getCurrentNetworkWorker(props.whoAmI.identifier)
            return (
                <Welcome1a4v2
                    hasManual={!!worker.manualVerifyPost}
                    hasBio={!!worker.autoVerifyBio}
                    hasPost={!!worker.autoVerifyPost}
                    bioDisabled={whoAmI.identifier.isUnknown}
                    provePost={provePost}
                    requestManualVerify={() => {
                        sideEffects.manualVerifyBio(whoAmI.identifier, provePost)
                        onStepChange(WelcomeState.End)
                    }}
                    requestAutoVerify={type => {
                        if (type === 'bio') sideEffects.autoVerifyBio(whoAmI.identifier, provePost)
                        else if (type === 'post') sideEffects.autoVerifyPost(whoAmI.identifier, provePost)
                        onStepChange(WelcomeState.End)
                    }}
                />
            )
        case WelcomeState.RestoreKeypair:
            return (
                <Welcome1b1
                    back={() => onStepChange(WelcomeState.Start)}
                    restore={url => {
                        sideEffects.restoreFromFile(url, props.whoAmI.identifier)
                        onStepChange(WelcomeState.End)
                    }}
                />
            )
        case WelcomeState.End:
            return <Welcome2 close={() => onFinish('done')} />
    }
}
const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)
const provePostRef = new ValueRef('')
const personInferFromURLRef = new ValueRef<Person>({
    identifier: PersonIdentifier.unknown,
    groups: [],
})
const selectedIdRef = new ValueRef<Person>(personInferFromURLRef.value)
const ownedIdsRef = new ValueRef<Person[]>([])
const fillRefs = async () => {
    if (selectedIdRef.value.identifier.isUnknown) {
        const all = await Services.People.queryMyIdentity()
        ownedIdsRef.value = all
        if (all[0]) selectedIdRef.value = all[0]
    }
    const post = await Services.Crypto.getMyProveBio(selectedIdRef.value.identifier)
    if (post) provePostRef.value = post
}
MessageCenter.on('generateKeyPair', fillRefs)
selectedIdRef.addListener(fillRefs)
fillRefs()

export const IdentifierRefContext = React.createContext(selectedIdRef)
// Query { identifier: string; avatar: string; nickname: string }
export default withRouter(function _WelcomePortal(props: RouteComponentProps) {
    const [step, setStep] = useState(WelcomeState.Start)
    const provePost = useValueRef(provePostRef)
    const personFromURL = useValueRef(personInferFromURLRef)
    const selectedId = useValueRef(selectedIdRef)
    const ownIds = useValueRef(ownedIdsRef)

    useEffect(() => {
        const search = new URLSearchParams(props.location.search)

        const identifier = search.get('identifier') || ''
        const avatar = search.get('avatar') || ''
        const nickname = search.get('nickname') || ''
        const id = Identifier.fromString(identifier)
        if (id && id.equals(selectedId.identifier)) return

        if (id instanceof PersonIdentifier) {
            if (id.isUnknown) return
            Services.People.queryMyIdentity(id).then(([inDB = {} as Person]) => {
                const person = (personInferFromURLRef.value = {
                    identifier: id,
                    nickname: nickname || inDB.nickname,
                    avatar: avatar || inDB.avatar,
                    groups: [],
                })
                Services.People.updatePersonInfo(person.identifier, {
                    nickname: person.nickname,
                    avatarURL: person.avatar,
                })
                setStep(WelcomeState.SelectIdentity)
            })
        }
    }, [props.location.search])

    return (
        <ResponsiveDialog open>
            <IdentifierRefContext.Provider value={selectedIdRef}>
                <Welcome
                    provePost={provePost}
                    currentStep={step}
                    sideEffects={WelcomeActions}
                    onStepChange={setStep}
                    whoAmI={selectedId}
                    currentIdentities={ownIds}
                    personHintFromSearch={personFromURL}
                    onSelectIdentity={p => (selectedIdRef.value = p)}
                    onFinish={() => props.history.replace('/')}
                />
            </IdentifierRefContext.Provider>
        </ResponsiveDialog>
    )
})
//#endregion
