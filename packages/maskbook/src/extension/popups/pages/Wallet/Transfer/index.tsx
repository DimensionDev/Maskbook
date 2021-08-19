import { memo, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Asset, ProviderType, useWallet, useWallets } from '@masknet/web3-shared'
import { Collapse, MenuItem, Typography } from '@material-ui/core'
import { StyledInput } from '../../../components/StyledInput'
import { UserIcon } from '@masknet/icons'
import { useMenu, FormattedAddress, FormattedBalance } from '@masknet/shared'
import { ExpandMore } from '@material-ui/icons'
import { z as zod } from 'zod'
import { EthereumAddress } from 'wallet.ts'
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../hooks/useWalletContext'

const useStyles = makeStyles()({
    container: {
        padding: 16,
    },
    label: {
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        margin: '10px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    accountName: {
        fontSize: 12,
        linHeight: '16px',
        color: '#15181B',
        padding: '10px 0 20px 10px',
    },
    user: {
        stroke: '#15181B',
        fill: 'none',
        fontSize: 20,
        cursor: 'pointer',
    },
    expand: {
        backgroundColor: '#F7F9FA',
        padding: 10,
    },
    title: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#15181B',
    },
    menuItem: {
        padding: 8,
        display: 'flex',
        justifyContent: 'space-between',
        '&>*': {
            fontSize: 12,
            lineHeight: '16px',
        },
    },
    balance: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
    },
})

const Transfer = memo(() => {
    const wallet = useWallet()
    const wallets = useWallets(ProviderType.Maskbook)
    const { assets, currentToken } = useContainer(WalletContext)

    const otherWallets = useMemo(
        () =>
            wallets
                .filter((item) => item.address !== wallet?.address)
                .map((wallet) => ({ name: wallet.name, address: wallet.address })),
        [wallet, wallets],
    )

    const schema = useMemo(() => {
        return zod.object({
            receivingAccount: zod
                .string()
                .refine((address) => EthereumAddress.isValid(address), 'Error address')
                .refine((address) => address !== wallet?.address),
        })
    }, [])

    const methods = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            receivingAccount: '',
        },
    })

    return (
        <FormProvider {...methods}>
            <TransferUI
                accountName={wallet?.name ?? ''}
                accounts={otherWallets}
                currentToken={currentToken}
                assets={assets}
            />
        </FormProvider>
    )
})

export interface TransferUIProps {
    accountName: string
    accounts: { name: string | null; address: string | null }[]
    assets: Asset[]
    currentToken?: Asset
}

type TransferFormData = {
    receivingAccount: string
}

export const TransferUI = memo<TransferUIProps>(({ accountName, accounts, currentToken, assets }) => {
    const { classes } = useStyles()

    const {
        formState: { errors },
    } = useFormContext<TransferFormData>()

    const [menu, openMenu] = useMenu(
        <MenuItem className={classes.expand}>
            <Typography className={classes.title}>Transfer between my accounts</Typography>
            <ExpandMore style={{ fontSize: 20 }} />
        </MenuItem>,
        <Collapse in>
            {accounts.map((account, index) => (
                <MenuItem key={index} className={classes.menuItem}>
                    <Typography>{account.name}</Typography>
                    <Typography>
                        <FormattedAddress address={account.address ?? ''} size={4} />
                    </Typography>
                </MenuItem>
            ))}
        </Collapse>,
    )

    return (
        <div className={classes.container}>
            <Typography className={classes.label}>Transfer Account</Typography>
            <Typography className={classes.accountName}>{accountName}</Typography>
            <Typography className={classes.label}>Receiving Account</Typography>
            <Controller
                render={({ field }) => (
                    <StyledInput
                        {...field}
                        error={!!errors.receivingAccount?.message}
                        helperText={errors.receivingAccount?.message}
                        InputProps={{
                            endAdornment: (
                                <div onClick={openMenu}>
                                    <UserIcon className={classes.user} />
                                </div>
                            ),
                        }}
                    />
                )}
                name="receivingAccount"
            />
            <Typography className={classes.label}>
                <span>Choose Token</span>
                <Typography className={classes.balance} component="span">
                    Balance:
                    <FormattedBalance
                        value={currentToken?.balance}
                        decimals={currentToken?.token.decimals}
                        symbol={currentToken?.token.symbol}
                        // classes={{ symbol: classes.symbol }}
                    />
                </Typography>
            </Typography>
            {menu}
        </div>
    )
})

export default Transfer
