import type { Manifest } from 'webextension-polyfill'

export const CanRequestDynamically: Manifest.OptionalPermission[] = [
    'clipboardRead',
    'clipboardWrite',
    'notifications',
    'webRequestBlocking',
]

export const XOAuthRequestOrigins: string[] = [
    // In order to send API request without CORS limit
    'https://api.twitter.com/*',
    // In order to run content script on it
    'https://firefly.social/api/mask/delegate-x-token',
    'https://firefly.social/api/auth/callback/twitter',
]
