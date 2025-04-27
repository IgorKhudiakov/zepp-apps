import * as hmUI from "@zos/ui"
import { COLORS } from "./constants"
import { px } from "@zos/utils"

export const SETTINGS_TEXT_PARAMS = {
    x: 0,
    y: 0,
    h: 40,
    text_size: 28,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
    color: COLORS.primary
}
export const SETTINGS_DESC_PARAMS = {
    x: 0,
    y: 40,
    h: 40,
    text_size: 24,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
    color: COLORS.secondary
}

export const CHECKBOX = {
    W: 96,
    H: 56
}
export const SWITCH_PARAMS = {
    w: px(CHECKBOX.W),
    h: px(CHECKBOX.H),
    un_select_bg: 'image/buttons/switch_off.png',
    select_bg: 'image/buttons/switch_on.png',
    slide_src: 'image/buttons/switch_fg.png',
    slide_select_x: px(48),
    slide_un_select_x: px(8),
}