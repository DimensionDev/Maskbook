export * from './entry-dom.js'

export {
    startPluginSiteAdaptor,
    useActivatedPluginsSiteAdaptor,
    useActivatedPluginSiteAdaptor,
    useIsMinimalMode,
} from './manager/site-adaptor.js'

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
    useSiteThemeMode,
    useSocialIdentityByUserId,
    __setSiteAdaptorContext__,
} from './site-adaptor/index.js'

export { getBackgroundColor, isDark, toRGB, fromRGB, shade } from './utils/theme/color-tools.js'
