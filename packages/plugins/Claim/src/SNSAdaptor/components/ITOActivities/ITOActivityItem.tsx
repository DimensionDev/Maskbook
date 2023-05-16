import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'
import type { SwappedTokenType } from '../../../types.js'
import { useI18N } from '../../../locales/i18n_generated.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleToken } from '@masknet/web3-hooks-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { FormattedBalance } from '@masknet/shared'
import { formatBalance } from '@masknet/web3-shared-base'
import formatDateTime from 'date-fns/format'
import { useAsyncFn } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF',
        borderRadius: 16,
        padding: 12,
    },
    lockedHeader: {
        padding: 10,
        borderRadius: '10px 10px 0px 0px',
        backgroundColor: theme.palette.maskColor.publicBg,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    unclaimedHeader: {
        backgroundColor: theme.palette.maskColor.primary,
        padding: 10,
        borderRadius: '10px 10px 0px 0px',
    },
    title: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        color: theme.palette.maskColor.white,
    },
    lockedTitle: {
        color: theme.palette.maskColor.publicSecond,
    },
    content: {
        borderRadius: '0px 0px 10px 10px',
        padding: 16,
        backgroundColor: theme.palette.maskColor.white,
        display: 'flex',
        alignItems: 'baseline',
    },
    balance: {
        fontWeight: 700,
        fontSize: 24,
        lineHeight: 1.2,
        color: theme.palette.maskColor.publicMain,
    },
    symbol: {
        fontWeight: 400,
        fontSize: 16,
        lineHeight: '20x',
        marginLeft: 10,
        color: theme.palette.maskColor.publicSecond,
    },
    lockIcon: {
        width: 22,
        height: 22,
        marginRight: 8,
    },
    unlockTime: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.publicSecond,
    },
}))

interface ITOActivityItemProps {
    swappedToken: SwappedTokenType
    chainId: ChainId
    onClaim: (pids: string[]) => Promise<void>
}

export const ITOActivityItem = memo<ITOActivityItemProps>(({ swappedToken, chainId, onClaim }) => {
    const t = useI18N()

    const { classes, cx } = useStyles()

    const { value: _token } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, swappedToken.token.address, undefined, {
        chainId,
    })
    const token = _token ?? swappedToken.token

    const [{ loading }, handleClickClaim] = useAsyncFn(async () => {
        if (!swappedToken.isClaimable) return
        return onClaim(swappedToken.pids)
    }, [onClaim, swappedToken])

    return (
        <Box className={classes.container}>
            <Box>
                {swappedToken.isClaimable ? (
                    <Box className={classes.unclaimedHeader}>
                        <Typography className={classes.title}>
                            {t.unclaimed_token_title({ symbol: token.symbol })}
                        </Typography>
                    </Box>
                ) : (
                    <Box className={classes.lockedHeader}>
                        <Box display="flex" alignItems="center">
                            <img
                                className={classes.lockIcon}
                                src={new URL('../../../assets/lock.png', import.meta.url).toString()}
                            />
                            <Typography className={cx(classes.title, classes.lockedTitle)}>
                                {t.locked_token_title({ symbol: token.symbol })}
                            </Typography>
                        </Box>
                        <Typography className={classes.unlockTime}>
                            {t.unlock_time({ time: formatDateTime(swappedToken.unlockTime, 'yyyy/MM/dd HH:mm:ss') })}
                        </Typography>
                    </Box>
                )}
                <Box className={classes.content}>
                    <Typography className={classes.balance}>
                        <FormattedBalance
                            classes={{ symbol: classes.symbol }}
                            value={swappedToken.amount}
                            decimals={token.decimals}
                            symbol={token.symbol}
                            formatter={formatBalance}
                        />
                    </Typography>
                </Box>
            </Box>
            {swappedToken.isClaimable ? (
                <ActionButton
                    variant="roundedDark"
                    fullWidth
                    sx={{ mt: 1.5 }}
                    loading={loading}
                    disabled={loading}
                    onClick={handleClickClaim}>
                    {t.claim()}
                </ActionButton>
            ) : null}
        </Box>
    )
})
