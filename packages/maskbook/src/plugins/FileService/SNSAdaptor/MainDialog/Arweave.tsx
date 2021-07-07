import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core'
import { memo, useCallback, useEffect, useState } from 'react'

export interface ArweaveCheckButtonsProps {
    onChange?: (value: { arweave: Boolean; cdn: Boolean }) => void
}

export const ArweaveCheckButtons = memo<ArweaveCheckButtonsProps>(({ onChange }) => {
    const [arweave, setArweave] = useState(true)
    const [cdn, setCDN] = useState(false)

    useEffect(() => {}, [arweave, cdn, onChange])

    const onArweaveChange = useCallback(() => {
        setArweave((arweave) => !arweave)
    }, [cdn])

    const onCDNChange = useCallback(() => {
        setCDN((cdn) => !cdn)
    }, [cdn])

    return (
        <FormGroup row>
            <FormControlLabel
                control={<Checkbox checked={arweave} onChange={onArweaveChange} name="Arweave" color="primary" />}
                label="Arweave"
            />
            <FormControlLabel
                control={<Checkbox checked={cdn} onChange={onCDNChange} name="UseMesonCDN" color="primary" />}
                label="Use Meson CDN"
            />
        </FormGroup>
    )
})
