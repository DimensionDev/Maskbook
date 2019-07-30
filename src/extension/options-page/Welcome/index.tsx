import React, { useState, useEffect } from 'react'
import Welcome0 from '../../../components/Welcomes/0'
import Welcome1a2 from '../../../components/Welcomes/1a2'
import Welcome1a3 from '../../../components/Welcomes/1a3'
import Welcome1a4v2 from '../../../components/Welcomes/1a4.v2'
import Welcome1b1 from '../../../components/Welcomes/1b1'
import Welcome2 from '../../../components/Welcomes/2'
import Services from '../../service'
import tasks from '../../content-script/tasks'
import { RouteComponentProps, withRouter } from 'react-router'
import { getProfilePageUrlAtFacebook } from '../../../social-network/facebook.com/parse-username'
import { geti18nString } from '../../../utils/i18n'
import { Dialog, withMobileDialog } from '@material-ui/core'
import { Identifier, PersonIdentifier } from '../../../database/type'
import { MessageCenter } from '../../../utils/messages'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { makeStyles } from '@material-ui/core'

//#region Welcome
enum WelcomeState {
    // Step 0
    Start,
    // Step 1
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
    autoVerifyBio(user: PersonIdentifier, prove: string) {
        tasks(getProfilePageUrlAtFacebook(user), {
            active: true,
            autoClose: false,
            memorable: false,
            pinned: false,
            timeout: Infinity,
        }).pasteIntoBio(prove)
    },
    autoVerifyPost(prove: string) {
        tasks(`https://www.facebook.com/`, {
            active: true,
            autoClose: false,
            memorable: false,
            pinned: false,
            timeout: Infinity,
        }).pasteIntoPostBox(prove, geti18nString('automation_request_paste_into_post_box'))
    },
    manualVerifyBio(user: PersonIdentifier, prove: string) {
        this.autoVerifyBio(user, prove)
    },
    onFinish(reason: 'quit' | 'done') {
        location.hash = ''
    },
}
interface Welcome {
    // Display
    provePost: string
    currentStep: WelcomeState
    onStepChange(state: WelcomeState): void
    identity: PersonIdentifier
    // Actions
    onFinish(reason: 'done' | 'quit'): void
    sideEffects: typeof WelcomeActions
}
function Welcome(props: Welcome) {
    const { currentStep, onFinish, onStepChange, provePost, sideEffects, identity } = props
    switch (currentStep) {
        case WelcomeState.Start:
            return (
                <Welcome0
                    create={() => onStepChange(WelcomeState.Intro)}
                    restore={() => onStepChange(WelcomeState.RestoreKeypair)}
                    close={() => onFinish('quit')}
                />
            )
        case WelcomeState.Intro:
            return <Welcome1a2 next={() => onStepChange(WelcomeState.BackupKey)} />
        case WelcomeState.BackupKey:
            sideEffects.backupMyKeyPair(props.identity)
            return <Welcome1a3 next={() => onStepChange(WelcomeState.ProvePost)} />
        case WelcomeState.ProvePost:
            return (
                <Welcome1a4v2
                    bioDisabled={identity.isUnknown}
                    provePost={provePost}
                    requestManualVerify={() => {
                        sideEffects.manualVerifyBio(identity, provePost)
                        onStepChange(WelcomeState.End)
                    }}
                    requestAutoVerify={type => {
                        if (type === 'bio') sideEffects.autoVerifyBio(identity, provePost)
                        else if (type === 'post') sideEffects.autoVerifyPost(provePost)
                        onStepChange(WelcomeState.End)
                    }}
                />
            )
        case WelcomeState.RestoreKeypair:
            return (
                <Welcome1b1
                    back={() => onStepChange(WelcomeState.Start)}
                    restore={url => {
                        sideEffects.restoreFromFile(url, props.identity)
                        onStepChange(WelcomeState.End)
                    }}
                />
            )
        case WelcomeState.End:
            return <Welcome2 />
    }
}
const ResponsiveDialog = withMobileDialog()(Dialog)
const ProvePostRef = new ValueRef('')
const IdentifierRef = new ValueRef(PersonIdentifier.unknown)
const getMyProveBio = async () => {
    if (IdentifierRef.value.isUnknown) {
        const all = await Services.People.queryMyIdentity()
        if (all[0]) IdentifierRef.value = all[0].identifier
    }
    const post = await Services.Crypto.getMyProveBio(IdentifierRef.value)
    if (post) ProvePostRef.value = post
}
MessageCenter.on('generateKeyPair', getMyProveBio)
IdentifierRef.addListener(getMyProveBio)
getMyProveBio()

export const IdentifierRefContext = React.createContext(IdentifierRef)
export default withRouter(function _WelcomePortal(props: RouteComponentProps<{ identifier: string }>) {
    const [step, setStep] = useState(WelcomeState.Start)
    const provePost = useValueRef(ProvePostRef)
    const identifier = useValueRef(IdentifierRef)

    useEffect(() => {
        const raw = new URLSearchParams(props.location.search).get('identifier') || ''
        const id = Identifier.fromString(raw)
        if (id && id.equals(identifier)) return
        if (id instanceof PersonIdentifier) {
            IdentifierRef.value = id
        }
    }, [props.location.search])

    return (
        <ResponsiveDialog open>
            <IdentifierRefContext.Provider value={IdentifierRef}>
                <Welcome
                    provePost={provePost}
                    currentStep={step}
                    sideEffects={WelcomeActions}
                    onStepChange={setStep}
                    onFinish={WelcomeActions.onFinish}
                    identity={identifier}
                />
            </IdentifierRefContext.Provider>
        </ResponsiveDialog>
    )
})
//#endregion
