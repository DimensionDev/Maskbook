import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { memo, useCallback, useState } from 'react'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes, EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM, currySameAddress } from '@masknet/web3-shared-base'
import { useAsync, useAsyncFn, useLocation } from 'react-use'
import { PluginServices } from '../../../API.js'
import { useWallets } from '@masknet/web3-hooks-base'
import { DeriveWalletTable } from '@masknet/shared'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { first } from 'lodash-es'
import { walletName } from '../constants.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { produce } from 'immer'

const useStyles = makeStyles()((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    second: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    between: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    pagination: {
        display: 'flex',
        padding: 10,
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        gap: 12,
    },
    paginationButton: {
        borderRadius: 99,
        background: theme.palette.maskColor.thirdMain,
        width: '100%',
        fontWeight: 700,
    },
    helveticaBold: {
        fontWeight: 700,
        fontFamily: 'Helvetica',
    },
    create: {
        fontSize: 14,
        cursor: 'pointer',
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
}))

const AddDeriveWallet = memo(function AddDeriveWallet() {
    const t = useDashboardI18N()
    const { cx, classes } = useStyles()
    const navigate = useNavigate()
    const state = useLocation().state as {
        usr: {
            mnemonic: string
        }
    }
    const { mnemonic } = state.usr
    const [indexes, setIndexes] = useState(new Set<number>())

    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)

    const handleRecovery = useCallback(() => {
        navigate(DashboardRoutes.CreateMaskWalletMnemonic)
    }, [])

    const [page, setPage] = useState(0)

    const { loading, value: dataSource } = useAsync(async () => {
        if (mnemonic) {
            const unDeriveWallets = Array.from(indexes)

            const derivableAccounts = await PluginServices.Wallet.getDerivableAccounts(mnemonic, page)

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
        return EMPTY_LIST
    }, [mnemonic, wallets.length, page, indexes])

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        if (!mnemonic) return

        const unDeriveWallets = Array.from(indexes)
        if (!unDeriveWallets.length) return

        const firstPath = first(unDeriveWallets)
        const firstWallet = await PluginServices.Wallet.recoverWalletFromMnemonic(
            `${walletName}${firstPath!}`,
            mnemonic,
            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${firstPath}`,
        )

        await Promise.all(
            unDeriveWallets
                .slice(1)
                .map(async (pathIndex) =>
                    PluginServices.Wallet.recoverWalletFromMnemonic(
                        `${walletName}${pathIndex}`,
                        mnemonic,
                        `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${pathIndex}`,
                    ),
                ),
        )

        await PluginServices.Wallet.resolveMaskAccount([{ address: firstWallet }])
        navigate(DashboardRoutes.SignUpMaskWalletOnboarding, { replace: true })
    }, [indexes, mnemonic, walletName, wallets.length])

    const onCheck = useCallback(
        async (checked: boolean, index: number) => {
            setIndexes(
                produce((draft) => {
                    checked ? draft.add(page * 10 + index) : draft.delete(page * 10 + index)
                    return draft
                }),
            )
        },
        [page],
    )

    return (
        <Box>
            <div className={classes.between}>
                <Typography className={cx(classes.second, classes.helveticaBold)}>
                    {t.create_step({ step: '2', total: '2' })}
                </Typography>
                <Typography className={cx(classes.create, classes.helveticaBold)} onClick={handleRecovery}>
                    {t.create()}
                </Typography>
            </div>
            <Box className={classes.header}>
                <Typography variant="h1" className={classes.title}>
                    {t.wallet_select_address()}
                </Typography>
            </Box>

            <Typography className={classes.second} mt={2} mb={3}>
                {t.wallet_derivation_path({ path: HD_PATH_WITHOUT_INDEX_ETHEREUM })}
            </Typography>

            <DeriveWalletTable
                page={page}
                hiddenHeader
                loading={loading}
                dataSource={dataSource}
                onCheck={onCheck}
                symbol={'ETH'}
            />

            {!loading ? (
                <div className={classes.pagination}>
                    <SecondaryButton
                        className={classes.paginationButton}
                        disabled={page === 0 || confirmLoading}
                        onClick={() => setPage((prev) => prev - 1)}>
                        <Typography fontWeight={700} fontFamily="Helvetica">
                            {t.previous()}
                        </Typography>
                    </SecondaryButton>
                    <SecondaryButton
                        className={classes.paginationButton}
                        disabled={confirmLoading}
                        onClick={() => setPage((prev) => prev + 1)}>
                        <Typography fontWeight={700} fontFamily="Helvetica">
                            {t.next()}
                        </Typography>
                    </SecondaryButton>
                </div>
            ) : null}

            <SetupFrameController>
                <PrimaryButton
                    loading={confirmLoading}
                    disabled={confirmLoading || loading || !indexes.size}
                    className={classes.helveticaBold}
                    width="125px"
                    size="large"
                    color="primary"
                    onClick={onConfirm}>
                    {t.continue()}
                </PrimaryButton>
            </SetupFrameController>
        </Box>
    )
})

export default AddDeriveWallet
