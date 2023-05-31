import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Plugin } from '@masknet/plugin-infra'
import { Avatar } from '../../../../components/InjectedComponents/Avatar.js'
import { attachReactTreeWithContainer, startWatch } from '../../../../utils/index.js'
import { inpageAvatarSelector } from '../../utils/selector.js'
import { noop } from 'lodash-es'

export async function injectAvatar(signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(inpageAvatarSelector()).useForeach((ele) => {
            let remover = noop
            const remove = () => remover()

            const run = async () => {
                const proxy = DOMProxy({
                    afterShadowRootInit: { mode: process.env.shadowRootMode, delegatesFocus: true },
                })
                proxy.realCurrent = ele.firstChild as HTMLElement
                // create stacking context
                ele.style.position = 'relative'
                // TODO fetch userId
                const userId = ''

                const root = attachReactTreeWithContainer(proxy.afterShadow, { signal })
                root.render(
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 2,
                        }}>
                        {userId ? (
                            <Avatar userId={userId} sourceType={Plugin.SNSAdaptor.AvatarRealmSourceType.Post} />
                        ) : null}
                    </div>,
                )
                remover = root.destroy
            }

            run()
            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: remove,
            }
        }),
        signal,
    )
}
