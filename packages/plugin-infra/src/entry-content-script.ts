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
    PostInfoProvider,
    usePostInfo,
    usePostInfoDetails,
} from './contexts/PostContext.js'
export { CompositionContext, useCompositionContext } from './contexts/CompositionContext.js'
export { SNSAdaptorContext, useSNSAdaptorContext } from './contexts/SNSAdaptorContext.js'

// shared components
export { Widget, type WidgetProps } from './components/Widget.js'
