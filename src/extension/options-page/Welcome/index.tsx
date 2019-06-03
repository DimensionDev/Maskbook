import React, { useState, useEffect } from 'react'
import Welcome0 from '../../../components/Welcomes/0'
import Welcome1a2 from '../../../components/Welcomes/1a2'
import Welcome1a3 from '../../../components/Welcomes/1a3'
import Welcome1a4v2 from '../../../components/Welcomes/1a4.v2'
import Welcome1b1 from '../../../components/Welcomes/1b1'
import Welcome2 from '../../../components/Welcomes/2'
import { useAsync } from '../../../utils/components/AsyncComponent'
import Services from '../../service'
import tasks from '../../content-script/tasks'
import { RouteComponentProps, withRouter } from 'react-router'
import { getProfilePageUrlAtFacebook } from '../../../utils/type-transform/Username'
import { setStorage, LATEST_WELCOME_VERSION } from '../../../components/Welcomes/WelcomeVersion'
import { geti18nString } from '../../../utils/i18n'
import { Dialog } from '@material-ui/core'
import { Identifier, PersonIdentifier } from '../../../database/type'

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
    backupMyKeyPair() {
        return Services.Welcome.backupMyKeyPair()
    },
    restoreFromFile(file: File, id: PersonIdentifier) {
        const fr = new FileReader()
        fr.readAsText(file)
        fr.addEventListener('loadend', async f => {
            const json = JSON.parse(fr.result as string)
            Services.People.restoreBackup(json, id)
        })
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
        if (reason === 'done') setStorage({ init: LATEST_WELCOME_VERSION })
        window.close()
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
    const { currentStep, onFinish, onStepChange, provePost, sideEffects, identity: username } = props
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
            sideEffects.backupMyKeyPair()
            return <Welcome1a3 next={() => onStepChange(WelcomeState.ProvePost)} />
        case WelcomeState.ProvePost:
            return (
                <Welcome1a4v2
                    bioDisabled={!username}
                    provePost={provePost}
                    requestManualVerify={() => {
                        sideEffects.manualVerifyBio(username, provePost)
                        onStepChange(WelcomeState.End)
                    }}
                    requestAutoVerify={type => {
                        if (type === 'bio') sideEffects.autoVerifyBio(username, provePost)
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
// TODO: Update the router
export default withRouter(function _WelcomePortal(props: RouteComponentProps<{ identifier: string }>) {
    const [step, setStep] = useState(WelcomeState.Start)

    const [provePost, setProvePost] = useState('')

    const [identifier, setIdentifier] = useState<PersonIdentifier>()
    useEffect(() => {
        const raw = new URLSearchParams(props.location.search).get('username') || ''
        const id = Identifier.fromString(raw)
        if (id && id instanceof PersonIdentifier) {
            setIdentifier(id)
        }
        // TODO: Let user select a existing identity when re-welcome.
        useAsync(() => {
            if (id && id instanceof PersonIdentifier) {
                return Services.Crypto.getMyProveBio(id)
            }
            return Promise.resolve(null)
        }, [raw]).then(provePost => provePost && setProvePost(provePost))
    }, [props.location.search])
    // TODO: Remove this
    if (!identifier) return <>Waiting for identity...</>
    return (
        <Dialog open>
            <Welcome
                provePost={provePost}
                currentStep={step}
                sideEffects={WelcomeActions}
                onStepChange={setStep}
                onFinish={WelcomeActions.onFinish}
                identity={identifier}
            />
        </Dialog>
    )
})
//#endregion
