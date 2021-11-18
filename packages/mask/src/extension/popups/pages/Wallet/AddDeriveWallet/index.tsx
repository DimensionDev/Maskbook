import { memo, useCallback, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Typography, TablePagination, tablePaginationClasses, TableContainer } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/plugin-wallet'
import { useAsync, useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { DeriveWalletTable } from '../components/DeriveWalletTable'
import { currySameAddress, useWallets } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../../utils'
import { LoadingButton } from '@mui/lab'
import { PopupRoutes } from '../../../index'

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
    const indexes = useRef(new Set())
    const { t } = useI18N()
    const history = useHistory()
    const location = useLocation()
    const { classes } = useStyles()
    const wallets = useWallets()
    const mnemonic = new URLSearchParams(location.search).get('mnemonic')
    const walletName = new URLSearchParams(location.search).get('name')

    const [page, setPage] = useState(0)

    const { loading, value: dataSource } = useAsync(async () => {
        if (mnemonic) {
            const derivableAccounts = await WalletRPC.getDerivableAccounts(mnemonic, page)

            return derivableAccounts.map((derivedWallet) => {
                const added = !!wallets.find(currySameAddress(derivedWallet.address))

                return {
                    added,
                    address: derivedWallet.address,
                }
            })
        }
        return []
    }, [mnemonic, wallets, page])

    const onCheck = useCallback(
        async (checked, index) => {
            if (checked) {
                indexes.current.add(page + index)
            } else {
                indexes.current.delete(page + index)
            }
        },
        [page],
    )

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        const unDeriveWallets = Array.from(indexes.current)
        if (!mnemonic) return
        await Promise.all(
            unDeriveWallets.map(async (pathIndex) =>
                WalletRPC.recoverWalletFromMnemonic(
                    `${walletName}${pathIndex}` ?? '',
                    mnemonic,
                    `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${pathIndex}`,
                ),
            ),
        )
        history.replace(PopupRoutes.Wallet)
    }, [mnemonic, walletName])

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
