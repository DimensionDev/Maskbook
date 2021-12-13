import { memo, useCallback, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { TableContainer, TablePagination, tablePaginationClasses, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/plugin-wallet'
import { useAsync, useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { DeriveWalletTable } from '../components/DeriveWalletTable'
import { currySameAddress, ProviderType, useWallets } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../../utils'
import { LoadingButton } from '@mui/lab'
import { PopupRoutes } from '@masknet/shared-base'
import { currentAccountSettings, currentMaskWalletAccountSettings } from '../../../../../plugins/Wallet/settings'
import { first } from 'lodash-unified'
import type { Search } from 'history'

const useStyles = makeStyles()({
    container: {
        padding: '16px 10px',
        backgroundColor: '#ffffff',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 12,
        color: '#151818',
        lineHeight: 1.5,
        fontWeight: 500,
    },
    path: {
        marginTop: 26,
        marginBottom: 16,
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 600,
    },
    button: {
        fontWeight: 600,
        padding: '10px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
        marginTop: 10,
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    paginationIcon: {
        border: '1px solid #E4E8F1',
        borderRadius: 4,
        fontSize: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    toolbar: {
        padding: 0,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
})

const AddDeriveWallet = memo(() => {
    const indexes = useRef(new Set<number>())
    const { t } = useI18N()
    const history = useHistory()
    const location = useLocation() as { state: { mnemonic: string }; search: Search }
    const { classes } = useStyles()
    const wallets = useWallets(ProviderType.MaskWallet)
    const walletName = new URLSearchParams(location.search).get('name')
    const { mnemonic } = location.state

    const [page, setPage] = useState(0)

    const { loading, value: dataSource } = useAsync(async () => {
        if (mnemonic) {
            const unDeriveWallets = Array.from(indexes.current)

            const derivableAccounts = await WalletRPC.getDerivableAccounts(mnemonic, page)

            return derivableAccounts.map((derivedWallet, index) => {
                const added = !!wallets.find(currySameAddress(derivedWallet.address))
                const selected = unDeriveWallets.find((item) => item === index + page * 10) !== undefined
                return {
                    added,
                    selected,
                    address: derivedWallet.address,
                }
            })
        }
        return []
    }, [mnemonic, wallets.length, page])

    const onCheck = useCallback(
        async (checked, index) => {
            if (checked) {
                indexes.current.add(page * 10 + index)
            } else {
                indexes.current.delete(page * 10 + index)
            }
        },
        [page],
    )

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        const unDeriveWallets = Array.from(indexes.current)
        if (!mnemonic) return

        if (unDeriveWallets.length) {
            const firstPath = first(unDeriveWallets)
            const firstWallet = await WalletRPC.recoverWalletFromMnemonic(
                `${walletName}${firstPath!}`,
                mnemonic,
                `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${firstPath}`,
            )

            const wallets = await Promise.all(
                unDeriveWallets
                    .slice(1)
                    .map(async (pathIndex) =>
                        WalletRPC.recoverWalletFromMnemonic(
                            `${walletName}${pathIndex}`,
                            mnemonic,
                            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${pathIndex}`,
                        ),
                    ),
            )

            if (!currentMaskWalletAccountSettings.value) {
                await WalletRPC.updateMaskAccount({
                    account: firstWallet,
                })
            }
            if (!currentAccountSettings.value) {
                await WalletRPC.updateAccount({
                    account: firstWallet,
                    providerType: ProviderType.MaskWallet,
                })
            }
        }
        history.replace(PopupRoutes.Wallet)
    }, [mnemonic, walletName, wallets.length])

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <Typography className={classes.title}>{t('plugin_wallet_import_wallet')}</Typography>
                <NetworkSelector />
            </div>
            <Typography className={classes.path}>
                {t('popups_wallet_derivation_path', {
                    path: HD_PATH_WITHOUT_INDEX_ETHEREUM,
                })}
            </Typography>
            <TableContainer sx={{ maxHeight: 320 }}>
                <DeriveWalletTable
                    loading={loading}
                    dataSource={dataSource}
                    onCheck={onCheck}
                    confirmLoading={confirmLoading}
                />
            </TableContainer>
            {!loading ? (
                <TablePagination
                    count={-1}
                    component="div"
                    onPageChange={() => {}}
                    page={page}
                    rowsPerPage={10}
                    rowsPerPageOptions={[10]}
                    labelDisplayedRows={() => null}
                    sx={{
                        [`& .${tablePaginationClasses.actions}`]: {
                            marginLeft: 0,
                        },
                    }}
                    backIconButtonProps={{
                        onClick: () => setPage((prev) => prev - 1),
                        size: 'small',
                        disabled: page === 0 || confirmLoading,
                    }}
                    nextIconButtonProps={{
                        onClick: () => setPage((prev) => prev + 1),
                        size: 'small',
                        disabled: confirmLoading,
                    }}
                    classes={{ root: classes.pagination, toolbar: classes.toolbar }}
                />
            ) : null}
            <LoadingButton
                loading={confirmLoading}
                disabled={confirmLoading || loading}
                variant="contained"
                classes={{ root: classes.button, disabled: classes.disabled }}
                onClick={onConfirm}
                fullWidth>
                {t('popups_wallet_done')}
            </LoadingButton>
        </div>
    )
})

export default AddDeriveWallet
