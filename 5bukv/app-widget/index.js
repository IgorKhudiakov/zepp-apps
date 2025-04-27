import { createWidget, widget, prop, align, setAppWidgetSize, getAppWidgetSize } from '@zos/ui'
import { getLanguage } from '@zos/settings'
import { COLORS } from '../utils/constants'
import { getText } from '@zos/i18n'
import { push } from '@zos/router'
import { localStorage } from '@zos/storage'

const lang = getLanguage() == 4 ? 'ru' : 'en'

const card = {
  X: getAppWidgetSize().margin,
  W: getAppWidgetSize().w,
  P: 16,
  R: getAppWidgetSize().radius
}

const playButton = {
  W: 80,
  H: 80,
  R: 40,
  M: 20,
  iW: 50,
  iH: 50
}
card.minH = playButton.H + card.P * 2

const title = {
  text: {
    ru: ['5', 'Б', 'У', 'К', 'В'],
    en: ['5', 'L', 'T', 'R', 'S']
  },
  M: 10
}
title.H = Math.floor((card.W - (title.text[lang].length - 1) * title.M - 2 * card.P - playButton.W - playButton.M) / title.text[lang].length)
title.R = Math.floor(title.H / 4)

let subtitle = {}

AppWidget({
  updateSubtitle() {
    const words = localStorage.getItem('words', {})
    subtitle.setProperty(prop.TEXT, `${getText('level').toUpperCase()} ${Object.keys(words).length + 1}`)
  },
  build() {
    const bg = createWidget(widget.FILL_RECT, {
      x: card.X,
      y: 0,
      w: card.W,
      h: 0,
      radius: card.R,
      color: COLORS.green
    })
    card.H = card.P

    subtitle = createWidget(widget.TEXT, {
      x: card.X + card.P + 0.2 * title.H,
      y: card.H,
      w: card.W - 2 * card.P - playButton.W,
      h: 32,
      size: 24,
      text: '',
      color: COLORS.primary
    })
    this.updateSubtitle()
    card.H += 32

    for (let i = 0; i < title.text[lang].length; i++) {
      createWidget(widget.FILL_RECT, {
        x: card.X + card.P + (title.H + title.M) * i,
        y: card.H,
        w: title.H,
        h: title.H,
        radius: title.R,
        color: 0x33ab33
      })
      createWidget(widget.TEXT, {
        x: card.X + card.P + (title.H + title.M) * i,
        y: card.H,
        w: title.H,
        h: title.H,
        text: title.text[lang][i],
        text_size: Math.floor(title.H * 0.8),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        color: COLORS.primary
      })
    }
    card.H += title.H + card.P
    if (card.H < card.minH) card.H = card.minH

    createWidget(widget.FILL_RECT, {
      x: card.X + card.W - card.P - playButton.W,
      y: (card.H - playButton.H) / 2,
      w: playButton.W,
      h: playButton.H,
      radius: playButton.H / 2,
      color: 0x33ab33
    })
    createWidget(widget.BUTTON, {
      x: card.X + card.W - card.P - (playButton.W + playButton.iW) / 2,
      y: (card.H - playButton.iH) / 2,
      w: playButton.iW,
      h: playButton.iH,
      normal_src: 'image/play.png',
      press_src: 'image/play.png',
      click_func: () => {
        push({
          url: 'page/index'
        })
      }
    })

    bg.setProperty(prop.H, card.H)
    setAppWidgetSize({
      h: card.H
    })
  },
  onResume() {
    this.updateSubtitle()
  }
})