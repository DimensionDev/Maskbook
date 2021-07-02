import { useDashboardI18N } from '../../locales'
import { Typography } from '@material-ui/core'

export const Version = ({ className }: { className?: string }) => {
    const t = useDashboardI18N()
    const version = globalThis.browser?.runtime.getManifest()?.version ?? process.env.TAG_NAME.slice(1)

    return (
        <Typography className={className} variant="body2" component="span" color="inherit">
            {process.env.build === 'stable'
                ? t.version_of_stable({ version })
                : t.version_of_unstable({
                      version,
                      build: process.env.build ?? '',
                      hash: process.env.COMMIT_HASH ?? '',
                  })}
        </Typography>
    )
}
