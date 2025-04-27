import { localStorage } from "@zos/storage"
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { createWidget, widget } from "@zos/ui"
import { getText } from "@zos/i18n"

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, screenShape } = getDeviceInfo()
export const isRound = screenShape == SCREEN_SHAPE_ROUND

export const COLORS = {
    primary: '0xffffff',
    secondary: '0xaaaaaa',
    normal: "0x222222",
    press: "0x333333"
}

export const SCHEME_PATTERN = {
    bg: {
        color: '15505F',
        visible: true
    },
    fg: {
        color: '3C7A6D',
        visible: true
    },
    text: {
        color: 'FFFFFF',
        visible: true
    }
}

export function saveList(data) {
    localStorage.setItem('schemes', data)
}

export function formatColor(color) {
    return `0x${color.padEnd(6, [0])}`
}

export function createBottomSpace(Y, H = 50) {
    createWidget(widget.FILL_RECT, {
        x: 0,
        y: Y,
        w: SCREEN_WIDTH,
        h: H
    })
}