import { Typography } from '@mui/material'
import { useDashboardI18N } from '../../locales/index.js'

export function Version({ className }: { className?: string }) {
    const t = useDashboardI18N()
    const version = process.env.VERSION

    return (
        <Typography className={className} variant="body2" component="span" color="inherit">
            {process.env.channel === 'stable'
                ? t.version_of_stable({ version })
                : t.version_of_unstable({
                      version,
                      build: process.env.channel ?? '',
                      hash: process.env.COMMIT_HASH ?? '',
                  })}
        </Typography>
    )
}
