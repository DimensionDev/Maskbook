import './injections/Welcome' // ? Inject welcome
import './injections/PostBox' // ? Inject postbox
import './injections/Posts' // ? Inject all posts
import './injections/ProfilePage' // ? Inject to ProfilePage
import './tasks' // ? AutomatedTabTask Run tasks when invoked by background page

import * as HoloflowsKit from '@holoflows/kit'
Object.assign(window, HoloflowsKit)

// Safari does not have navigator.clipboard
if (!navigator.clipboard) Object.assign(navigator, { clipboard: {} })
navigator.clipboard.writeText = async (data: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = data
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
}
