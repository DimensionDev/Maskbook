import { noop } from 'lodash-es'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { PostAvatar } from '../../../components/InjectedComponents/PostAvatar.js'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'

export function createPostAvatarInjector(config: injectPostAvatarConfig = {}) {
    return function injectPostActions(postInfo: PostInfo, signal: AbortSignal) {
        if (postInfo.postAvatarElement) {
            postInfo.postAvatarElement.realCurrent
            const root = createReactRootShadowed(postInfo.postAvatarElement.afterShadow, {
                key: 'post-actions',
                untilVisible: true,
                signal,
            })
            if (postInfo.postAvatarElement?.realCurrent?.parentNode) {
                const actionsContainer = postInfo.postAvatarElement.realCurrent.parentNode as HTMLDivElement
                actionsContainer.style.maxWidth = '100%'
            }
            console.log({
                href: postInfo.postAvatarElement.realCurrent?.getAttribute('href'),
                avatar: postInfo.postAvatarElement.realCurrent?.querySelector('img')?.getAttribute('src'),
            })
            root.render(
                <PostAvatar
                    href={postInfo.postAvatarElement.realCurrent?.getAttribute('href')}
                    avatar={postInfo.postAvatarElement.realCurrent?.querySelector('img')?.getAttribute('src')}
                    zipAvatar={() => config.zipAvatar?.(postInfo.postAvatarElement)}
                    unzipAvatar={() => config.unzipAvatar?.(postInfo.postAvatarElement)}
                />,
            )
            return root.destroy
        }
        return noop
    }
}

interface injectPostAvatarConfig {
    zipAvatar?(node?: DOMProxy): void
    unzipAvatar?(node?: DOMProxy): void
}
