import { ProfileIdentifier } from '@masknet/shared-base'
import { Twitter } from '@masknet/web3-providers'
import { throttle } from 'lodash-unified'
import { CSSProperties, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { ProfileCard } from '../../../../components/InjectedComponents/ProfileCard'
import { createReactRootShadowed } from '../../../../utils'
import { twitterBase } from '../../base'

export function injectProfileCardHolder(signal: AbortSignal) {
    const root = document.createElement('div')
    root.attachShadow({ mode: 'open' })
    document.body.appendChild(root)
    if (!root.shadowRoot) {
        throw new Error('Can not inject a holder for ProfileCard')
    }
    createReactRootShadowed(root.shadowRoot, { signal }).render(<ProfileCardHolder />)
}

const TESTID_PREFIX = 'UserAvatar-Container-'
function ProfileCardHolder() {
    const [style, setStyle] = useState<CSSProperties>({
        visibility: 'hidden',
        position: 'absolute',
        height: 300,
        width: 450,
        boxShadow: '0 0 10px rgba(100,100,100,0.1)',
        border: '1px solid #eee',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
    })
    const { activeRef, targetRef: holderRef } = useTargetActiveRef()
    const [twitterId, setTwitterId] = useState('')

    console.log('ProfileCard holder', holderRef.current)
    useEffect(() => {
        const hide = () => {
            setStyle((old) => {
                if (old.visibility === 'hidden' || activeRef.current) return old
                console.log('ProfileCard activeRef', activeRef.current)
                setTwitterId('')
                return { ...old, visibility: 'hidden' }
            })
        }
        const mousemoveHandler = throttle((evt: DocumentEventMap['mousemove']) => {
            if (!(evt.target instanceof HTMLElement)) return hide()
            const avatarContainer = evt.target.closest<HTMLDivElement>(`[data-testid^="${TESTID_PREFIX}"]`)
            if (!avatarContainer) return hide()
            const testid = avatarContainer.dataset.testid ?? ''
            // if `testid` is empty, we are resetting it.
            setTwitterId(testid.slice(TESTID_PREFIX.length))

            const boundingRect = avatarContainer.getBoundingClientRect()
            const left = holderRef.current?.clientWidth ? boundingRect.left + 180 : boundingRect.left
            const top = boundingRect.top + boundingRect.height + 10 + (document.scrollingElement?.scrollTop || 0)
            setStyle((old) => {
                if (old.visibility === 'visible' && old.left === left && old.top === top) return old
                return {
                    ...old,
                    visibility: 'visible',
                    left,
                    top,
                }
            })
            console.log(evt)
        }, 200)
        document.addEventListener('mousemove', mousemoveHandler)
        return () => {
            document.removeEventListener('mousemove', mousemoveHandler)
        }
    }, [])

    console.log('twitterId', twitterId)
    const { value: identity, loading } = useAsync(async () => {
        if (!twitterId) return null
        const user = await Twitter.getUserByScreenName(twitterId)
        if (!user?.legacy) return null

        const nickname = user.legacy.name
        const handle = user.legacy.screen_name
        const avatar = user.legacy.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1')
        const bio = user.legacy.description
        const homepage = user.legacy.entities.url?.urls[0]?.expanded_url ?? ''

        return {
            identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname,
            avatar,
            bio,
            homepage,
        }
    }, [twitterId])

    return (
        <div style={style} ref={holderRef}>
            profile card holder
            <div>{identity?.nickname}</div>
            <div>{identity?.homepage}</div>
            {loading ? <span>loading</span> : identity ? <ProfileCard identity={identity} /> : null}
        </div>
    )
}

function useTargetActiveRef() {
    const activeRef = useRef(false)
    const targetRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!targetRef.current) return
        const enter = () => {
            activeRef.current = true
            console.log('ProfileCard enter')
        }
        const leave = () => {
            activeRef.current = false
        }
        targetRef.current.addEventListener('mouseenter', enter)
        targetRef.current.addEventListener('mouseleave', leave)
        return () => {
            targetRef.current?.removeEventListener('mouseenter', enter)
            targetRef.current?.removeEventListener('mouseleave', leave)
        }
    }, [])

    return {
        targetRef,
        activeRef,
    }
}
