import { memo } from 'react'
import { useDashboardI18N } from '../../../../locales'
import { Box, Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { TokenIcon } from '@masknet/shared'
import { useFormContext } from 'react-hook-form'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface AddTokenConfirmUIProps {
    onBack: () => void
    onConfirm: () => void
    token?: FungibleToken<ChainId, SchemaType.ERC20>
    balance?: string
}

const useStyles = makeStyles()((theme) => ({
    actions: {
        padding: theme.spacing(1, 5, 6.75, 5),
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing(3.5),
    },
    button: {
        borderRadius: Number(theme.shape.borderRadius) * 5,
    },
    content: {
        padding: theme.spacing(3.5, 5, 5),
        minWidth: 600,
    },
    container: {
        '& > *': {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
    },
    confirmTitle: {
        fontWeight: 500,
    },
}))

export const AddTokenConfirmUI = memo<AddTokenConfirmUIProps>(({ token, balance, onBack, onConfirm }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { getValues } = useFormContext()

    return (
        <>
            <DialogContent className={classes.content}>
                <Stack spacing={4.5} className={classes.container}>
                    <Box>
                        <Typography className={classes.confirmTitle}>{t.wallets_assets_token()}</Typography>
                        <Typography className={classes.confirmTitle}>{t.wallets_assets_balance()}</Typography>
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TokenIcon
                                address={token?.address ?? ''}
                                name={token?.name}
                                chainId={token?.chainId}
                                logoURI={token?.logoURL}
                                AvatarProps={{ sx: { width: 48, height: 48 } }}
                            />
                            <Typography className={classes.confirmTitle} sx={{ marginLeft: 1.2 }}>
                                {getValues('symbol')}
                            </Typography>
                        </Box>
                        <Typography className={classes.confirmTitle}>
                            {balance} {token?.symbol}
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button color="secondary" className={classes.button} onClick={onBack}>
                    {t.wallets_add_token_cancel()}
                </Button>
                <Button color="primary" className={classes.button} onClick={onConfirm}>
                    {t.wallets_add_token()}
                </Button>
            </DialogActions>
        </>
    )
})
