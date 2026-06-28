import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useFireflyFarcasterAccounts, useFireflyLensAccounts } from '@masknet/web3-hooks-base'
import { useEffect } from 'react'
import { base } from '../base.js'
import { Web3ProfileGlobalInjection } from './Web3ProfileGlobalInjection.js'
import { setupStorage } from './context.js'
import { SocialBadges } from './components/SocialBadges/Badges.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        await setupStorage(context)
    },

    GlobalInjection: Web3ProfileGlobalInjection,
    Badges: {
        ID: `${base.ID}_badges`,
        UI: {
            Content({ identity, slot, onStatusUpdate }) {
                const userId = identity?.userId

                // #region lens
                const { data: lensAccounts = EMPTY_LIST } = useFireflyLensAccounts(userId)
                // #endregion

                // #region farcaster
                const { data: farcasterAccounts = EMPTY_LIST } = useFireflyFarcasterAccounts(userId)
                // #endregion

                const disabled = !lensAccounts.length && !farcasterAccounts.length
                useEffect(() => {
                    onStatusUpdate?.(disabled)
                }, [onStatusUpdate, disabled])

                if (!lensAccounts.length && !farcasterAccounts.length) return null
                if (!userId) return null

                return (
                    <SocialBadges
                        slot={slot}
                        lensAccounts={lensAccounts}
                        farcasterAccounts={farcasterAccounts}
                        userId={userId}
                    />
                )
            },
        },
    },
}

export default site
