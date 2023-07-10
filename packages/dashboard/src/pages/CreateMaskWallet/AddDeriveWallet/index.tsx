import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { memo, useCallback, useRef, useState } from 'react'
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
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { ResetWalletContext } from '../context.js'

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
    bold: {
        fontWeight: 700,
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
    const walletName = 'Wallet 1'
    const { mnemonic } = state.usr
    const indexes = useRef(new Set<number>())
    const { resetWallets } = ResetWalletContext.useContainer()

    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)

    const handleRecovery = useCallback(() => {
        navigate(DashboardRoutes.CreateMaskWalletMnemonic)
    }, [])

    const [page, setPage] = useState(0)

    const { loading, value: dataSource } = useAsync(async () => {
        if (mnemonic) {
            const unDeriveWallets = Array.from(indexes.current)

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
    }, [mnemonic, wallets.length, page])

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        if (!mnemonic) return

        const unDeriveWallets = Array.from(indexes.current)
        if (!unDeriveWallets.length) return

        await resetWallets()
        const hasPassword = await PluginServices.Wallet.hasPassword()

        const firstPath = first(unDeriveWallets)
        const firstWallet = await PluginServices.Wallet.recoverWalletFromMnemonic(
            `${walletName}${firstPath!}`,
            mnemonic,
            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${firstPath}`,
            hasPassword ? undefined : 'MASK',
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
            checked ? indexes.current.add(page * 10 + index) : indexes.current.delete(page * 10 + index)
        },
        [page],
    )

    return (
        <Box>
            <div className={classes.between}>
                <Typography className={cx(classes.second, classes.bold)}>
                    {t.create_step({ step: '2', total: '2' })}
                </Typography>
                <Typography className={cx(classes.create, classes.bold)} onClick={handleRecovery}>
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
                        <Typography fontWeight={700}>{t.previous()}</Typography>
                    </SecondaryButton>
                    <SecondaryButton
                        className={classes.paginationButton}
                        disabled={confirmLoading}
                        onClick={() => setPage((prev) => prev + 1)}>
                        <Typography fontWeight={700}>{t.next()}</Typography>
                    </SecondaryButton>
                </div>
            ) : null}

            <SetupFrameController>
                <PrimaryButton
                    loading={confirmLoading}
                    disabled={confirmLoading || loading}
                    className={classes.bold}
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
