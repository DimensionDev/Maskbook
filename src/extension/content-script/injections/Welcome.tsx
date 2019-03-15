import React from 'react'
import ReactDOM from 'react-dom'
import { DomProxy } from '@holoflows/kit'
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
import {
    CryptoKeyRecord,
    getMyPrivateKey,
    toStoreCryptoKey,
    toReadCryptoKey,
    storeKey,
} from '../../../key-management/db'
import { BackgroundService, CryptoService } from '../rpc'
const isLogined = () => !document.querySelector('.login_form_label_field')
const loginWatcher = async () => {
    while (!isLogined()) await sleep(500)
}
function restoreFromFile(file: File) {
    const fr = new FileReader()
    fr.readAsText(file)
    fr.addEventListener('loadend', async f => {
        const json = JSON.parse(fr.result as string)
        const key = await toReadCryptoKey(json)
        await storeKey(key)
        console.log('Keypair restored.', key)
    })
}
function Welcome(props: {
    current: WelcomeState
    setCurrent(x: WelcomeState): void
    waitLogin(): void
    finish(): void
}) {
    const { current, setCurrent, waitLogin } = props
    const [provePost, setProvePost] = React.useState('')
    const [keyPair, setKeyPair] = React.useState<CryptoKeyRecord>(undefined as any)
    useAsync(() => CryptoService.getMyProvePost(), [provePost.length !== 0]).then(setProvePost)
    useAsync(() => getMyPrivateKey(), [!!keyPair, !!provePost]).then(
        async kp => setKeyPair(await toStoreCryptoKey(kp!)),
        () => setKeyPair(undefined as any),
    )
    switch (current) {
        case WelcomeState.Start:
            return (
                <Welcome0
                    create={() => setCurrent(isLogined() ? WelcomeState.Intro : WelcomeState.WaitLogin)}
                    restore={() => setCurrent(WelcomeState.Restore1)}
                />
            )
        case WelcomeState.WaitLogin:
            return <Welcome1a1 next={() => (waitLogin(), setCurrent(WelcomeState.Intro))} />
        case WelcomeState.Intro:
            return (
                <Welcome1a2
                    next={() => {
                        setCurrent(WelcomeState.BackupKey)
                        BackgroundService.backupMyKeyPair(keyPair)
                    }}
                />
            )
        case WelcomeState.BackupKey:
            return <Welcome1a3 next={() => setCurrent(WelcomeState.ProvePost)} />
        case WelcomeState.ProvePost:
            return (
                <Welcome1a4
                    provePost={provePost}
                    copyToClipboard={() => {
                        ;(navigator as any).clipboard.writeText(provePost)
                        props.finish()
                    }}
                />
            )
        case WelcomeState.Restore1:
            return (
                <Welcome1b1
                    back={() => setCurrent(WelcomeState.Start)}
                    restore={url => {
                        props.finish()
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
    const [current, setCurrent] = React.useState(WelcomeState.Start)
    const [init, setInit] = React.useState(true)
    function waitLogin() {
        setOpen(false)
        loginWatcher().then(() => setOpen(true))
    }
    useAsync(() => getStorage(), [0]).then(data => setInit(data.init))
    // Only render in main page
    if (location.pathname === '/') return null
    if (init && !chrome.extension.inIncognitoContext) return null
    return (
        <MuiThemeProvider theme={MaskbookLightTheme}>
            <Dialog open={open}>
                <Welcome
                    current={current}
                    setCurrent={setCurrent}
                    waitLogin={waitLogin}
                    finish={() => {
                        setOpen(false)
                        chrome.storage.local.set({ init: true })
                    }}
                />
            </Dialog>
        </MuiThemeProvider>
    )
}
