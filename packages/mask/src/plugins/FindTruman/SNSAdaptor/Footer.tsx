import { Avatar, Box, Chip, Link, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useContext } from 'react'
import { FindTrumanContext } from '../context'

const useStyles = makeStyles()((theme) => {
    return {
        footer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            minHeight: '48px',
            flexWrap: 'wrap',
            rowGap: '8px',
        },
        chip: {
            ':not(:last-child)': {
                marginRight: '8px',
            },
        },
    }
})

export default function Footer() {
    const { const: consts } = useContext(FindTrumanContext)
    const { classes } = useStyles()
    return (
        <Box className={classes.footer}>
            {consts && (
                <Link
                    component="a"
                    target="_blank"
                    href={consts.faqUrl}
                    variant="body2"
                    sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                    {consts.faqLabel}
                </Link>
            )}
            <Stack flexWrap="wrap" rowGap={1} direction="row">
                {consts?.icons.map((e) => (
                    <Chip
                        className={classes.chip}
                        key={e.label}
                        size="small"
                        avatar={<Avatar alt="FindTruman" src={e.icon} />}
                        label={e.label}
                        variant="outlined"
                        clickable
                        component="a"
                        target="_blank"
                        href={e.url}
                    />
                ))}
            </Stack>
        </Box>
    )
}
