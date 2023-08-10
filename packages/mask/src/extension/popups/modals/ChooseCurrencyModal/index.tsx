import { memo, useCallback } from 'react'
import { RadioIndicator, makeStyles } from '@masknet/theme'
import { FiatCurrencyIcon } from '@masknet/shared'
import { CurrencyType, resolveCurrencyName } from '@masknet/web3-shared-base'
import { ActionModal, useActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, Typography, useTheme } from '@mui/material'
import { useCurrencyType } from '@masknet/web3-hooks-base'
import { Web3State } from '@masknet/web3-providers'

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
        await Web3State.state.Settings?.setDefaultCurrencyType(fiatCurrencyType)
        closeModal()
    }, [fiatCurrencyType])

    return (
        <li
            className={cx(classes.item, checked ? classes.selectedItem : '')}
            role="option"
            onClick={setFiatCurrencyType}>
            <Box className={classes.itemBox}>
                <FiatCurrencyIcon type={fiatCurrencyType} size={24} />
                <Typography className={classes.text}>{resolveCurrencyName(fiatCurrencyType)}</Typography>
            </Box>
            <RadioIndicator size={20} checked={checked} unCheckedButtonColor={theme.palette.maskColor.secondaryLine} />
        </li>
    )
})

export const ChooseCurrencyModal = memo(function ChooseCurrencyModal({ ...rest }: ActionModalBaseProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <ActionModal header={t('currency')} keepMounted {...rest}>
            <ul className={classes.networkList}>
                {[CurrencyType.USD, CurrencyType.CNY, CurrencyType.HKD, CurrencyType.JPY].map(
                    (fiatCurrencyType, index) => (
                        <CurrencyItem key={index} fiatCurrencyType={fiatCurrencyType} />
                    ),
                )}
            </ul>
        </ActionModal>
    )
})
