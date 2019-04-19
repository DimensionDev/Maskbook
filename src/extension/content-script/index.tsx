import 'construct-style-sheets-polyfill'
import './injections/Welcome' // ? Inject welcome
import './injections/PostBox' // ? Inject postbox
import './injections/Posts' // ? Inject all posts
import './injections/ProfilePage' // ? Inject to ProfilePage
import './tasks' // ? AutomatedTabTask Run tasks when invoked by background page

import * as hk from '@holoflows/kit'
Object.assign(window, hk)
