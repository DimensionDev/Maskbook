import { first, sortBy, uniq } from 'lodash-es'
import urlcat from 'urlcat'
import { memo, useCallback, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { useQueries, useQuery } from '@tanstack/react-query'
import { delay } from '@masknet/kit'
import { DeriveWalletTable } from '@masknet/shared'
import { DashboardRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
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
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { ResetWalletContext } from '../context.js'
import Services from '#services'
import { Trans } from '@lingui/macro'

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
        padding: '8px',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        marginTop: '12px',
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

export const Component = memo(function AddDeriveWallet() {
    const { cx, classes } = useStyles()
    const navigate = useNavigate()
    const state = useLocation().state as {
        mnemonic: string
        password: string
        isReset: boolean
    }

    const { mnemonic, password, isReset } = state
    // Avoid leaking mnemonic to react-query
    const mnemonicHash = web3_utils.sha3(mnemonic)
    const [pathIndexes, setPathIndexes] = useState<number[]>([])
    const { handlePasswordAndWallets } = ResetWalletContext.useContainer()

    useWallet() // Warming up persist caching
    const wallets = useWallets()
    const existedSiblingQueries = useQueries({
        queries:
            isReset ?
                wallets.map((wallet) => ({
                    queryKey: ['derive-address', mnemonicHash, wallet.derivationPath],
                    queryFn: async () => {
                        const derived = await Services.Wallet.generateAddressFromMnemonicWords(
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
            :   EMPTY_LIST,
    })
    const mergedIndexes = useMemo(() => {
        if (!isReset || existedSiblingQueries.length === 0) return sortBy(uniq(pathIndexes))
        const existedSiblingsIndexes = existedSiblingQueries
            .flatMap((x) => x.data)
            .filter((x) => typeof x === 'number') as number[]
        return sortBy(uniq([...pathIndexes, ...existedSiblingsIndexes]))
    }, [pathIndexes, existedSiblingQueries, isReset])

    const [page, setPage] = useState(0)

    const { data: walletChunks = EMPTY_LIST, isPending } = useQuery({
        queryKey: ['derived-wallets', mnemonicHash, page],
        networkMode: 'always',
        queryFn: async () => {
            if (!mnemonic) return EMPTY_LIST
            return Services.Wallet.getDerivableAccounts(mnemonic, page)
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
        const firstWallet = await Services.Wallet.recoverWalletFromMnemonicWords(
            generateNewWalletName(existedWallets),
            mnemonic,
            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${firstIndex}`,
        )

        await Promise.all(
            mergedIndexes.slice(1).map(async (pathIndex, index) => {
                await Services.Wallet.recoverWalletFromMnemonicWords(
                    generateNewWalletName(existedWallets, index + 1),
                    mnemonic,
                    `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${pathIndex}`,
                )
            }),
        )

        await EVMWeb3.connect({
            account: firstWallet,
            providerType: ProviderType.MaskWallet,
            silent: true,
        })
        await Services.Wallet.resolveMaskAccount([{ address: firstWallet }])
        Telemetry.captureEvent(EventType.Access, EventID.EntryPopupWalletImport)
        await delay(300) // Wait for warming up above. 300ms is the closed duration after testing.
        navigate(urlcat(DashboardRoutes.SignUpMaskWalletOnboarding, {}), { replace: true })
    }, [mnemonic, wallets.length, isReset, password, mergedIndexes])

    const onCheck = useCallback(async (checked: boolean, pathIndex: number) => {
        setPathIndexes((list) => {
            // Will sort and deduplicate in mergedIndexes
            return checked ? [...list, pathIndex] : list.filter((x) => x !== pathIndex)
        })
    }, [])

    const handleRecovery = useCallback(() => {
        navigate(urlcat(DashboardRoutes.CreateMaskWalletMnemonic, {}))
    }, [navigate])

    const disabled = confirmLoading || isPending || !mergedIndexes.length

    return (
        <>
            <div className={classes.between}>
                <Typography className={cx(classes.second, classes.bold)}>
                    <Trans>Step 2/2</Trans>
                </Typography>
                <Typography className={cx(classes.create, classes.bold)} onClick={handleRecovery}>
                    <Trans>Create</Trans>
                </Typography>
            </div>
            <Box className={classes.header}>
                <Typography variant="h1" className={classes.title}>
                    <Trans>Select Address</Trans>
                </Typography>
            </Box>

            <Typography className={classes.second} mt={2} mb={3}>
                <Trans>Ethereum {HD_PATH_WITHOUT_INDEX_ETHEREUM}</Trans>
            </Typography>

            <DeriveWalletTable hiddenHeader loading={isPending} dataSource={tableData} onCheck={onCheck} symbol="ETH" />

            <div className={classes.pagination}>
                <SecondaryButton
                    className={classes.paginationButton}
                    disabled={page === 0 || confirmLoading}
                    onClick={() => setPage((prev) => prev - 1)}>
                    <Typography fontWeight={700}>
                        <Trans>Previous</Trans>
                    </Typography>
                </SecondaryButton>
                <SecondaryButton
                    className={classes.paginationButton}
                    disabled={confirmLoading}
                    onClick={() => setPage((prev) => prev + 1)}>
                    <Typography fontWeight={700}>
                        <Trans>Next</Trans>
                    </Typography>
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
                    <Trans>Continue</Trans>
                </PrimaryButton>
            </SetupFrameController>
        </>
    )
})
