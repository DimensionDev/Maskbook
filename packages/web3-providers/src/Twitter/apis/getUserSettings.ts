import { hexToRgb } from '@mui/material'
import { getObjectStore } from './getObjectStore.js'
import { TwitterBaseAPI } from '../../entry-types.js'

/* cspell:disable-next-line */
const STORE_NAME = 'keyvaluepairs'
/* cspell:disable-next-line */
const KEY_NAME = 'device:rweb.settings'

export async function getUserSettings() {
    const store = await getObjectStore(STORE_NAME)
    const query = store.get(KEY_NAME)

    return new Promise<TwitterBaseAPI.UserSettings | undefined>((resolve, reject) => {
        query.addEventListener('success', (event) => {
            if (!event.target) reject('Failed to get user settings.')

            const event_ = event as unknown as TwitterBaseAPI.Event<
                | {
                      local: TwitterBaseAPI.UserSettings
                  }
                | undefined
            >

            resolve(event_.target.result?.local)
        })
        query.addEventListener('error', (error) => {
            reject(error)
        })
    })
}

export function getDefaultUserSettings(): TwitterBaseAPI.UserSettings {
    return {
        scale: TwitterBaseAPI.Scale.Normal,
        themeBackground: TwitterBaseAPI.ThemeMode.Light,
        themeColor: TwitterBaseAPI.ThemeColor.Blue,
    }
}

export function getComputedUserSettings(): TwitterBaseAPI.UserSettings {
    const getThemeBackground = () => {
        const { backgroundColor } = getComputedStyle(document.body)
        const rgb = backgroundColor.startsWith('#') ? hexToRgb(backgroundColor) : backgroundColor

        switch (rgb.toLowerCase()) {
            case 'rgb(255, 255, 255)':
                return TwitterBaseAPI.ThemeMode.Light
            case 'rgb(21, 32, 43)':
                return TwitterBaseAPI.ThemeMode.Dim
            case 'rgb(0, 0, 0)':
                return TwitterBaseAPI.ThemeMode.Dark
            default:
                return
        }
    }

    const getThemeColor = () => {
        const tweetButton = document.querySelector('a[href="/compose/post"][data-testid="SideNav_NewTweet_Button"]')
        if (!tweetButton) return

        const { backgroundColor } = getComputedStyle(tweetButton)
        const rgb = backgroundColor.startsWith('#') ? hexToRgb(backgroundColor) : backgroundColor

        switch (rgb.toLowerCase()) {
            case 'rgb(29, 155, 240)':
                return TwitterBaseAPI.ThemeColor.Blue
            case 'rgb(255, 212, 0)':
                return TwitterBaseAPI.ThemeColor.Yellow
            case 'rgb(120, 86, 255)':
                return TwitterBaseAPI.ThemeColor.Purple
            case 'rgb(249, 24, 128)':
                return TwitterBaseAPI.ThemeColor.Magenta
            case 'rgb(255, 122, 0)':
                return TwitterBaseAPI.ThemeColor.Orange
            case 'rgb(0, 186, 124)':
                return TwitterBaseAPI.ThemeColor.Green
            default:
                return
        }
    }

    return {
        themeBackground: getThemeBackground(),
        themeColor: getThemeColor(),
    }
}
