import { FiatCurrencyIcon } from '@masknet/shared'
import { RadioIndicator, makeStyles } from '@masknet/theme'
import { useCurrencyType } from '@masknet/web3-hooks-base'
import { evm } from '@masknet/web3-providers'
import { CurrencyType, resolveCurrencyFullName } from '@masknet/web3-shared-base'
import { Box, Typography, useTheme } from '@mui/material'
import { memo, useCallback } from 'react'
import { ActionModal, useActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    networkList: {
        paddingLeft: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: '1fr',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        listStyle: 'none',
        borderRadius: 8,
        padding: theme.spacing(1.5),
        cursor: 'pointer',
    },
    selectedItem: {
        background: theme.palette.maskColor.bg,
    },
    itemBox: {
        display: 'flex',
        alignItems: 'center',
    },
    text: {
        color: theme.palette.maskColor.main,
        fontSize: 12,
        fontWeight: 700,
        marginLeft: 8,
    },
}))

interface CurrencyItemProps {
    fiatCurrencyType: CurrencyType
}
const CurrencyItem = memo(function CurrencyItem({ fiatCurrencyType }: CurrencyItemProps) {
    const { cx, classes } = useStyles()
    const { closeModal } = useActionModal()
    const theme = useTheme()
    const currentCurrencyType = useCurrencyType()
    const checked = fiatCurrencyType === currentCurrencyType

    const setFiatCurrencyType = useCallback(async () => {
        await evm.state!.Settings?.setDefaultCurrencyType(fiatCurrencyType)
        closeModal()
    }, [fiatCurrencyType])

    return (
        <li
            className={cx(classes.item, checked ? classes.selectedItem : '')}
            role="option"
            onClick={setFiatCurrencyType}>
            <Box className={classes.itemBox}>
                <FiatCurrencyIcon type={fiatCurrencyType} size={24} />
                <Typography className={classes.text}>{resolveCurrencyFullName(fiatCurrencyType)}</Typography>
            </Box>
            <RadioIndicator size={20} checked={checked} unCheckedButtonColor={theme.palette.maskColor.secondaryLine} />
        </li>
    )
})

export const ChooseCurrencyModal = memo(function ChooseCurrencyModal(props: ActionModalBaseProps) {
    const { classes } = useStyles()

    const currencies = [CurrencyType.USD, CurrencyType.CNY, CurrencyType.HKD, CurrencyType.JPY, CurrencyType.EUR]

    return (
        <ActionModal header={<Trans>Currency</Trans>} keepMounted {...props}>
            <ul className={classes.networkList}>
                {currencies.map((fiatCurrencyType, index) => (
                    <CurrencyItem key={index} fiatCurrencyType={fiatCurrencyType} />
                ))}
            </ul>
        </ActionModal>
    )
})
