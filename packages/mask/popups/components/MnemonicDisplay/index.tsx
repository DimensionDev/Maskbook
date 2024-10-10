import { memo } from 'react'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography, alpha } from '@mui/material'
import { useToggle } from '@react-hookz/web'
import { MaskSharedTrans } from '../../../shared-ui/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1),
        borderRadius: 8,
        border: `1px solid ${theme.palette.maskColor.line}`,
        position: 'relative',
    },
    words: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        paddingLeft: 0,
        margin: 0,
    },
    word: {
        backgroundColor: theme.palette.maskColor.bg,
        padding: theme.spacing(1),
        borderRadius: 8,
        listStyleType: 'decimal',
        listStylePosition: 'inside',
        position: 'relative',
        fontWeight: 700,
        fontSize: 14,
        '&::marker': {
            backgroundColor: theme.palette.maskColor.bg,
            color: theme.palette.maskColor.third,
            fontSize: 14,
            fontWeight: 400,
        },
    },
    mask: {
        background: alpha(theme.palette.mode === 'dark' ? '#000000' : '#ffffff', 0.4),
        backdropFilter: 'blur(5px)',
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        top: 0,
        left: 0,
        cursor: 'pointer',
    },
    tips: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
        textAlign: 'center',
    },
    footer: {
        marginTop: theme.spacing(2),
        display: 'flex',
        color: theme.palette.maskColor.main,
        justifyContent: 'center',
        gap: 8,
    },
    button: {
        fontWeight: 400,
    },
    icon: {
        color: theme.palette.maskColor.main,
        cursor: 'pointer',
    },
}))

interface MnemonicDisplayProps {
    mnemonic?: string[]
}

export const MnemonicDisplay = memo<MnemonicDisplayProps>(function MnemonicDisplay({ mnemonic = EMPTY_LIST }) {
    const { classes } = useStyles()
    const [display, toggle] = useToggle(false)

    return (
        <Box>
            <Box className={classes.root}>
                {!display ?
                    <Box className={classes.mask} onClick={toggle}>
                        <Icons.EyeOff size={24} />
                        <Typography className={classes.tips}>
                            {/* eslint-disable-next-line react/naming-convention/component-name */}
                            <MaskSharedTrans.popups_wallet_backup_mnemonic_view_tips components={{ br: <br /> }} />
                        </Typography>
                    </Box>
                :   null}
                <Box component="ul" className={classes.words}>
                    {mnemonic.map((x) => (
                        <Box key={x} component="li" className={classes.word}>
                            {x}
                        </Box>
                    ))}
                </Box>
            </Box>
            {display ?
                <Box className={classes.footer}>
                    <Button
                        onClick={toggle}
                        variant="text"
                        startIcon={<Icons.EyeColor size={20} className={classes.icon} />}
                        className={classes.button}>
                        <Trans>Hide mnemonic words</Trans>
                    </Button>
                </Box>
            :   null}
        </Box>
    )
})
