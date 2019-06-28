if (process.env.NODE_ENV === 'development') {
    require('react-devtools')
}

import './injections/Welcome' // ? Inject welcome
import './injections/PostBox' // ? Inject postbox
import './injections/Posts' // ? Inject all posts
import './injections/ProfilePage' // ? Inject to ProfilePage
import './tasks' // ? AutomatedTabTask Run tasks when invoked by background page

import * as HoloflowsKit from '@holoflows/kit'
Object.assign(window, HoloflowsKit)

navigator.clipboard.writeText = async (data: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = data
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
}
