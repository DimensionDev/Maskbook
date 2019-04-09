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
type setWelcomeDisplay = (newState: boolean) => void
const setWelcomeDisplayRef = React.createRef<setWelcomeDisplay>()
const setWelcomeDisplay: setWelcomeDisplay = newState => {
    const current = setWelcomeDisplayRef.current
    if (!current) return
    current(newState)
}
{
    const body = DomProxy()
    body.realCurrent = document.body
    const WelcomePortal = React.forwardRef(_WelcomePortal)
    ReactDOM.render(<WelcomePortal ref={setWelcomeDisplayRef} />, body.after)
}

async function loginWatcher() {
    while (!isLogin()) await sleep(500)
}
function isLogin() {
    return !document.querySelector('.login_form_label_field')
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
{
    /**
     * Upgrade version from true to number.
     * Remove this after 1/1/2020
     */
    chrome.storage.local.get(items => {
        if (items.init === true) chrome.storage.local.set({ init: WelcomeVersion.A })
    })
}
interface Storage {
    init: WelcomeVersion
    userDismissedWelcomeAtVersion: WelcomeVersion
}
function getStorage() {
    return new Promise<Partial<Storage>>(resolve => chrome.storage.local.get(resolve))
}
function setStorage(item: Partial<Storage>) {
    return new Promise<void>(resolve => chrome.storage.local.set(item, resolve))
}
const enum WelcomeVersion {
    A = 1,
}
const LATEST_VERSION = WelcomeVersion.A
function _WelcomePortal(props: {}, ref: React.Ref<setWelcomeDisplay>) {
    const [step, setStep] = React.useState(WelcomeState.Start)
    const [open, setOpen] = React.useState(false)

    React.useImperativeHandle(
        ref,
        () => (newState: boolean) => {
            if (newState) setStep(WelcomeState.Start)
            setOpen(newState)
        },
        [setOpen],
    )

    const onFinish: Welcome['onFinish'] = reason => {
        setOpen(false)
        setStorage({ init: LATEST_VERSION })
    }
    function waitForLogin() {
        setOpen(false)
        loginWatcher().then(() => setOpen(true))
    }
    useEsc(onFinish.bind(null, 'quit'))
    // Only render in main page
    if (location.pathname !== '/') return null
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
            <a href="#" onClick={() => setWelcomeDisplay(true)}>
                Maskbook Setup
            </a>
        </>,
        to.firstVirtualNode.after,
    )
}
//#endregion
//#region Banner
{
    getStorage().then(({ init, userDismissedWelcomeAtVersion }) => {
        const to = new MutationObserverWatcher(
            new LiveSelector().querySelector<HTMLDivElement>('#pagelet_composer'),
        ).startWatch()
        if (userDismissedWelcomeAtVersion && userDismissedWelcomeAtVersion >= LATEST_VERSION) return
        ReactDOM.render(
            <Banner
                close={() => {
                    setWelcomeDisplay(false)
                    setStorage({ userDismissedWelcomeAtVersion: LATEST_VERSION })
                    ReactDOM.unmountComponentAtNode(to.firstVirtualNode.before)
                }}
                getStarted={() => {
                    setWelcomeDisplay(true)
                    ReactDOM.unmountComponentAtNode(to.firstVirtualNode.before)
                }}
            />,
            to.firstVirtualNode.before,
        )
    })
}
//#endregion
