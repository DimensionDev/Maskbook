import React from 'react'
import ReactDOM from 'react-dom'
import { DomProxy, LiveSelector, MutationObserverWatcher, ValueRef } from '@holoflows/kit'
import Welcome0 from '../../../components/Welcomes/0'
import Welcome1a1 from '../../../components/Welcomes/1a1'
import Welcome1a2 from '../../../components/Welcomes/1a2'
import Welcome1a3 from '../../../components/Welcomes/1a3'
import Welcome1a4 from '../../../components/Welcomes/1a4'
import Welcome1b1 from '../../../components/Welcomes/1b1'
import Dialog from '@material-ui/core/Dialog'
import { MuiThemeProvider } from '@material-ui/core'
import { MaskbookLightTheme } from '../../../utils/theme'
import { sleep } from '../../../utils/utils'
import { useAsync } from '../../../utils/AsyncComponent'
import { BackgroundService, CryptoService, PeopleService } from '../rpc'
import { useEsc } from '../../../components/Welcomes/useEsc'
import { myUsername } from './LiveSelectors'
import { Banner } from '../../../components/Welcomes/Banner'

const displayOnExternal = new ValueRef(false)
//#region Welcome
enum WelcomeState {
    // Step 0
    Start,
    // Step 1
    WaitLogin,
    Intro,
    BackupKey,
    ProvePost,
    Restore1,
    // End
}
const body = DomProxy()
body.realCurrent = document.body
ReactDOM.render(<WelcomePortal />, body.after)

const isLogin = () => !document.querySelector('.login_form_label_field')
const loginWatcher = async () => {
    while (!isLogin()) await sleep(500)
}
function restoreFromFile(file: File) {
    const fr = new FileReader()
    fr.readAsText(file)
    fr.addEventListener('loadend', async f => {
        const json = JSON.parse(fr.result as string)
        PeopleService.storeKey(json)
    })
}
interface Welcome {
    // Display
    currentStep: WelcomeState
    onStepChange(state: WelcomeState): void
    // Actions
    waitForLogin(): void
    onFinish(reason: 'done' | 'quit'): void
}
function Welcome(props: Welcome) {
    const { currentStep, onFinish, onStepChange, waitForLogin } = props

    const [provePost, setProvePost] = React.useState('')
    useAsync(() => CryptoService.getMyProveBio(), [provePost.length !== 0]).then(setProvePost)

    switch (currentStep) {
        case WelcomeState.Start:
            return (
                <Welcome0
                    create={() => onStepChange(isLogin() ? WelcomeState.Intro : WelcomeState.WaitLogin)}
                    restore={() => onStepChange(WelcomeState.Restore1)}
                    close={() => onFinish('quit')}
                />
            )
        case WelcomeState.WaitLogin:
            return (
                <Welcome1a1
                    next={() => {
                        waitForLogin()
                        onStepChange(WelcomeState.Intro)
                    }}
                />
            )
        case WelcomeState.Intro:
            return <Welcome1a2 next={() => onStepChange(WelcomeState.BackupKey)} />
        case WelcomeState.BackupKey:
            BackgroundService.backupMyKeyPair()
            return <Welcome1a3 next={() => onStepChange(WelcomeState.ProvePost)} />
        case WelcomeState.ProvePost:
            return (
                <Welcome1a4
                    provePost={provePost}
                    copyToClipboard={(text, goToBio) => {
                        navigator.clipboard.writeText(text)
                        if (goToBio) {
                            const a = myUsername.evaluateOnce()[0]
                            if (a) location.href = a.href
                        }
                        onFinish('done')
                    }}
                />
            )
        case WelcomeState.Restore1:
            return (
                <Welcome1b1
                    back={() => onStepChange(WelcomeState.Start)}
                    restore={url => {
                        onFinish('done')
                        restoreFromFile(url)
                    }}
                />
            )
    }
}
function getStorage() {
    return new Promise<any>((resolve, reject) => {
        chrome.storage.local.get(resolve)
    })
}
function WelcomePortal() {
    const [open, setOpen] = React.useState(true)
    const [step, setStep] = React.useState(WelcomeState.Start)
    const [init, setInit] = React.useState(true)

    // React.useEffect()
    // React.useEffect(() => {
    //     const cb = () => {}
    //     display.onChange(cb)
    //     return () => display.onRemoveChange(cb)
    // })

    const onFinish: Welcome['onFinish'] = reason => {
        setOpen(false)
        chrome.storage.local.set({ init: true })
    }
    function waitForLogin() {
        setOpen(false)
        loginWatcher().then(() => setOpen(true))
    }
    useAsync(() => getStorage(), [0]).then(data => setInit(data.init))
    useEsc(onFinish.bind(null, 'quit'))
    // Only render in main page
    if (location.pathname !== '/') return null
    if (init) return null
    return (
        <MuiThemeProvider theme={MaskbookLightTheme}>
            <Dialog open={open}>
                <Welcome currentStep={step} onStepChange={setStep} waitForLogin={waitForLogin} onFinish={onFinish} />
            </Dialog>
        </MuiThemeProvider>
    )
}
//#endregion
//#region Welcome invoke manually
{
    const to = new MutationObserverWatcher(
        new LiveSelector().querySelectorAll<HTMLAnchorElement>('#createNav a').nth(3),
    ).startWatch()
    ReactDOM.render(
        <>
            {' · '}
            <a
                href="#"
                onClick={() => {
                    chrome.storage.local.clear()
                    location.reload()
                }}>
                Maskbook Setup
            </a>
        </>,
        to.firstVirtualNode.after,
    )
}
//#endregion
//#region Banner
{
    const to = new MutationObserverWatcher(
        new LiveSelector().querySelector<HTMLDivElement>('#pagelet_composer'),
    ).startWatch()
    ReactDOM.render(<Banner close={() => {}} getStarted={() => {}} />, to.firstVirtualNode.before)
}
//#endregion
