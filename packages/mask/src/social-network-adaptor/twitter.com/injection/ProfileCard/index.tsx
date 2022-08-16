import { CrossIsolationMessages, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
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

const CARD_WIDTH = 450
const CARD_HEIGHT = 500
const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: theme.palette.background.default,
        boxShadow: theme.palette.mode === 'light' ? '0px 4px 30px rgba(0, 0, 0, 0.1)' : undefined,
    },
}))

function ProfileCardHolder() {
    const { classes } = useStyles()
    const [style, setStyle] = useState<CSSProperties>({
        visibility: 'hidden',
        border: '1px solid #eee',
        borderRadius: 10,
    })
    const holderRef = useRef<HTMLDivElement>(null)
    const [twitterId, setTwitterId] = useState('')

    useEffect(() => {
        return CrossIsolationMessages.events.requestOpenProfileCard.on(({ userId, x, y }) => {
            setTwitterId(userId)
            setStyle((old) => {
                const { visibility, left, top } = old
                if (visibility === 'visible' && left === x && top === y) return old
                return {
                    ...old,
                    visibility: 'visible',
                    left: x - CARD_WIDTH / 2,
                    top: y,
                }
            })
        })
    }, [])

    useEffect(() => {
        document.body.addEventListener('click', (event) => {
            // @ts-ignore
            // event.target doesn't work for Shadow DOM
            const element = event.path[0]
            if (!(element instanceof HTMLElement) || !holderRef.current) return
            if (!holderRef.current.contains(element)) {
                setStyle((old) => {
                    if (old.visibility === 'hidden') return old
                    return {
                        ...old,
                        visibility: 'hidden',
                    }
                })
            }
            console.log('avatar click', event)
        })
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
        <div className={classes.root} style={style} ref={holderRef}>
            profile card holder
            <div>{identity?.nickname}</div>
            <div>{identity?.homepage}</div>
            <div>{identity?.identifier?.userId}</div>
            {loading ? <span>loading</span> : identity ? <ProfileCard identity={identity} /> : null}
        </div>
    )
}
