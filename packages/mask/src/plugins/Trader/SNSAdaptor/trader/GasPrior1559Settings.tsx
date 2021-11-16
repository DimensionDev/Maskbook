import { memo, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../Wallet/messages'
import { formatWeiToGwei, useChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import { Box, TextField, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import classnames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
    },
    pointer: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: MaskColorVar.twitterSecond,
    },
    optionTitle: {
        fontSize: 16,
        lineHeight: '22px',
        fontWeight: 500,
    },
    option: {
        padding: '16px 14px',
        borderRadius: 4,
        border: `1px solid ${MaskColorVar.twitterLine}`,
        cursor: 'pointer',
    },
    selectedPointer: {
        backgroundColor: theme.palette.primary.main,
    },
    selected: {
        borderColor: theme.palette.primary.main,
    },
    gasPrice: {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
    },
    textFieldInput: {
        borderRadius: 6,
    },
    input: {
        maxWidth: 42,
        padding: '11px 9px',
        fontSize: 12,
        borderRadius: 6,
    },
}))

interface GasPrior1559SettingsProps {}

export const GasPrior1559Settings = memo<GasPrior1559SettingsProps>(() => {
    const chainId = useChainId()
    const { classes } = useStyles()
    const { t } = useI18N()
    const [selected, setOption] = useState<number | null>(1)

    //#region Get gas options from debank
    const { value: gasOptions } = useAsync(async () => {
        const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)
        if (!response) return { slow: 0, standard: 0, fast: 0 }

        return {
            slow: response.data.slow.price,
            standard: response.data.normal.price,
            fast: response.data.fast.price,
        }
    }, [chainId])
    //#endregion

    const options = useMemo(
        () => [
            {
                title: t('plugin_trader_gas_setting_standard'),
                gasPrice: gasOptions?.standard ?? 0,
            },
            {
                title: t('plugin_trader_gas_setting_fast'),
                gasPrice: gasOptions?.fast ?? 0,
            },
            {
                title: t('plugin_trader_gas_setting_custom'),
                isCustom: true,
                gasPrice: 0,
            },
        ],
        [gasOptions],
    )

    return (
        <Box className={classes.container}>
            {options.map((option, index) => (
                <Box
                    key={index}
                    onClick={() => setOption(index)}
                    className={classnames(classes.option, selected === index ? classes.selected : undefined)}>
                    <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography className={classes.optionTitle}>{option.title}</Typography>
                        <Box
                            className={classnames(
                                classes.pointer,
                                selected === index ? classes.selectedPointer : undefined,
                            )}
                        />
                    </Box>
                    <Typography className={classes.gasPrice}>
                        <Typography component="span" marginRight={1}>
                            {option.isCustom ? (
                                <TextField
                                    inputProps={{
                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                        className: classes.input,
                                        'aria-autocomplete': 'none',
                                    }}
                                    InputProps={{ disableUnderline: true, classes: { root: classes.textFieldInput } }}
                                />
                            ) : (
                                formatWeiToGwei(option.gasPrice ?? 0).toString()
                            )}
                        </Typography>
                        {t('wallet_transfer_gwei')}
                    </Typography>
                </Box>
            ))}
        </Box>
    )
})
