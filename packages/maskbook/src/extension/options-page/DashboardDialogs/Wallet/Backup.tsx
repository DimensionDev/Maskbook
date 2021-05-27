import { makeStyles, Theme } from '@material-ui/core'
import { CreditCard as CreditCardIcon } from 'react-feather'
import { useAsync } from 'react-use'
import { Flags, useI18N } from '../../../../utils'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import ShowcaseBox from '../../DashboardComponents/ShowcaseBox'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { WalletProps } from './types'

const useBackupDialogStyles = makeStyles((theme: Theme) => ({
    section: {
        textAlign: 'left',
    },
}))

export function DashboardWalletBackupDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const classes = useBackupDialogStyles()
    const { value: [privateKeyInHex, mnemonic] = ['', []] } = useAsync(async () => {
        if (!wallet) return
        const record = await WalletRPC.getWallet(wallet.address)
        if (!record) return
        const { privateKeyInHex } = record._private_key_
            ? await WalletRPC.recoverWalletFromPrivateKey(record._private_key_)
            : await WalletRPC.recoverWalletFromMnemonicWords(record.mnemonic, record.passphrase)
        return [privateKeyInHex, record.mnemonic] as const
    }, [wallet])

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary={t('backup_wallet')}
                secondary={t('backup_wallet_hint')}
                constraintSecondary={false}
                content={
                    <>
                        {Flags.wallet_mnemonic_words_backup_enabled && mnemonic.length ? (
                            <section className={classes.section}>
                                <ShowcaseBox title={t('mnemonic_words')}>{mnemonic.join(' ')}</ShowcaseBox>
                            </section>
                        ) : null}
                        {Flags.wallet_private_key_backup_enabled ? (
                            <section className={classes.section}>
                                <ShowcaseBox title={t('private_key')}>{privateKeyInHex}</ShowcaseBox>
                            </section>
                        ) : null}
                    </>
                }
            />
        </DashboardDialogCore>
    )
}
