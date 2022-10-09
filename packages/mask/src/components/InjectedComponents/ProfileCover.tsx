import { useEffect, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { useSocialAddressListAll } from '@masknet/web3-hooks-base'
import { useActivatedPluginsSNSAdaptor, createInjectHooksRenderer } from '@masknet/plugin-infra/content-script'
import { MaskMessages } from '../../utils/index.js'
import { useCurrentVisitingIdentity } from '../DataSource/useActivatedUI.js'

export interface ProfileCoverProps extends withClasses<'root'> {}

const useStyles = makeStyles()(() => ({
    root: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
    },
}))
export function ProfileCover(props: ProfileCoverProps) {
    const { classes } = useStyles(undefined, { props: { classes: props.classes } })
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

    // TODO: Multi-plugin rendering support
    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
            const cover = x.ProfileCover?.find((x) => x.ID === `${PluginID.Debugger}_cover`)

            return cover?.UI?.Cover
        })

        return <Component identity={currentVisitingIdentity} />
    }, [currentVisitingIdentity])

    if (!component) return null
    return <div className={classes?.root}>{component}</div>
}
