import { CrossIsolationMessages, EMPTY_OBJECT, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import { CircularProgress } from '@mui/material'
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { useSocialIdentity } from '../../../../components/DataSource/useActivatedUI'
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
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.palette.mode === 'light' ? '0px 4px 30px rgba(0, 0, 0, 0.1)' : undefined,
        borderRadius: theme.spacing(1.5),
        overflow: 'hidden',
    },
    loading: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

function ProfileCardHolder() {
    const { classes } = useStyles()
    const [style, setStyle] = useState<CSSProperties>({
        visibility: 'hidden',
        borderRadius: 10,
    })
    const activeRef = useRef(false)
    const holderRef = useRef<HTMLDivElement>(null)
    const closeTimerRef = useRef<NodeJS.Timeout>()
    const [twitterId, setTwitterId] = useState('')

    const hideProfileCard = useCallback(() => {
        if (activeRef.current) return
        setStyle((old) => {
            if (old.visibility === 'hidden') return old
            return {
                ...old,
                visibility: 'hidden',
            }
        })
    }, [])

    const showProfileCard = useCallback((patchStyle: CSSProperties) => {
        clearTimeout(closeTimerRef.current)
        setStyle((old) => {
            const { visibility, left, top } = old
            if (visibility === 'visible' && left === patchStyle.left && top === patchStyle.top) return old
            return { ...old, ...patchStyle, visibility: 'visible' }
        })
    }, [])

    useEffect(() => {
        const holder = holderRef.current
        if (!holder) return
        const enter = () => {
            activeRef.current = true
            clearTimeout(closeTimerRef.current)
        }
        const leave = () => {
            activeRef.current = false
            clearTimeout(closeTimerRef.current)
            closeTimerRef.current = setTimeout(hideProfileCard, 2000)
        }
        holder.addEventListener('mouseenter', enter)
        holder.addEventListener('mouseleave', leave)
        return () => {
            holder.removeEventListener('mouseenter', enter)
            holder.removeEventListener('mouseleave', leave)
        }
    }, [hideProfileCard])

    useEffect(() => {
        return CrossIsolationMessages.events.requestProfileCard.on((event) => {
            if (!event.open) {
                hideProfileCard()
                return
            }
            const { userId, badgeBounding: bounding } = event
            setTwitterId(userId)
            const reachedBottomBoundary = bounding.top + bounding.height + CARD_HEIGHT > window.innerHeight
            const reachedLeftBoundary = bounding.left - CARD_WIDTH / 2 < 0
            const pageOffset = document.scrollingElement?.scrollTop || 0
            const x = reachedLeftBoundary ? 0 : bounding.left + bounding.width / 2 - CARD_WIDTH / 2
            const y = reachedBottomBoundary ? bounding.top - CARD_HEIGHT : bounding.top + bounding.height

            const newLeft = x
            const newTop = y + pageOffset
            showProfileCard({
                left: newLeft,
                top: newTop,
            })
        })
    }, [hideProfileCard, showProfileCard])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            // @ts-ignore
            // `NODE.contains(other)` doesn't work for cross multiple layer of Shadow DOM
            if (!event.path?.includes(holderRef.current)) {
                hideProfileCard()
            }
        }
        document.body.addEventListener('click', onClick)
        return () => {
            document.body.removeEventListener('click', onClick)
        }
    }, [hideProfileCard])

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

    const { value: resolvedIdentity, loading: resolving } = useSocialIdentity(identity ?? EMPTY_OBJECT)

    return (
        <div className={classes.root} style={style} ref={holderRef}>
            {loading || resolving ? (
                <div className={classes.loading}>
                    <CircularProgress size={36} />
                </div>
            ) : resolvedIdentity ? (
                <ProfileCard identity={resolvedIdentity} />
            ) : null}
        </div>
    )
}
