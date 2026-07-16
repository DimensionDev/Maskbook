import { makeStyles } from '@masknet/theme'
import { PluginID } from '@masknet/shared-base'
import { useActivatedPluginsSiteAdaptor, createInjectHooksRenderer } from '@masknet/plugin-infra/content-script'
import { useCurrentVisitingIdentity } from '../DataSource/useActivatedUI.js'

interface ProfileCoverProps extends withClasses<'root'> {}

const useStyles = makeStyles()(() => ({
    root: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
    },
}))
const Component = createInjectHooksRenderer(useActivatedPluginsSiteAdaptor.visibility.useAnyMode, (x) => {
    const cover = x.ProfileCover?.find((x) => x.ID === `${PluginID.Debugger}_cover`)
    return cover?.UI?.Cover
})
export function ProfileCover(props: ProfileCoverProps) {
    const { classes } = useStyles(undefined, { props: { classes: props.classes } })
    const currentVisitingIdentity = useCurrentVisitingIdentity()

    // TODO: Multi-plugin rendering support
    return (
        <div className={classes.root}>
            <Component identity={currentVisitingIdentity} />
        </div>
    )
}
