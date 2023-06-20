export * from './entry-dom.js'

export {
    startPluginSNSAdaptor,
    useActivatedPluginSNSAdaptor,
    useActivatedPluginSNSAdaptor_Web3Supported,
    useActivatedPluginsSNSAdaptor,
    useIsMinimalMode,
} from './manager/sns-adaptor.js'

export {
    type PostContext,
    type PostContextAuthor,
    type PostContextCoAuthor,
    type PostContextComment,
    type PostContextCreation,
    type PostContextSNSActions,
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
    useSNSThemeMode,
    useThemeMode,
    useThemeSettings,
    useThemeSize,
} from './sns-adaptor/index.js'

export { getBackgroundColor, isDark, toRGB, fromRGB, shade } from './utils/theme/color-tools.js'
