import { makeStyles } from '@masknet/theme'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import type { Plugin } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        applicationWrapper: {
            marginTop: theme.spacing(0.5),
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: '100px',
            gridGap: theme.spacing(1.5),
            justifyContent: 'space-between',
            height: 324,
            [smallQuery]: {
                overflow: 'auto',
                overscrollBehavior: 'contain',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridGap: theme.spacing(1),
            },
        },
    }
})

export function ApplicationBoard() {
    const { classes } = useStyles()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    return (
        <>
            <section className={classes.applicationWrapper}>
                {snsAdaptorPlugins
                    .reduce<Plugin.SNSAdaptor.ApplicationEntry[]>((acc, cur) => {
                        if (!cur.ApplicationEntries) return acc
                        return acc.concat(cur.ApplicationEntries ?? [])
                    }, [])
                    .sort((a, b) => a.defaultSortingPriority - b.defaultSortingPriority)
                    .map((x, i) => x.RenderEntryComponent(i))}
            </section>
        </>
    )
}
