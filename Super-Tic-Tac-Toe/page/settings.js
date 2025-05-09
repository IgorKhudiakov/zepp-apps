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
      w: SCREEN_WIDTH - M * 2,
      h: px(40),
      text: getText('xColor'),
      text_size: px(32),
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    content.H += px(60)

    function changeColors(bgs, widgets, widgetFg, currentI) {
      for (let i = 0; i < widgets.length; i++) {
        widgets[i].setProperty(prop.SRC, i == currentI ? '' : 'marks/mask.png')
        if (i == currentI) {
          widgetFg.setProperty(prop.X, bgs[i].getProperty(prop.X) - 1)
          widgetFg.setProperty(prop.Y, bgs[i].getProperty(prop.Y) - 1)
        }
      }
    }

    let colorSize = px(70)
    let colorX = 0
    let xWidgetBgs = []
    let xWidgetSelectors = []

    COLORS.marks.forEach((v, i) => {
      xWidgetBgs[i] = createWidget(widget.FILL_RECT, {
        x: M + colorX + 1,
        y: content.H + 1,
        w: colorSize - 2,
        h: colorSize - 2,
        radius: Math.floor(colorSize / 2),
        color: v
      })
      xWidgetSelectors[i] = createWidget(widget.IMG, {
        x: M + colorX,
        y: content.H,
        src: 'marks/mask.png'
      })
      xWidgetSelectors[i].addEventListener(event.CLICK_DOWN, () => {
        if (settings?.xColor != i) {
          settings.xColor = i
          localStorage.setItem('settings', settings)
          changeColors(oWidgetBgs, xWidgetSelectors, oWidgetsFg, i)
        }
      })
      colorX += colorSize + px(10)
      if (i < COLORS.marks.length - 1 && colorX > content.W - colorSize) {
        colorX = 0
        content.H += colorSize + px(10)
      }
    })
    let xWidgetsFg = createWidget(widget.IMG, {
      x: 0,
      y: 0,
      src: 'marks/lock.png'
    })
    content.H += colorSize + px(40)

    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: px(40),
      text: getText('oColor'),
      text_size: px(32),
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    content.H += px(60)

    colorX = 0
    let oWidgetBgs = []
    let oWidgetSelectors = []

    COLORS.marks.forEach((v, i) => {
      oWidgetBgs[i] = createWidget(widget.FILL_RECT, {
        x: M + colorX + 1,
        y: content.H + 1,
        w: colorSize - 2,
        h: colorSize - 2,
        radius: Math.floor(colorSize / 2),
        color: v
      })
      oWidgetSelectors[i] = createWidget(widget.IMG, {
        x: M + colorX,
        y: content.H,
        src: 'marks/mask.png'
      })
      oWidgetSelectors[i].addEventListener(event.CLICK_DOWN, () => {
        if (settings?.oColor != i) {
          settings.oColor = i
          localStorage.setItem('settings', settings)
          changeColors(xWidgetBgs, oWidgetSelectors, xWidgetsFg, i)
        }
      })
      colorX += colorSize + px(10)
      if (i < COLORS.marks.length - 1 && colorX > content.W - colorSize) {
        colorX = 0
        content.H += colorSize + px(10)
      }
    })
    let oWidgetsFg = createWidget(widget.IMG, {
      x: 0,
      y: 0,
      src: 'marks/lock.png'
    })

    changeColors(oWidgetBgs, xWidgetSelectors, oWidgetsFg, settings?.xColor ?? 1)
    changeColors(xWidgetBgs, oWidgetSelectors, xWidgetsFg, settings?.oColor ?? 0)

    content.H += colorSize + px(40)

    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2 - checkbox.W - px(10),
      h: px(40),
      text: getText('hideHints'),
      text_size: px(32),
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    createWidget(widget.TEXT, {
      x: M,
      y: content.H + px(45),
      w: SCREEN_WIDTH - M * 2 - checkbox.W - px(10),
      h: px(20),
      text: getText('hideHintsDesc'),
      text_size: px(16),
      align_v: align.CENTER_V,
      color: COLORS.secondary
    })
    createCheckBox({ x: SCREEN_WIDTH - M - checkbox.W, y: content.H + px(5), param: 'hintsHidden' })
    content.H += px(65) + px(40)

    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2 - checkbox.W - px(10),
      h: px(40),
      text: getText('autoBack'),
      text_size: px(32),
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    createWidget(widget.TEXT, {
      x: M,
      y: content.H + px(45),
      w: SCREEN_WIDTH - M * 2 - checkbox.W - px(10),
      h: px(20),
      text: getText('autoBackDesc'),
      text_size: px(16),
      align_v: align.CENTER_V,
      color: COLORS.secondary
    })
    createCheckBox({ x: SCREEN_WIDTH - M - checkbox.W, y: content.H + px(5), param: 'autoBack' })
    content.H += px(65)

    createSpace({ y: content.H, h: px(isRound ? 150 : 20) })
  }
})