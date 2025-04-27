import { getDeviceInfo } from "@zos/device"
import * as hmUI from "@zos/ui"
import { replace, push, back, exit } from "@zos/router"
import { localStorage } from "@zos/storage"
import { SCREEN_SHAPE_ROUND } from "@zos/device"

const screenWidth = getDeviceInfo().width

const button = {
    W: 96,
    H: 96
}
export function createButtons({ UI, centerX = (screenWidth / 2), y, buttons = {} }, context) {
    const buttonsCount = Object.keys(buttons).length
    for (const key in buttons) {
        UI.createWidget(hmUI.widget.BUTTON, {
            x: centerX - button.W * buttonsCount / 2 + button.W * Object.keys(buttons).indexOf(key),
            y: y,
            w: button.W,
            h: button.H,
            normal_src: `image/buttons/${buttons[key].name}_gray.png`,
            press_src: `image/buttons/${buttons[key].name}.png`,
            click_func: () => {
                if (buttons[key].type == 'replace') {
                    replace({
                        url: buttons[key].url,
                        params: buttons[key].params ?? {}
                    })
                } else {
                    switch (buttons[key].name) {
                        case "back":
                            back()
                            break
                        case "exit":
                            exit()
                            break
                        case "refresh": {
                            context.request({
                                method: "GET_TRANSPORT"
                            })
                                .then(({ result }) => {
                                    localStorage.setItem('transport', result)
                                    replace({
                                        url: 'page/index',
                                        params: {}
                                    })
                                })
                                .catch((res) => { })
                            break
                        }
                        default: {
                            push({
                                url: `page/${buttons[key].name}`
                            })
                        }
                    }
                }
            }
        })
    }
    if (buttonsCount > 1 && getDeviceInfo().screenShape == SCREEN_SHAPE_ROUND) {
        UI.createWidget(hmUI.widget.FILL_RECT, {
            x: 0,
            y: y + button.H,
            w: screenWidth,
            h: 20 * (buttonsCount - 1)
        })
    }
}

export function changeSettings(key, val) {
    const settings = localStorage.getItem('settings', {})
    settings[key] = val
    localStorage.setItem('settings', settings)
}