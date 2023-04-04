import { useSharedI18N } from '@masknet/shared'
import { NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip, useBoundedPopperProps } from '@masknet/theme'
import { resolveNextIDPlatformName } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { ReactElement } from 'react'

const useStyles = makeStyles()((theme) => {
    return {
        title: {
            padding: '6px 2px',
            whiteSpace: 'nowrap',
        },
    }
})
interface SocialTooltipProps {
    platform?: NextIDPlatform
    children: ReactElement
}
export function SocialTooltip({ children, platform = NextIDPlatform.NextID }: SocialTooltipProps) {
    const { classes } = useStyles()
    const t = useSharedI18N()
    const tooltipPopperProps = useBoundedPopperProps()
    return (
        <ShadowRootTooltip
            PopperProps={tooltipPopperProps}
            disableInteractive
            arrow
            placement="top"
            title={
                <Typography className={classes.title} fontSize={14}>
                    {t.account_icon_tooltips({ source: resolveNextIDPlatformName(platform) })}
                </Typography>
            }>
            {children}
        </ShadowRootTooltip>
    )
}
