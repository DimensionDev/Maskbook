import { Icons } from '@masknet/icons'
import { ShadowRootTooltip } from '@masknet/theme'
import { Typography, Link } from '@mui/material'
import { Trans } from 'react-i18next'
import useStyles from './useStyles'

export function NextIdBadge({ variant, rightBoundary }: { variant?: 'dark' | 'light'; rightBoundary?: number }) {
    const { classes } = useStyles({})

    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip }}
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
            <Icons.NextIDMini
                width={32}
                variant={variant}
                ref={(e) => {
                    if (!rightBoundary) return
                    const offsetRight = e?.getBoundingClientRect().right
                    if (offsetRight && offsetRight > rightBoundary) {
                        e.style.display = 'none'
                    }
                }}
            />
        </ShadowRootTooltip>
    )
}
