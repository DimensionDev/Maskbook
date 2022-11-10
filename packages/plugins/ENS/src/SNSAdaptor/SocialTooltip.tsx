import type { PropsWithChildren } from 'react'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Typography } from '@mui/material'
import { Trans } from 'react-i18next'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { isMenuScroll = false }) => {
    return {
        tooltip: {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
    }
})
export function SocialTooltip({ children }: PropsWithChildren<{}>) {
    const { classes } = useStyles({})

    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip }}
            arrow
            placement="top"
            title={
                <Typography style={{ padding: '6px 2px', whiteSpace: 'nowrap' }} fontSize={14}>
                    <Trans i18nKey="data_source_from_nextid" />
                </Typography>
            }>
            <div>{children}</div>
        </ShadowRootTooltip>
    )
}
