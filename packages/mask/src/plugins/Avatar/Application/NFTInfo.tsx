import { Box, Typography } from '@mui/material'
import { LoadingBase, makeStyles, ShadowRootTooltip, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../locales/i18n_generated'

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
    isNFT: boolean
    loading?: boolean
    tooltip?: string
}

export function NFTInfo(props: NFTInfoProps) {
    const { isNFT = false, loading = false, tooltip = '' } = props
    const classes = useStylesExtends(useStyles(), props)
    const t = useI18N()

    if (loading) return <LoadingBase size={24} />
    return (
        <ShadowRootTooltip
            arrow
            classes={{ tooltip: classes.tip }}
            placement="top"
            title={
                tooltip ? (
                    <Typography style={{ whiteSpace: 'nowrap' }} fontSize={12}>
                        {tooltip}
                    </Typography>
                ) : (
                    ''
                )
            }>
            <Box className={classes.root}>
                {!isNFT ? (
                    <Typography fontWeight={700} fontSize={12}>
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
