import { Box, CircularProgress, Typography } from '@mui/material'
import { makeStyles, ShadowRootTooltip, useStylesExtends } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../locales/i18n_generated'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()(() => ({
    root: {},
    nft: {
        display: 'flex',
        alignItems: 'center',
    },
    tip: {
        maxWidth: 'none',
    },
}))
interface NFTInfoProps extends withClasses<'root'> {
    nft?: {
        name: string
        address: string
        tokenId: string
        symbol: string
        chainId: ChainId
        networkPluginID: NetworkPluginID
    }
    owner: boolean
    loading?: boolean
    tooltip?: string
}

export function NFTInfo(props: NFTInfoProps) {
    const { nft, owner, loading = false, tooltip = '' } = props
    const classes = useStylesExtends(useStyles(), props)
    const t = useI18N()

    if (loading) return <CircularProgress size={24} />
    return (
        <ShadowRootTooltip
            arrow
            classes={{ tooltip: classes.tip }}
            placement="top"
            title={
                tooltip ? (
                    <Typography style={{ padding: '6px 12px', whiteSpace: 'nowrap' }} fontSize={12}>
                        {tooltip}
                    </Typography>
                ) : (
                    ''
                )
            }>
            <Box className={classes.root}>
                {!nft ? (
                    <Typography fontWeight={700} fontSize={12}>
                        {t.persona_set_nft()}
                    </Typography>
                ) : !owner ? (
                    <Typography variant="body1" fontWeight={700} fontSize={12}>
                        {t.persona_set_nft()}
                    </Typography>
                ) : (
                    <Typography variant="body1" fontWeight={700} fontSize={12}>
                        {t.persona_nft_set()}
                    </Typography>
                )}
            </Box>
        </ShadowRootTooltip>
    )
}
