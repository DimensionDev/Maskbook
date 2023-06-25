import { useBuildInfo } from '@masknet/shared-base-ui'
import { useDashboardI18N } from '../../locales/index.js'
import { Typography } from '@mui/material'

export function Version({ className }: { className?: string }) {
    const t = useDashboardI18N()
    const env = useBuildInfo()
    const version = env.VERSION

    return (
        <Typography className={className} variant="body2" component="span" color="inherit">
            {process.env.channel === 'stable'
                ? t.version_of_stable({ version })
                : t.version_of_unstable({
                      version,
                      build: process.env.channel ?? '',
                      hash: env.COMMIT_HASH ?? '',
                  })}
        </Typography>
    )
}
