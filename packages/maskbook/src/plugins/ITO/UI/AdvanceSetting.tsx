import { useState, ChangeEvent } from 'react'
import {
    createStyles,
    makeStyles,
    TextField,
    FormGroup,
    FormControl,
    FormLabel,
    FormControlLabel,
    Checkbox,
} from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'

import { useRegionSelect, encodeRegionCode } from '../hooks/useRegion'
import type { RegionCode } from '../hooks/useRegion'
import { RegionSelect } from './RegionSelect'

export enum SettingField {
    IPRegion = 'IPRegion',
    delayUnlocking = 'delayUnlocking',
    contract = 'contract',
}

export type AdvanceSettingData = {
    enabled: { [Property in keyof typeof SettingField]?: boolean }
    IPRegion: string
}

export interface AdvanceSettingProps {
    onSettingChange: (data: AdvanceSettingData) => void
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        label: {
            padding: `${theme.spacing(1)} ${theme.spacing(1)}`,
        },
        group: {
            flexFlow: 'wrap',
            justifyContent: 'space-between',
            padding: `0 ${theme.spacing(1)}`,
            marginBottom: theme.spacing(1),
        },
        field: {
            flex: 1,
            padding: theme.spacing(1),
            marginTop: theme.spacing(1),
        },
    }),
)

export function AdvanceSetting({ onSettingChange }: AdvanceSettingProps) {
    const classes = useStyles()
    const { t } = useI18N()

    const [data, setData] = useState<AdvanceSettingData>({ enabled: {}, IPRegion: '' })
    const { enabled } = data

    const updateData = (newData: AdvanceSettingData) => {
        setData(newData)
        onSettingChange(newData)
    }

    const handleAdvanceSettingToggle = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target
        updateData({ ...data, enabled: { ...enabled, [name]: checked } })
    }

    const [regions, setRegions] = useRegionSelect()
    const handleRegionChange = (codes: RegionCode[]) => {
        setRegions(codes)
        updateData({ ...data, IPRegion: encodeRegionCode(codes) })
    }

    return (
        <>
            <FormControl component="fieldset" className={classes.root}>
                <FormLabel component="legend" className={classes.label}>
                    {t('plugin_ito_advanced')}
                </FormLabel>
                <FormGroup className={classes.group}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                color="primary"
                                checked={!!enabled.IPRegion}
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
                                checked={!!enabled.delayUnlocking}
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
                                checked={!!enabled.contract}
                                onChange={handleAdvanceSettingToggle}
                                name={SettingField.contract}
                            />
                        }
                        label={t('plugin_ito_advanced_contract')}
                    />
                </FormGroup>
                {enabled.IPRegion ? (
                    <TextField
                        className={classes.field}
                        label={t('plugin_ito_region_label')}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            inputComponent: RegionSelect,
                            inputProps: {
                                value: regions,
                                onRegionChange: handleRegionChange,
                            },
                        }}
                    />
                ) : null}
            </FormControl>
        </>
    )
}
