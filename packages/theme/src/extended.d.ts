declare global {
    module '@mui/material/Button' {
        interface ButtonPropsVariantOverrides {
            rounded: true
            roundedContained: true
            roundedOutlined: true
            roundedText: true
        }
        interface ButtonPropsColorOverrides {
            warning: true
            error: true
            dark: true
        }
    }
    module '@mui/material/Paper' {
        interface PaperPropsVariantOverrides {
            background: true
            rounded: true
        }
    }
}
