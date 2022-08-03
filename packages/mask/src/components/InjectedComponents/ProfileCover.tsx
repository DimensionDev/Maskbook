import { useEffect } from 'react'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useAvailablePlugins, useSocialAddressListAll } from '@masknet/plugin-infra/web3'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'

import { MaskMessages } from '../../utils'
import { useCurrentVisitingIdentity } from '../DataSource/useActivatedUI'

export interface ProfileCoverProps extends withClasses<'root'> {}

export function ProfileCover({ classes }: ProfileCoverProps) {
    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')

    const currentVisitingIdentity = useCurrentVisitingIdentity()

    const {
        value: socialAddressList = EMPTY_LIST,
        loading: loadingSocialAddressList,
        retry: reloadSocialAddress,
    } = useSocialAddressListAll(currentVisitingIdentity)

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(reloadSocialAddress)
    }, [reloadSocialAddress])

    const displayPlugins = useAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.ProfileCover?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((x) => x.Utils.shouldDisplay?.(currentVisitingIdentity, socialAddressList) ?? true)
            .sort((a, z) => a.priority - z.priority)
    })

    if (loadingSocialAddressList || !currentVisitingIdentity.identifier?.userId) return null
    return <div className={classes?.root}>test</div>
}
