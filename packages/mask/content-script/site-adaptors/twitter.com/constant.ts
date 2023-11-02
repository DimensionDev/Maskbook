import { FontSize } from '@masknet/web3-shared-base'

export interface ButtonProps {
    buttonSize: number
    iconSize: number
    fontSize: number
    lineHeight: string
    marginBottom: number
}

export const ButtonStyle: Record<FontSize, ButtonProps> = {
    [FontSize.X_Small]: { buttonSize: 32, iconSize: 18, fontSize: 14, lineHeight: '18px', marginBottom: 11 },
    [FontSize.Small]: { buttonSize: 34, iconSize: 19, fontSize: 14, lineHeight: '19px', marginBottom: 11 },
    [FontSize.Normal]: { buttonSize: 36, iconSize: 20, fontSize: 15, lineHeight: '20px', marginBottom: 12 },
    [FontSize.Large]: { buttonSize: 40, iconSize: 22, fontSize: 17, lineHeight: '22px', marginBottom: 13 },
    [FontSize.X_Large]: { buttonSize: 43, iconSize: 24, fontSize: 18, lineHeight: '24px', marginBottom: 14 },
}

interface TipButtonProps {
    buttonSize: number
    iconSize: number
}

export const TipButtonStyle: Record<FontSize, TipButtonProps> = {
    [FontSize.X_Small]: { buttonSize: 29, iconSize: 18 },
    [FontSize.Small]: { buttonSize: 30, iconSize: 19 },
    [FontSize.Normal]: { buttonSize: 32, iconSize: 20 },
    [FontSize.Large]: { buttonSize: 35, iconSize: 22 },
    [FontSize.X_Large]: { buttonSize: 38, iconSize: 24 },
}
