import { EFP_APP_URL, EFP_HOSTS, RESERVED_EFP_PATHS } from '../constants.js'

const EFP_HOST_SET: ReadonlySet<string> = new Set(EFP_HOSTS)
const RESERVED_PATH_SET: ReadonlySet<string> = new Set(RESERVED_EFP_PATHS)
const ADDRESS_PATTERN = /^0x[\dA-Fa-f]{40}$/u
const LIST_PATTERN = /^[1-9]\d*$/u
const ENS_LABEL_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/u

export interface EFPProfileLink {
    user: string
    type: 'list' | 'user'
    topEight: boolean
    profileUrl: string
    imageUrl: string
    apiPath: string
}

export function parseEFPProfileLink(link: string): EFPProfileLink | null {
    const url = parseURL(link)
    if (!url) return null
    // http is accepted because X rewrites protocol-less links into http:// t.co redirect targets,
    // so EFP links resolved from t.co cards arrive with the http protocol. Every URL we emit is
    // built from the https EFP_APP_URL constant regardless of the input protocol.
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (!EFP_HOST_SET.has(url.hostname)) return null
    if (url.hash) return null

    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length !== 1) return null

    const user = safeDecodeURIComponent(segments[0])
    if (!user) return null
    if (RESERVED_PATH_SET.has(user.toLowerCase())) return null
    if (!isSupportedUser(user)) return null

    const searchParams = Array.from(url.searchParams.entries())
    const topEight = searchParams.length === 1 && searchParams[0][0] === 'topEight' && searchParams[0][1] === 'true'
    if (url.search && !topEight) return null

    const type = LIST_PATTERN.test(user) ? 'list' : 'user'
    const encodedUser = encodeURIComponent(user)
    const query = topEight ? '?topEight=true' : ''

    return {
        user,
        type,
        topEight,
        profileUrl: `${EFP_APP_URL}/${encodedUser}${query}`,
        imageUrl:
            topEight ? `${EFP_APP_URL}/api/top-eight?user=${encodedUser}` : `${EFP_APP_URL}/og?user=${encodedUser}`,
        apiPath: `/${type === 'list' ? 'lists' : 'users'}/${encodedUser}/details`,
    }
}

export function isEFPProfileLink(link: string): boolean {
    return parseEFPProfileLink(link) !== null
}

function parseURL(link: string) {
    try {
        return new URL(/^https?:\/\//u.test(link) ? link : `https://${link}`)
    } catch {
        return null
    }
}

function safeDecodeURIComponent(value: string) {
    try {
        return decodeURIComponent(value)
    } catch {
        return ''
    }
}

function isSupportedUser(user: string) {
    if (ADDRESS_PATTERN.test(user)) return true
    if (LIST_PATTERN.test(user)) return true
    const labels = user.split('.')
    if (labels.length < 2) return false
    return labels.every((label) => ENS_LABEL_PATTERN.test(label))
}
