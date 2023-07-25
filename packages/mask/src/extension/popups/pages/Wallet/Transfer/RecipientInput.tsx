import { Box, Input, Typography, type InputProps, IconButton } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../../../utils/index.js'
import { Icons } from '@masknet/icons'

interface Props extends InputProps {}
/**
 * @deprecated
 * Use AddContactInputPanel instead
 */
export const RecipientInput = memo(function RecipientInput(props: Props) {
    const { t } = useI18N()
    return (
        <Box>
            <Typography>{t('transfer_to')}</Typography>
            <Input
                fullWidth
                disableUnderline
                {...props}
                endAdornment={
                    <>
                        <Typography>{t('save')}</Typography>
                        <IconButton>
                            <Icons.AddUser size={18} />
                        </IconButton>
                    </>
                }
            />
        </Box>
    )
})
