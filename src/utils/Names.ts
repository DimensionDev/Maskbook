export const BackgroundName = 'background'
export const CryptoName = 'crypto'
export const FriendServiceName = 'friends'
/** Just a random one. Never mind. */
export const CustomPasteEventId = '6fea93e2-1ce4-442f-b2f9-abaf4ff0ce64'

/**
 * Get reference of file in both chrome extension and storybook
 */
export function getUrl(path: string, fallback: string = '') {
    if (typeof chrome === 'object' && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL(path)
    }
    return fallback || path
}
