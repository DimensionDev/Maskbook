import { Box, Typography } from '@mui/material'
import { LoadingBase, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { ReactNode } from 'react'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()(() => ({
    root: {},
    tip: {
        maxWidth: 'none',
    },
}))
interface NFTInfoProps {
    isNFT: boolean
    loading?: boolean
    tooltip?: ReactNode
}

export function NFTInfo(props: NFTInfoProps) {
    const { isNFT = false, loading = false, tooltip } = props
    const { classes } = useStyles()

    if (loading) return <LoadingBase size={24} />

    const node = (
        <Box className={classes.root}>
            {isNFT ?
                <Typography variant="body1" fontWeight={700} fontSize={12}>
                    <Trans>Set up NFT PFP successfully</Trans>
                </Typography>
            :   <Typography fontWeight={700} fontSize={12}>
                    <Trans>Set NFT PFPs</Trans>
                </Typography>
            }
        </Box>
    )
    if (!tooltip) return node

    return (
        <ShadowRootTooltip
            arrow
            classes={{ tooltip: classes.tip }}
            placement="top"
            title={
                <Typography style={{ whiteSpace: 'nowrap' }} fontSize={12}>
                    {tooltip}
                </Typography>
            }>
            {node}
        </ShadowRootTooltip>
    )
}
