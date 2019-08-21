import { defineSocialNetworkWorker } from '../../../social-network/worker'
import { sharedSettings } from '../index'
import { sharedInjectedScriptCode } from '../../util'
import { fetchPostContent, fetchProfile } from './fetch'
import { autoVerifyBio, autoVerifyPost } from './tasks'

defineSocialNetworkWorker({
    ...sharedSettings,
    injectedScript: {
        code: sharedInjectedScriptCode,
        url: [{ hostEquals: 'twitter.com' }, { hostEquals: 'mobile.twitter.com' }],
    },
    fetchPostContent,
    fetchProfile,
    autoVerifyBio,
    autoVerifyPost,
})
