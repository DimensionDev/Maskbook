declare global {
    module '@mui/material/Button' {
        interface ButtonPropsVariantOverrides {
            rounded: true
            roundedContained: true
            roundedOutlined: true
            roundedText: true
            roundedDark: true
            containedDark: true
        }
        interface ButtonPropsColorOverrides {
            warning: true
            error: true
        }
    }
    module '@mui/material/InputBase' {
        interface InputBasePropsSizeOverrides {
            large: true
        }
    }
    module '@mui/material/Paper' {
        interface PaperPropsVariantOverrides {
            background: true
            rounded: true
        }
    }
}
