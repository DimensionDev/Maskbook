import React from 'react'
import Welcome0 from '../../../components/Welcomes/0'
import Welcome1a2 from '../../../components/Welcomes/1a2'
import Welcome1a3 from '../../../components/Welcomes/1a3'
import Welcome1a4v2 from '../../../components/Welcomes/1a4.v2'
import Welcome1b1 from '../../../components/Welcomes/1b1'
import Welcome2 from '../../../components/Welcomes/2'
import Dialog from '@material-ui/core/Dialog'
import { useAsync } from '../../../utils/components/AsyncComponent'
import Services from '../../service'

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
    restoreFromFile(file: File) {
        const fr = new FileReader()
        fr.readAsText(file)
        fr.addEventListener('loadend', async f => {
            const json = JSON.parse(fr.result as string)
            Services.People.storeMyKey(json)
        })
    },
    autoVerifyBio(prove: string) {
        throw new Error('Not implemented')
    },
    autoVerifyPost(prove: string) {
        throw new Error('Not implemented')
    },
    manualVerifyBio(prove: string) {
        throw new Error('Not implemented')
    },
    onFinish() {
        throw new Error('Not implemented')
    },
}
interface Welcome {
    // Display
    provePost: string
    currentStep: WelcomeState
    onStepChange(state: WelcomeState): void
    // Actions
    onFinish(reason: 'done' | 'quit'): void
    sideEffects: typeof WelcomeActions
}
function Welcome(props: Welcome) {
    const { currentStep, onFinish, onStepChange, provePost, sideEffects } = props
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
                    provePost={provePost}
                    requestManualVerify={() => {
                        sideEffects.manualVerifyBio(provePost)
                        onStepChange(WelcomeState.End)
                    }}
                    requestAutoVerify={type => {
                        if (type === 'bio') sideEffects.autoVerifyBio(provePost)
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
                        sideEffects.restoreFromFile(url)
                        onStepChange(WelcomeState.End)
                    }}
                />
            )
        case WelcomeState.End:
            return <Welcome2 />
    }
}
export default function _WelcomePortal(props: {}) {
    const [step, setStep] = React.useState(WelcomeState.Start)

    const [provePost, setProvePost] = React.useState('')
    useAsync(() => Services.Crypto.getMyProveBio(), [provePost.length !== 0]).then(setProvePost)

    return (
        <Dialog open>
            <Welcome
                provePost={provePost}
                currentStep={step}
                sideEffects={WelcomeActions}
                onStepChange={setStep}
                onFinish={WelcomeActions.onFinish}
            />
        </Dialog>
    )
}
//#endregion
