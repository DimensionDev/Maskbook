import { COLORS, COLOR_TO_STYLE } from '../common/variables'
import type { ReactNode } from 'react'
import { Typography } from '@mui/material'

interface ButtonInterface {
    color: string
    text?: string
    fontSize?: string
    icon?: string
    isOutlined?: boolean
    isFullRound?: boolean
    isDisabled?: boolean
    width?: string
    height?: string
    onClick?: (param?: any) => void
    children?: ReactNode
}
/**
 * This Button component supports 4 different kinds of buttons:
 * 1. default simple button
 * 2. outlined button
 * 3. disabled button
 * 4. button with an icon
 * @param {string} color - The text and background color of the button
 * @param {string} [text] - The text of the button
 * @param children
 * @param {string} [fontSize] - The font size of the button
 * @param {string} [icon] - The icon on the button
 * @param {boolean} [isOutlined] - Specify if the button style is outlined
 * @param {boolean} [isDisabled] - Specify if the button style is disabled
 * @param isFullRound
 * @param {string} [width] - width if not wrapped around text
 * @param height
 * @param {function} [onClick] - button onClick function
 * @example
 * <Button text={"Edit Profile"} color={COLORS.nft} isOutlined={true}/>
 */
const Button = ({
    color,
    text,
    children,
    fontSize,
    isOutlined,
    isDisabled,
    isFullRound,
    width,
    height,
    onClick,
}: ButtonInterface) => {
    let bgDefaultStyle = ''
    let bgAltStyle = ''
    let textStyle = ''
    let borderStyle = ''
    let hoverTextStyle = ''
    let hoverBorderStyle = ''
    let hoverBgStyle = ''

    if (typeof color !== 'undefined') {
        bgDefaultStyle = COLOR_TO_STYLE[color].bgDefault
        bgAltStyle = COLOR_TO_STYLE[color].bgAlt
        textStyle = COLOR_TO_STYLE[color].text
        borderStyle = COLOR_TO_STYLE[color].border
        hoverTextStyle = COLOR_TO_STYLE[color].hoverText
        hoverBorderStyle = COLOR_TO_STYLE[color].hoverBorder
        hoverBgStyle = COLOR_TO_STYLE[color].hoverBg
    }

    // default = simple button filled with specified color
    const defaultClassName = `flex flex-row gap-x-2 justify-center items-center ${bgDefaultStyle} ${hoverBgStyle} ${
        color === COLORS.metamask ? textStyle : 'text-white'
    } font-medium ${fontSize ? fontSize : 'text-xs'} ${hoverTextStyle} py-sm ${
        fontSize ? 'px-6' : 'px-3'
    } ${width} ${height} border ${borderStyle} ${hoverBorderStyle} rounded`

    const outlinedClassName = `${bgAltStyle} ${textStyle} text-opacity-70 font-medium ${
        fontSize ? fontSize : 'text-xs'
    } hover:text-opacity-80 py-sm ${
        fontSize ? 'px-6' : 'px-3'
    } ${width} border ${borderStyle} border-opacity-70 hover:border-opacity-40 rounded`

    const disabledClassName = `${bgDefaultStyle} ${textStyle} text-opacity-40 ${
        fontSize ? fontSize : 'text-xs'
    } font-medium py-sm ${fontSize ? 'px-6' : 'px-3'} ${width} rounded bg-opacity-5 cursor-not-allowed`

    let className = defaultClassName

    if (isDisabled) {
        className = disabledClassName
    } else if (isOutlined) {
        className = outlinedClassName
    }

    if (isFullRound) {
        className = className.replace('rounded', 'rounded-full')
    }

    return (
        <div className="flex items-center">
            <button onClick={onClick} className={className}>
                <Typography variant="subtitle1">{text}</Typography>
                {children}
            </button>
        </div>
    )
}
export default Button
