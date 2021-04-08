import { useCallback } from 'react'
import { createStyles, Grid, makeStyles } from '@material-ui/core'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../utils/i18n-next-ui'
import { ApproveStateType, useERC721TokenApproveCallback } from '../hooks/useERC721TokenApproveCallback'
import { useAccount } from '../hooks/useAccount'

const useStyles = makeStyles((theme) =>
    createStyles({
        button: {
            flexDirection: 'column',
            position: 'relative',
            marginTop: theme.spacing(1.5),
        },
        buttonLabel: {
            display: 'block',
            fontWeight: 'inherit',
            marginTop: theme.spacing(-0.5),
            marginBottom: theme.spacing(1),
        },
    }),
)

export interface EthereumERC721TokenApprovedBoundaryProps {
    spender: string
    tokenIds: string[]
    selectedTokenId: string
    children?: React.ReactNode | ((tokenIdsOfSpender: string) => React.ReactNode)
}

export function EthereumERC721TokenApprovedBoundary(props: EthereumERC721TokenApprovedBoundaryProps) {
    const { spender, tokenIds, selectedTokenId, children = null } = props

    const { t } = useI18N()
    const classes = useStyles()
    const account = useAccount()

    const [
        { type: approveStateType, tokenIdsOfSpender },
        transactionState,
        approveCallback,
        approveAllCallback,
        resetApproveCallback,
    ] = useERC721TokenApproveCallback(account, spender, tokenIds)

    const onApprove = useCallback(
        async (all = false, tokenId?: string) => {
            if (approveStateType !== ApproveStateType.NOT_APPROVED) return
            if (all) await approveAllCallback()
            else if (tokenId) await approveCallback(tokenId)
        },
        [approveStateType, approveCallback, approveAllCallback],
    )

    // not a valid erc20 token, please given token as undefined
    if (!tokenIds.length) return <Grid container>{children}</Grid>

    if (approveStateType === ApproveStateType.UNKNOWN)
        return (
            <Grid container>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" loading disabled />
            </Grid>
        )
    if (approveStateType === ApproveStateType.FAILED)
        return (
            <Grid container>
                <ActionButton
                    className={classes.button}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={resetApproveCallback}>
                    Failed to load token.
                </ActionButton>
            </Grid>
        )
    if (approveStateType === ApproveStateType.NOT_APPROVED)
        return (
            <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                <Grid item xs={6}>
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => onApprove(false, selectedTokenId)}>
                        <span className={classes.buttonLabel}>
                            {t('plugin_wallet_erc721_token_unlock', {
                                unlocked: tokenIdsOfSpender.length,
                                total: tokenIds.length,
                            })}
                        </span>
                    </ActionButton>
                </Grid>
                <Grid item xs={6}>
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => onApprove(true)}>
                        {t('plugin_wallet_erc721_token_unlock_all')}
                    </ActionButton>
                </Grid>
            </Grid>
        )
    if (approveStateType === ApproveStateType.PENDING || approveStateType === ApproveStateType.UPDATING)
        return (
            <Grid container>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" disabled>
                    {`${approveStateType === ApproveStateType.PENDING ? 'Unlocking' : 'Updating'}…`}
                </ActionButton>
            </Grid>
        )
    if (approveStateType === ApproveStateType.APPROVED)
        return <Grid container>{typeof children === 'function' ? children(tokenIdsOfSpender) : children}</Grid>

    return null
}
