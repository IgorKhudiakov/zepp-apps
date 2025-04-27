import { getText } from '@zos/i18n'
import { setStatusBarVisible, createWidget, widget, align, text_style, prop, getTextLayout, deleteWidget } from '@zos/ui'
import { localStorage } from '@zos/storage'
import { Time } from '@zos/sensor'
import { push } from '@zos/router'
import { createModal, MODAL_CONFIRM } from '@zos/interaction'

import { isRound, SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, saveList, SCHEME_PATTERN, formatColor } from '../utils/constants'
import { px } from '@zos/utils'

let schemes = localStorage.getItem('schemes', {})
const time = new Time()
let margin = isRound ? 50 : 32
let contentH = isRound ? 20 : 10
const groupParams = {
  X: margin,
  W: SCREEN_WIDTH - 2 * margin,
  H: 0
}
let colorsGroup = {}
const listParams = {
  X: margin,
  W: groupParams.W,
  H: 50,
  M: 20,
  R: 20,
  G: 10,
  S: 24
}

const button = {
  W: 64,
  H: 64,
  R: 32,
  size: 30
}

Page({
  build() {
    setStatusBarVisible(false)

    function renderList() {
      deleteWidget(colorsGroup)
      colorsGroup = createWidget(widget.GROUP, {
        x: groupParams.X,
        y: groupParams.Y,
        w: groupParams.W,
        h: groupParams.H
      })
      groupParams.H = 0

      let keys = Object.keys(schemes)
      let maxMarker = ''
      maxMarker = maxMarker.padEnd(`${keys.length}`.length, '4') + '.'
      let maxMarkerW = getTextLayout(maxMarker, { text_size: listParams.S, text_width: 0 }).width + listParams.G
      listParams.X = maxMarkerW
      listParams.W = groupParams.W - listParams.X - listParams.H - listParams.G

      for (const key in schemes) {
        let i = keys.indexOf(key)
        colorsGroup.createWidget(widget.TEXT, {
          x: 0,
          y: (listParams.H + listParams.M) * i,
          w: maxMarkerW,
          h: listParams.H,
          text: `${i + 1}.`,
          text_size: listParams.S,
          align_h: align.LEFT,
          align_v: align.CENTER_V,
          text_style: text_style.NONE,
          color: COLORS.primary
        })

        let elemsCount = schemes[key].bg.visible + schemes[key].fg.visible + schemes[key].text.visible
        let maxElemW = Math.floor(listParams.W / elemsCount)
        
        if (schemes[key].bg.visible) {
          colorsGroup.createWidget(widget.FILL_RECT, {
            x: listParams.X,
            y: (listParams.H + listParams.M) * i,
            w: listParams.W,
            h: listParams.H,
            radius: listParams.R,
            color: formatColor(schemes[key].bg.color)
          })
        }
        if (schemes[key].fg.visible) {
          colorsGroup.createWidget(widget.FILL_RECT, {
            x: listParams.X + schemes[key].bg.visible * maxElemW,
            y: (listParams.H + listParams.M) * i,
            w: listParams.W - schemes[key].bg.visible * maxElemW,
            h: listParams.H,
            radius: listParams.R,
            color: formatColor(schemes[key].fg.color)
          })
        }
        if (schemes[key].text.visible) {
          colorsGroup.createWidget(widget.TEXT, {
            x: listParams.X + (schemes[key].bg.visible + schemes[key].fg.visible) * maxElemW,
            y: (listParams.H + listParams.M) * i,
            w: listParams.W - (schemes[key].bg.visible + schemes[key].fg.visible) * maxElemW,
            h: listParams.H,
            text: getText('textExample'),
            text_size: listParams.S,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
            color: formatColor(schemes[key].text.color)
          })
        }
        colorsGroup.createWidget(widget.BUTTON, {
          x: listParams.X,
          y: (listParams.H + listParams.M) * i,
          w: listParams.W,
          h: listParams.H,
          normal_src: '',
          press_src: '',
          click_func: () => {
            push({
              url: 'page/view',
              params: {
                id: key
              }
            })
          },
          longpress_func: () => {
            createModal({
              content: getText("removeText", i + 1),
              onClick: (keyObj) => {
                const { type } = keyObj
                if (type === MODAL_CONFIRM) {
                  updateList('remove', key)
                }
              }
            })
          }
        })

        colorsGroup.createWidget(widget.FILL_RECT, {
          x: listParams.X + listParams.W + listParams.G,
          y: (listParams.H + listParams.M) * i,
          w: listParams.H,
          h: listParams.H,
          radius: listParams.R,
          color: COLORS.normal
        })
        colorsGroup.createWidget(widget.BUTTON, {
          x: listParams.X + listParams.W + listParams.G,
          y: (listParams.H + listParams.M) * i,
          w: listParams.H,
          h: listParams.H,
          normal_src: 'image/copy.png',
          press_src: 'image/copy_press.png',
          click_func: () => { updateList('clone', key) }
        })

        groupParams.H += listParams.H + listParams.M
      }
      groupParams.H += 20
      
      colorsGroup.createWidget(widget.BUTTON, {
        x: (groupParams.W - button.W) / 2,
        y: groupParams.H,
        w: button.W,
        h: button.H,
        text: '⊕',
        text_size: button.size,
        color: COLORS.primary,
        normal_color: COLORS.normal,
        press_color: COLORS.press,
        radius: button.R,
        click_func: () => {
          updateList()
        }
      })
      groupParams.H += 10
      colorsGroup.createWidget(widget.FILL_RECT, {
        x: (groupParams.W - button.W) / 2,
        y: groupParams.H + button.H,
        w: groupParams.W,
        h: isRound ? 50 : 20
      })
    }

    function updateList(action, id) {
      if (action == 'remove') delete schemes[id]
      else if (action == 'clone') {
        const entries = Object.entries(schemes).flatMap(([key, val]) => 
          key == id
            ? [[key, val], [time.getTime(), val]] 
            : [[key, val]]
        )
        schemes = Object.fromEntries(entries)
      } else {
        let id = time.getTime()
        schemes[id] = SCHEME_PATTERN
      }
      saveList(schemes)
      renderList()
    }

    createWidget(widget.BUTTON, {
      x: SCREEN_WIDTH / 2 - 80,
      y: contentH,
      w: button.W,
      h: button.H,
      text: '?',
      text_size: button.size,
      radius: button.R,
      normal_color: COLORS.normal,
      press_color: COLORS.press,
      click_func: () => {
        push({
          url: 'page/faq'
        })
      }
    })
    createWidget(widget.BUTTON, {
      x: SCREEN_WIDTH / 2 + 80 - button.W,
      y: contentH,
      w: px(button.W),
      h: px(button.H),
      text: 'ⓘ',
      text_size: button.size,
      radius: button.R,
      normal_color: COLORS.normal,
      press_color: COLORS.press,
      click_func: () => {
        push({
          url: 'page/info'
        })
      }
    })
    contentH += 80

    createWidget(widget.TEXT, {
      x: 0,
      y: contentH,
      w: SCREEN_WIDTH,
      h: 60,
      text: getText('colorSchemes'),
      text_size: 24,
      color: COLORS.primary,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    contentH += 80
    groupParams.Y = contentH

    renderList()
  }
})
