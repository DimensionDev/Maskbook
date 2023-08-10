export * from './entry-dom.js'

export { startPluginSiteAdaptor, useActivatedPluginsSiteAdaptor, useIsMinimalMode } from './manager/site-adaptor.js'

export {
    type PostContext,
    type PostContextAuthor,
    type PostContextCoAuthor,
    type PostContextComment,
    type PostContextCreation,
    type PostContextActions,
    type PostInfo,
    PostInfoContext,
    PostInfoProvider,
    usePostInfoDetails,
    type CompositionType,
    CompositionContext,
    Widget,
    type WidgetProps,
    getProfileCardTabContent,
    getProfileTabContent,
    getSearchResultContent,
    getSearchResultTabContent,
    getSearchResultTabs,
    getSettingsTabContent,
    getSearchResultContentForProfileTab,
    useAllPersonas,
    useCompositionContext,
    useCurrentPersonaInformation,
    useCurrentVisitingIdentity,
    useCurrentVisitingSocialIdentity,
    useLastRecognizedIdentity,
    useLastRecognizedSocialIdentity,
    usePostLink,
    useSocialIdentity,
    useThemeColor,
    useSiteThemeMode,
    useThemeMode,
    useThemeSettings,
    useThemeSize,
    useSocialIdentityByUserId,
} from './site-adaptor/index.js'

export { getBackgroundColor, isDark, toRGB, fromRGB, shade } from './utils/theme/color-tools.js'
