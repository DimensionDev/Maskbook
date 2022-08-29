import { CrossIsolationMessages, EMPTY_OBJECT, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import { CircularProgress } from '@mui/material'
import { CSSProperties, useEffect, useRef, useState } from 'react'
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
    const holderRef = useRef<HTMLDivElement>(null)
    const [twitterId, setTwitterId] = useState('')

    useEffect(() => {
        return CrossIsolationMessages.events.requestOpenProfileCard.on(({ userId, x, y }) => {
            setTwitterId(userId)
            setStyle((old) => {
                const newLeft = x - CARD_WIDTH / 2
                const newTop = y
                const { visibility, left, top } = old
                if (visibility === 'visible' && left === newLeft && top === newTop) return old
                return {
                    ...old,
                    visibility: 'visible',
                    left: newLeft,
                    top: newTop,
                }
            })
        })
    }, [])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            // @ts-ignore
            // `NODE.contains(other)` doesn't work for cross multiple layer of Shadow DOM
            if (!event.path?.includes(holderRef.current)) {
                setStyle((old) => {
                    if (old.visibility === 'hidden') return old
                    return {
                        ...old,
                        visibility: 'hidden',
                    }
                })
            }
        }
        document.body.addEventListener('click', onClick)
        return () => {
            document.body.removeEventListener('click', onClick)
        }
    }, [])

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
