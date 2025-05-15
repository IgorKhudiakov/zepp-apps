import { setStatusBarVisible, createWidget, widget, align, event, prop } from "@zos/ui"
import { getText } from "@zos/i18n"
import { localStorage } from "@zos/storage"
import { px } from "@zos/utils"

import { SCREEN_WIDTH, SCREEN_HEIGHT, isRound, COLORS, createSpace, checkbox, createCheckBox } from "../utils/constants"

let settings = localStorage.getItem('settings', {})

Page({
  onInit() {
    setStatusBarVisible(false)

    let startY = px(isRound ? 50 : 20)
    let M = px(isRound ? 36 : 32)
    let content = {
      W: SCREEN_WIDTH - M * 2,
      H: startY
    }

    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: px(50),
      text: getText('settings'),
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    content.H += px(80)

    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2 - checkbox.W - px(10),
      h: px(40),
      text: getText('hideInactive'),
      text_size: px(32),
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    createWidget(widget.TEXT, {
      x: M,
      y: content.H + px(45),
      w: SCREEN_WIDTH - M * 2 - checkbox.W - px(10),
      h: px(20),
      text: getText('hideInactiveDesc'),
      text_size: px(16),
      align_v: align.CENTER_V,
      color: COLORS.secondary
    })
    createCheckBox({ x: SCREEN_WIDTH - M - checkbox.W, y: content.H + px(5), param: 'hideInactive' })
    content.H += px(65)

    createSpace({ y: content.H, h: px(isRound ? 150 : 20) })
  }
})