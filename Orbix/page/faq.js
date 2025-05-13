import { setStatusBarVisible, createWidget, widget, align, getTextLayout, text_style } from "@zos/ui"
import { getText } from "@zos/i18n"
import { px } from "@zos/utils"

import { SCREEN_WIDTH, SCREEN_HEIGHT, isRound, COLORS, createSpace } from "../utils/constants"

Page({
  onInit() {
    setStatusBarVisible(false)

    let startY = px(isRound ? 50 : 20)
    let M = px(isRound ? 40 : 30)
    let content = {
      W: SCREEN_WIDTH - M * 2,
      H: startY
    }

    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: px(50),
      text: getText('faq'),
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    content.H += px(80)

    let textHeight = getTextLayout(getText('startGameText'), { text_size: px(24), text_width: SCREEN_WIDTH - M * 2, wrapped: true}).height
    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: textHeight,
      text: getText('startGameText'),
      text_size: px(24),
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      color: COLORS.primary
    })
    content.H += textHeight + px(10)

    textHeight = getTextLayout(getText('currentPlayerText'), { text_size: px(24), text_width: SCREEN_WIDTH - M * 2, wrapped: true}).height
    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: textHeight,
      text: getText('currentPlayerText'),
      text_size: px(24),
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      color: COLORS.primary
    })
    content.H += textHeight + px(20)

    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: px(40),
      text: getText('step', 1),
      text_size: px(24),
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    content.H += px(40)

    textHeight = getTextLayout(getText('donotdo'), { text_size: px(18), text_width: SCREEN_WIDTH - M * 2, wrapped: true}).height
    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: textHeight,
      text: getText('donotdo'),
      text_size: px(18),
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      color: COLORS.secondary
    })
    content.H += textHeight + px(10)

    textHeight = getTextLayout(getText('step1Text'), { text_size: px(24), text_width: SCREEN_WIDTH - M * 2, wrapped: true}).height
    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: textHeight,
      text: getText('step1Text'),
      text_size: px(24),
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      color: COLORS.primary
    })
    content.H += textHeight + px(10)

    let imgW = SCREEN_WIDTH - M * 2
    if (imgW > 400) imgW = 400
    let imgH = imgW / 400 * 109
    console.log(imgH)
    
    createWidget(widget.IMG, {
      x: M,
      y: content.H,
      w: imgW,
      h: imgH,
      auto_scale: true,
      src: 'steps/1.png'
    })
    content.H += imgH + px(20)

    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: px(40),
      text: getText('step', 2),
      text_size: px(24),
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    content.H += px(40)

    textHeight = getTextLayout(getText('step2Text'), { text_size: px(24), text_width: SCREEN_WIDTH - M * 2, wrapped: true}).height
    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: textHeight,
      text: getText('step2Text'),
      text_size: px(24),
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      color: COLORS.primary
    })
    content.H += textHeight + px(10)
    
    createWidget(widget.IMG, {
      x: M,
      y: content.H,
      w: imgW,
      h: imgH,
      auto_scale: true,
      src: 'steps/2.png'
    })
    content.H += imgH + px(20)

    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: px(40),
      text: getText('step', 3),
      text_size: px(24),
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    content.H += px(40)

    textHeight = getTextLayout(getText('step3Text'), { text_size: px(24), text_width: SCREEN_WIDTH - M * 2, wrapped: true}).height
    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: textHeight,
      text: getText('step3Text'),
      text_size: px(24),
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      color: COLORS.primary
    })
    content.H += textHeight + px(10)
    
    createWidget(widget.IMG, {
      x: M,
      y: content.H,
      w: imgW,
      h: imgH,
      auto_scale: true,
      src: 'steps/3.png'
    })
    content.H += imgH + px(30)
    
    textHeight = getTextLayout(getText('endGameText'), { text_size: px(24), text_width: SCREEN_WIDTH - M * 2, wrapped: true}).height
    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: textHeight,
      text: getText('endGameText'),
      text_size: px(24),
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      color: COLORS.primary
    })
    content.H += textHeight + px(10)
    
    textHeight = getTextLayout(getText('endGameText2'), { text_size: px(24), text_width: SCREEN_WIDTH - M * 2, wrapped: true}).height
    createWidget(widget.TEXT, {
      x: M,
      y: content.H,
      w: SCREEN_WIDTH - M * 2,
      h: textHeight,
      text: getText('endGameText2'),
      text_size: px(24),
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      color: COLORS.primary
    })
    content.H += textHeight + px(10)
    
    imgH = imgW / 400 * 135
    createWidget(widget.IMG, {
      x: M,
      y: content.H,
      w: imgW,
      h: imgH,
      auto_scale: true,
      src: 'steps/end.png'
    })
    content.H += imgH

    createSpace({ y: content.H, h: px(isRound ? 150 : 50) })
  }
})