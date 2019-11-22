import { defineSocialNetworkUI } from '../../../social-network/ui'
import { sharedSettings } from '../index'
import { shouldDisplayWelcomeDefault } from '../../../social-network/defaults/shouldDisplayWelcome'
import { InitFriendsValueRef } from '../../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../../social-network/defaults/MyIdentitiesRef'
import { setStorage } from '../../../utils/browser.storage'
import { twitterUITasks } from './tasks'
import { twitterUIFetch } from './fetch'
import { twitterUIInjections } from './inject'
import { InitGroupsValueRef } from '../../../social-network/defaults/GroupsValueRef'
import { twitterUrl } from '../utils/url'
import React from 'react'
import { createMuiTheme } from '@material-ui/core'
import { MaskbookDarkTheme } from '../../../utils/theme'

export const instanceOfTwitterUI = defineSocialNetworkUI({
    ...sharedSettings,
    ...twitterUITasks,
    ...twitterUIInjections,
    ...twitterUIFetch,
    init: (env, pref) => {
        sharedSettings.init(env, pref)
        InitFriendsValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier)
        InitGroupsValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier)
        InitMyIdentitiesValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier)
    },
    shouldActivate(location: Location | URL = globalThis.location) {
        return location.hostname.endsWith(twitterUrl.hostIdentifier)
    },
    friendlyName: 'Twitter (Insider Preview)',
    setupAccount: () => {
        browser.permissions
            .request({
                origins: [`${twitterUrl.hostLeadingUrl}/*`, `${twitterUrl.hostLeadingUrlMobile}/*`],
            })
            .then(granted => {
                if (granted) {
                    setStorage(twitterUrl.hostIdentifier, { forceDisplayWelcome: true }).then()
                    location.href = twitterUrl.hostLeadingUrl
                }
            })
    },
    ignoreSetupAccount() {
        setStorage(twitterUrl.hostIdentifier, { userIgnoredWelcome: true, forceDisplayWelcome: false }).then()
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault,
    useColorScheme() {
        const [currentScheme, setScheme] = React.useState<'light' | 'dark'>('light')
        React.useLayoutEffect(() => {
            const id = setInterval(() => setScheme(isDarkMode()), 2000)
            return () => clearInterval(id)
        })
        return currentScheme
    },
    darkTheme: createMuiTheme({
        ...MaskbookDarkTheme,
        palette: {
            ...MaskbookDarkTheme.palette,
            background: {
                ...MaskbookDarkTheme.palette.background,
                get paper() {
                    return `rgb(${getBackgroundColor().join(',')})`
                },
            },
        },
    }),
})

function isDarkMode(): 'dark' | 'light' {
    const [r, g, b] = getBackgroundColor()
    if (r < 68 && g < 68 && b < 68) return 'dark'
    return 'light'
}

function getBackgroundColor(): [number, number, number] {
    const background = String(
        // @ts-ignore CSSOM
        document.body?.computedStyleMap?.()?.get?.('background-color') ??
            // Old CSSOM
            document.body.style.backgroundColor,
    )
    const match = background.match(/rgb\((\d+?), +(\d+?), +(\d+?)\)/)
    if (match) {
        const [_, r, g, b] = match
        const nr = parseInt(r)
        const ng = parseInt(g)
        const nb = parseInt(b)
        return [nr, ng, nb]
    }
    return [255, 255, 255]
}
