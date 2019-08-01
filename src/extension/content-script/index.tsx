import './injections/Posts' // ? Inject all posts
import './tasks' // ? AutomatedTabTask Run tasks when invoked by background page

import * as HoloflowsKit from '@holoflows/kit'
Object.assign(window, HoloflowsKit)
