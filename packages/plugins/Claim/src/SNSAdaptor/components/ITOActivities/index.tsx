import { useChainContext } from '@masknet/web3-hooks-base'
import { memo, useCallback } from 'react'
import { useClaimAll } from '../../../hooks/useClaimAll.js'
import { type NetworkPluginID } from '@masknet/shared-base'
import { useITOConstants } from '@masknet/web3-shared-evm'
import { makeStyles, LoadingBase } from '@masknet/theme'
import { Box } from '@mui/material'
import { useI18N } from '../../../locales/i18n_generated.js'
import { ITOActivityItem } from './ITOActivityItem.js'
import { useClaimCallback } from '../../../hooks/useClaimCallback.js'
import { EmptyStatus } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.5),
        minHeight: 424,
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 456,
        width: '100%',
        flexDirection: 'column',
        padding: 0,
    },
}))

export const ITOActivities = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { value: swappedTokens, loading: _loading, retry } = useClaimAll(account, chainId)

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

    if (_loading)
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
                        onClaim={claimCallback}
                    />
                ))}
            </Box>
        )

    return (
        <EmptyStatus className={classes.placeholder}>
            {!account ? t.connect_wallet_tips() : t.no_activities_tips()}
        </EmptyStatus>
    )
})
