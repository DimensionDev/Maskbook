import { Box, Typography } from '@mui/material'
import { LoadingBase, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { useAvatarTrans } from '../locales/i18n_generated.js'

const useStyles = makeStyles()(() => ({
    root: {},
    tip: {
        maxWidth: 'none',
    },
}))
interface NFTInfoProps {
    isNFT: boolean
    loading?: boolean
    tooltip?: string
}

export function NFTInfo(props: NFTInfoProps) {
    const { isNFT = false, loading = false, tooltip } = props
    const { classes } = useStyles()
    const t = useAvatarTrans()

    if (loading) return <LoadingBase size={24} />
    const node = (
        <Box className={classes.root}>
            {isNFT ?
                <Typography variant="body1" fontWeight={700} fontSize={12}>
                    {t.nft_set_success()}
                </Typography>
            :   <Typography fontWeight={700} fontSize={12}>
                    {t.set_nft()}
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
