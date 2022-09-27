import { Icons } from '@masknet/icons'
import { ShadowRootTooltip } from '@masknet/theme'
import { Typography, Link } from '@mui/material'
import { Trans } from 'react-i18next'
import useStyles from './useStyles'
import { useI18N } from '../locales'

export function NextIdBadge({ variant }: { variant?: 'dark' | 'light' }) {
    const t = useI18N()
    const { classes } = useStyles({})

    return (
        <ShadowRootTooltip
            arrow
            placement="top"
            title={
                <Typography style={{ padding: '6px 2px', whiteSpace: 'nowrap' }} fontSize={14}>
                    <Trans
                        i18nKey="data_source_from_nextid"
                        components={{
                            nextIdLink: (
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.nextIdLink}
                                    href="https://next.id/"
                                />
                            ),
                        }}
                    />
                </Typography>
            }>
            <Icons.NextIDMini width={32} variant={variant} />
        </ShadowRootTooltip>
    )
}
