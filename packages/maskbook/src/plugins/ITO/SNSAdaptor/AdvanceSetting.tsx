import type { ChangeEvent } from 'react'
import { FormGroup, FormLabel, FormControlLabel, Checkbox } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'

export enum SettingField {
    IPRegion = 'IPRegion',
    delayUnlocking = 'delayUnlocking',
    contract = 'contract',
}

export type AdvanceSettingData = {
    [Property in keyof typeof SettingField]?: boolean
}

export interface AdvanceSettingProps {
    advanceSettingData: AdvanceSettingData
    setAdvanceSettingData: React.Dispatch<React.SetStateAction<AdvanceSettingData>>
}
const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        border: 0,
        margin: 0,
        padding: 0,
        position: 'relative',
        minWidth: 0,
        flexDirection: 'column',
        verticalAlign: 'top',
    },
    label: {
        padding: `${theme.spacing(1)} ${theme.spacing(1)}`,
    },
    group: {
        flexFlow: 'wrap',
        justifyContent: 'space-between',
        padding: theme.spacing(0, 1),
        marginBottom: theme.spacing(1),
    },
}))

export function AdvanceSetting({ advanceSettingData, setAdvanceSettingData }: AdvanceSettingProps) {
    const { classes } = useStyles()
    const { t } = useI18N()

    const handleAdvanceSettingToggle = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target
        setAdvanceSettingData({ ...advanceSettingData, [name]: checked })
    }

    return (
        <fieldset className={classes.root}>
            <FormLabel component="legend" className={classes.label}>
                {t('plugin_ito_advanced')}
            </FormLabel>
            <FormGroup className={classes.group}>
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            checked={!!advanceSettingData.IPRegion}
                            onChange={handleAdvanceSettingToggle}
                            name={SettingField.IPRegion}
                        />
                    }
                    label={t('plugin_ito_advanced_ip_region')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            checked={!!advanceSettingData.delayUnlocking}
                            onChange={handleAdvanceSettingToggle}
                            name={SettingField.delayUnlocking}
                        />
                    }
                    label={t('plugin_ito_advanced_delay_unlocking')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            checked={!!advanceSettingData.contract}
                            onChange={handleAdvanceSettingToggle}
                            name={SettingField.contract}
                        />
                    }
                    label={t('plugin_ito_advanced_contract')}
                />
            </FormGroup>
        </fieldset>
    )
}
