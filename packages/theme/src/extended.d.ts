declare global {
    module '@mui/material/Button' {
        interface ButtonPropsVariantOverrides {
            rounded: true
            sns: true
        }
        interface ButtonPropsColorOverrides {
            warning: true
            error: true
        }
    }
    module '@mui/material/Paper' {
        interface PaperPropsVariantOverrides {
            background: true
            rounded: true
        }
    }
}
