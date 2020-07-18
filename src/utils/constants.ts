/** Just a random one. Never mind. */
export const CustomEventId = '6fea93e2-1ce4-442f-b2f9-abaf4ff0ce64'
export enum DecryptFailedReason {
    MyCryptoKeyNotFound = 'MyCryptoKeyNotFound',
}

export const is_iOSApp = process.env.target === 'safari' && process.env.architecture === 'app'
export const NotSupportWebExtensionDynamicPermissionRequesing = is_iOSApp || process.env.target === 'E2E'
export const NotSupportImagePayload = process.env.resolution === 'mobile'
/**
 * WKWebview bug
 * @see https://bugs.webkit.org/show_bug.cgi?id=177350
 */
export const HasSafariIndexedDBBug = process.env.target === 'safari'
/** In these environments, there is not a browser "tab" system that allow user to navigate. */
export const HasNoBrowserTabUI = process.env.architecture === 'app'
/** @see https://material-ui.com/components/use-media-query/#usemediaquery-query-options-matches */
export const UseMediaQueryDefaultMatches = process.env.resolution === 'mobile' ? true : undefined
/**
 * - In iOS, the ShadowDOM mode is not really safe.
 * - In test mode, there is no ShadowDOM support.
 * - In storybook, there is no need to use ShadowDOM.
 */
export const NoShadowRootSupport = is_iOSApp || process.env.NODE_ENV === 'test' || process.env.STORYBOOK
/** In E2E, prefer open shadow root so we can test it. */
export const PreferShadowRootMode = process.env.target === 'E2E' ? 'open' : 'closed'
/** Our App only support facebook currently. */
export const SupportFacebookOnly = process.env.architecture === 'app'
/** Don't inject injected script in this mode. The native will help us. */
export const SupportNativeInjectedScriptDeclaration = is_iOSApp
/** Don't show welcome in this mode. The native will help us. */
export const HasNativeWelcomeProcess = process.env.architecture === 'app'
