import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import { DeriveWalletTable } from '@masknet/shared'
import { DashboardRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useWallets } from '@masknet/web3-hooks-base'
import { Web3 } from '@masknet/web3-providers'
import {
    HD_PATH_WITHOUT_INDEX_ETHEREUM,
    currySameAddress,
    generateNewWalletName,
    isSameAddress,
} from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useQueries, useQuery } from '@tanstack/react-query'
import { first, sortBy, uniq } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { sha3 } from 'web3-utils'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
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
        mnemonic: string
        password: string
        isReset: boolean
    }

    const { mnemonic, password, isReset } = state
    // Avoid leaking mnemonic to react-query
    const mnemonicHash = sha3(mnemonic)
    const [pathIndexes, setPathIndexes] = useState<number[]>([])
    const { handlePasswordAndWallets } = ResetWalletContext.useContainer()

    const wallets = useWallets()
    const existedSiblingQueries = useQueries({
        queries: isReset
            ? wallets.map((wallet) => ({
                  queryKey: ['derive-address', mnemonicHash, wallet.derivationPath],
                  queryFn: async () => {
                      const derived = await WalletServiceRef.value.generateAddressFromMnemonicWords(
                          '',
                          mnemonic,
                          wallet.derivationPath,
                      )
                      const pathIndex = wallet.derivationPath?.split('/').pop()
                      if (pathIndex && isSameAddress(derived, wallet.address)) {
                          return Number.parseInt(pathIndex, 10)
                      }
                      return null
                  },
              }))
            : EMPTY_LIST,
    })
    const mergedIndexes = useMemo(() => {
        if (!isReset) return sortBy(uniq(pathIndexes))
        const existedSiblingsIndexes = existedSiblingQueries
            .flatMap((x) => x.data)
            .filter((x) => typeof x === 'number') as number[]
        return sortBy(uniq([...pathIndexes, ...existedSiblingsIndexes]))
    }, [pathIndexes, existedSiblingQueries, isReset])

    const [page, setPage] = useState(0)

    const { data: walletChunks = EMPTY_LIST, isLoading } = useQuery({
        queryKey: ['derived-wallets', mnemonicHash, page],
        queryFn: async () => {
            if (!mnemonic) return EMPTY_LIST
            return await WalletServiceRef.value.getDerivableAccounts(mnemonic, page)
        },
    })

    const tableData = useMemo(() => {
        return walletChunks.map((derivedWallet) => {
            const added = !!wallets.find(currySameAddress(derivedWallet.address))
            const pathIndex = derivedWallet.index
            const selected = pathIndexes.find((item) => item === pathIndex) !== undefined
            return {
                added,
                selected,
                pathIndex,
                address: derivedWallet.address,
            }
        })
    }, [walletChunks, wallets, pathIndexes])

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        if (!mnemonic || !mergedIndexes.length) return

        const result = await handlePasswordAndWallets(password, isReset)
        if (!result) return
        const existedWallets = isReset ? [] : wallets

        const firstIndex = first(mergedIndexes)
        const firstWallet = await WalletServiceRef.value.recoverWalletFromMnemonicWords(
            generateNewWalletName(existedWallets),
            mnemonic,
            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${firstIndex}`,
        )

        await Promise.all(
            mergedIndexes.slice(1).map(async (pathIndex, index) => {
                await WalletServiceRef.value.recoverWalletFromMnemonicWords(
                    generateNewWalletName(existedWallets, index + 1),
                    mnemonic,
                    `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${pathIndex}`,
                )
            }),
        )

        await Web3.connect({
            account: firstWallet,
            providerType: ProviderType.MaskWallet,
            silent: true,
        })
        await WalletServiceRef.value.resolveMaskAccount([{ address: firstWallet }])
        Telemetry.captureEvent(EventType.Access, EventID.EntryPopupWalletImport)
        navigate(DashboardRoutes.SignUpMaskWalletOnboarding, { replace: true })
    }, [mnemonic, wallets.length, isReset, password, mergedIndexes])

    const onCheck = useCallback(async (checked: boolean, pathIndex: number) => {
        setPathIndexes((list) => {
            // Will sort and deduplicate in mergedIndexes
            return checked ? [...list, pathIndex] : list.filter((x) => x !== pathIndex)
        })
    }, [])

    const handleRecovery = useCallback(() => {
        navigate(DashboardRoutes.CreateMaskWalletMnemonic)
    }, [])

    const disabled = confirmLoading || isLoading || !mergedIndexes.length

    return (
        <>
            <div className={classes.between}>
                <Typography className={cx(classes.second, classes.bold)}>
                    {t.create_step({ step: '2', totalSteps: '2' })}
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

            <DeriveWalletTable hiddenHeader loading={isLoading} dataSource={tableData} onCheck={onCheck} symbol="ETH" />

            <div className={classes.pagination}>
                <SecondaryButton
                    className={classes.paginationButton}
                    disabled={page === 0 || confirmLoading}
                    onClick={() => setPage((prev) => prev - 1)}>
                    <Typography fontWeight={700}>{t.previous_page()}</Typography>
                </SecondaryButton>
                <SecondaryButton
                    className={classes.paginationButton}
                    disabled={confirmLoading}
                    onClick={() => setPage((prev) => prev + 1)}>
                    <Typography fontWeight={700}>{t.next_page()}</Typography>
                </SecondaryButton>
            </div>

            <SetupFrameController>
                <PrimaryButton
                    loading={confirmLoading}
                    disabled={disabled}
                    className={classes.bold}
                    width="125px"
                    size="large"
                    color="primary"
                    onClick={onConfirm}>
                    {t.continue()}
                </PrimaryButton>
            </SetupFrameController>
        </>
    )
})

export default AddDeriveWallet
