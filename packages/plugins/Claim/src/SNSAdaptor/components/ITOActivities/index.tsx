import { useChainContext, useFungibleTokens } from '@masknet/web3-hooks-base'
import { memo, useCallback } from 'react'
import { useClaimAll } from '../../../hooks/useClaimAll.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress, type FungibleToken } from '@masknet/web3-shared-base'
import { useITOConstants, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { makeStyles, LoadingBase } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../../locales/i18n_generated.js'
import { ITOActivityItem } from './ITOActivityItem.js'
import { useClaimCallback } from '../../../hooks/useClaimCallback.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.5),
        minHeight: 392,
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 424,
        width: '100%',
        flexDirection: 'column',
    },
    tips: {
        marginTop: theme.spacing(1.5),
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
    },
}))

export const ITOActivities = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { value: _swappedTokens, loading: _loading, retry } = useClaimAll(account, chainId)

    const { value: swappedTokensWithDetailed = [], loading: loadingTokenDetailed } = useFungibleTokens(
        NetworkPluginID.PLUGIN_EVM,
        (_swappedTokens ?? []).map((t) => t.token.address) ?? [],
        {
            chainId,
        },
    )

    const loading = _loading || loadingTokenDetailed

    const swappedTokens = _swappedTokens?.map((t) => {
        const tokenDetailed = swappedTokensWithDetailed.find((v) => isSameAddress(t.token.address, v.address))
        if (tokenDetailed) t.token = tokenDetailed as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>
        return t
    })

    const { ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const handleClaim = useClaimCallback(ITO2_CONTRACT_ADDRESS)

    const claimCallback = useCallback(
        async (pids: string[]) => {
            const hash = await handleClaim(pids)
            if (typeof hash !== 'string') return
            retry()
        },
        [handleClaim],
    )

    if (loading)
        return (
            <Box className={classes.placeholder}>
                <LoadingBase size={24} />
            </Box>
        )

    if (account && swappedTokens && swappedTokens.length > 0)
        return (
            <Box className={classes.container}>
                {swappedTokens.map((swappedToken, index) => (
                    <ITOActivityItem
                        key={index}
                        swappedToken={swappedToken}
                        chainId={chainId}
                        handleClaim={claimCallback}
                    />
                ))}
            </Box>
        )

    return (
        <Box className={classes.placeholder}>
            <Icons.EmptySimple size={32} />
            <Typography className={classes.tips}>
                {!account ? t.connect_wallet_tips() : t.no_activities_tips()}
            </Typography>
        </Box>
    )
})
