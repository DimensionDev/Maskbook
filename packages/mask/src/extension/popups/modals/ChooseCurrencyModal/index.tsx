import { memo, useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { FiatCurrencyIcon } from '@masknet/shared'
import { FiatCurrencyType, resolveFiatCurrencyName } from '@masknet/web3-shared-base'
import { ActionModal, useActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, Typography } from '@mui/material'
import { useFiatCurrencyType } from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'
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
    fiatCurrencyType: FiatCurrencyType
}
const CurrencyItem = memo(function CurrencyItem({ fiatCurrencyType }: CurrencyItemProps) {
    const { cx, classes, theme } = useStyles()
    const { closeModal } = useActionModal()
    const currentFiatCurrencyType = useFiatCurrencyType()
    const selected = fiatCurrencyType === currentFiatCurrencyType

    const setFiatCurrencyType = useCallback(async () => {
        await Web3State.state.Settings?.setFiatCurrencyType(fiatCurrencyType)
        closeModal()
    }, [fiatCurrencyType])

    return (
        <li
            className={cx(classes.item, selected ? classes.selectedItem : '')}
            role="option"
            onClick={setFiatCurrencyType}>
            <Box className={classes.itemBox}>
                <FiatCurrencyIcon type={fiatCurrencyType} size={24} />
                <Typography className={classes.text}>{resolveFiatCurrencyName(fiatCurrencyType)}</Typography>
            </Box>
            {selected ? (
                <Icons.RadioButtonChecked size={20} />
            ) : (
                <Icons.RadioButtonUnChecked size={20} color={theme.palette.maskColor.line} />
            )}
        </li>
    )
})

export const ChooseCurrencyModal = memo(function ChooseCurrencyModal({ ...rest }: ActionModalBaseProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <ActionModal header={t('currency')} keepMounted {...rest}>
            <ul className={classes.networkList}>
                {Object.values(FiatCurrencyType).map((fiatCurrencyType, index) => (
                    <CurrencyItem key={index} fiatCurrencyType={fiatCurrencyType} />
                ))}
            </ul>
        </ActionModal>
    )
})
