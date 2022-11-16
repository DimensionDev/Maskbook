import { useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { CrossIsolationMessages, ProfileIdentifier } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import type { SocialIdentity } from '@masknet/web3-shared-base'
import { useSocialIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { ProfileCard } from '../../../../components/InjectedComponents/ProfileCard/index.js'
import { attachReactTreeWithoutContainer } from '../../../../utils/index.js'
import { twitterBase } from '../../base.js'
import { CARD_HEIGHT, CARD_WIDTH } from './constants.js'
import { useControlProfileCard } from './useControlProfileCard.js'

export function injectProfileCardHolder(signal: AbortSignal) {
    attachReactTreeWithoutContainer('profile-card', <ProfileCardHolder />, signal)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
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
    const holderRef = useRef<HTMLDivElement>(null)
    const [twitterId, setTwitterId] = useState('')

    const style = useControlProfileCard(holderRef)

    useEffect(() => {
        return CrossIsolationMessages.events.profileCardEvent.on((event) => {
            if (!event.open) return
            setTwitterId(event.userId)
        })
    }, [])

    const { value: identity, loading } = useAsync(async (): Promise<SocialIdentity | null> => {
        if (!twitterId) return null

        const user = await Twitter.getUserByScreenName(twitterId)
        if (!user?.legacy) return null

        const userId = user.legacy.id_str
        const handle = user.legacy.screen_name

        return {
            identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
            /* cspell:disable-next-line */
            isOwner: !!(userId && document.cookie.includes(escape(`twid=u=${userId}`))),
            nickname: user.legacy.name,
            avatar: user.legacy.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1'),
            bio: user.legacy.description,
            homepage: user.legacy.entities.url?.urls[0]?.expanded_url ?? '',
        }
    }, [twitterId])

    const { value: resolvedIdentity, loading: resolving } = useSocialIdentity(identity)

    return (
        <div className={classes.root} style={style} ref={holderRef}>
            {loading || resolving ? (
                <div className={classes.loading}>
                    <LoadingBase size={36} />
                </div>
            ) : resolvedIdentity ? (
                <ProfileCard identity={resolvedIdentity} />
            ) : null}
        </div>
    )
}
