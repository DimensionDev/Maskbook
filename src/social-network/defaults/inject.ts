import { injectCommentBoxDefaultFactory } from './injectCommentBox'
import { injectPostCommentsDefault } from './injectComments'

export const defaultUIInject = {
    injectCommentBox: injectCommentBoxDefaultFactory(),
    injectPostComments: injectPostCommentsDefault(),
}
