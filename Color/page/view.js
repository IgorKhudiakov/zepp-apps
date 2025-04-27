import { setStatusBarVisible, createWidget, widget, align, prop, event } from '@zos/ui'
import { localStorage } from '@zos/storage'

import { isRound, SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, saveList, formatColor } from '../utils/constants'
import { getText } from '@zos/i18n'

const schemes = localStorage.getItem('schemes', {})
const editParam = {}
const widgets = {}

Page({
  onInit(options) {
    setStatusBarVisible(false)
    if (typeof options == 'string') options = JSON.parse(options)

    function editColor(type) {
      editContainer.setProperty(prop.VISIBLE, true)
      editParam.type = type
      editParam.color = schemes[options.id][type].color
      editParam.visible = schemes[options.id][type].visible
      editText.setProperty(prop.TEXT, `# ${editParam.color}`)
      editTextDesc.setProperty(prop.TEXT, getText(`${type}desc`))
    }

    function editVal(key) {
      if (key == 'visible') {
        editParam.visible = !editParam.visible
        schemes[options.id][editParam.type].visible = editParam.visible
        widgets[editParam.type].setProperty(prop.ALPHA, editParam.visible * 255)
        saveList(schemes)
        return
      } else if (key == 'apply') {
        editContainer.setProperty(prop.VISIBLE, false)
        return
      } else if (key == 'backspace') {
        if (editParam.color.length > 0) editParam.color = editParam.color.substring(0, editParam.color.length - 1)
        else return
      } else {
        if (editParam.color.length < 6) editParam.color += key
        else return
      }
      editText.setProperty(prop.TEXT, `# ${editParam.color}`)
      schemes[options.id][editParam.type].color = editParam.color
      saveList(schemes)

      widgets[editParam.type].setProperty(prop.MORE, {
        x: widgets[editParam.type].getProperty(prop.X),
        y: widgets[editParam.type].getProperty(prop.Y),
        w: widgets[editParam.type].getProperty(prop.W),
        h: widgets[editParam.type].getProperty(prop.H),
        color: formatColor(editParam.color)
      })
    }

    widgets.bg = createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT,
      radius: isRound ? SCREEN_WIDTH / 2 : 86,
      color: formatColor(schemes[options.id].bg.color),
      alpha: schemes[options.id].bg.visible * 255
    })
    widgets.bg.addEventListener(event.CLICK_UP, () => editColor('bg'))

    widgets.fg = createWidget(widget.FILL_RECT, {
      x: SCREEN_WIDTH / 6,
      y: SCREEN_HEIGHT / 6,
      w: SCREEN_WIDTH / 3 * 2,
      h: SCREEN_HEIGHT / 3 * 2,
      radius: isRound ? SCREEN_WIDTH / 3 : Math.floor(86 / 3),
      color: formatColor(schemes[options.id].fg.color),
      alpha: schemes[options.id].fg.visible * 255
    })
    widgets.fg.addEventListener(event.CLICK_UP, () => editColor('fg'))

    widgets.text = createWidget(widget.FILL_RECT, {
      x: SCREEN_WIDTH / 3,
      y: SCREEN_HEIGHT / 3,
      w: SCREEN_WIDTH / 3,
      h: SCREEN_HEIGHT / 3,
      radius: isRound ? SCREEN_WIDTH / 6 : Math.floor(86 / 6),
      color: formatColor(schemes[options.id].text.color),
      alpha: schemes[options.id].text.visible * 255
    })
    widgets.text.addEventListener(event.CLICK_UP, () => editColor('text'))

    const editContainer = createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    })

    const button = {
      W: 50,
      H: 50,
      R: 20,
      M: 4
    }
    let buttonsCount = 0
    for (let width = SCREEN_WIDTH; width > 0; width) {
      if (width - button.W > 0) buttonsCount++
      width -= (button.W + button.M)
    }
    const keyboard = ['A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'backspace', 'visible', 'apply']
    let keys = []
    for (let i = 0; i < keyboard.length; i) {
      keys.push(keyboard.slice(i, i + buttonsCount))
      i += buttonsCount
      if (isRound) buttonsCount--
    }

    let centerX = SCREEN_WIDTH / 2
    let topY = SCREEN_HEIGHT - keys.length * (button.H + button.M) - (isRound || keys[keys.length - 1].length == buttonsCount ? 30 : 10)
    editContainer.createWidget(widget.FILL_RECT, {
      x: (SCREEN_WIDTH - 200) / 2,
      y: isRound ? 50 : 20,
      w: 200,
      h: 60,
      radius: 20,
      alpha: 100
    })
    const editText = editContainer.createWidget(widget.TEXT, {
      x: (SCREEN_WIDTH - 200) / 2,
      y: isRound ? 50 : 20,
      w: 200,
      h: 40,
      color: COLORS.primary,
      text: '# FFFFFF',
      text_size: 32,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
    })
    const editTextDesc = editContainer.createWidget(widget.TEXT, {
      x: (SCREEN_WIDTH - 200) / 2,
      y: isRound ? 88 : 58,
      w: 200,
      h: 20,
      color: COLORS.secondary,
      text: '',
      text_size: 14,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
    })
    editContainer.createWidget(widget.FILL_RECT, {
      x: 0,
      y: topY - 10,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT - topY + 10,
      alpha: 100
    })
    for (let i = 0; i < keys.length; i++) {
      for (let j = 0; j < keys[i].length; j++) {
        let keyText = ''
        switch (keys[i][j]) {
          case 'backspace':
            keyText = '⇦'
            break
          case 'apply':
            keyText = '╳'
            break
          case 'visible':
            keyText = '◉'
            break
          default:
            keyText = keys[i][j]
            break
        }
        editContainer.createWidget(widget.BUTTON, {
          x: centerX - keys[i].length * (button.W + button.M) / 2 + button.M / 2 + (button.W + button.M) * j,
          y: topY + (button.H + button.M) * i,
          w: button.W,
          h: button.H,
          radius: button.R,
          text: keyText,
          color: COLORS.primary,
          normal_color: "0x111111",
          press_color: "0x222222",
          click_func: () => { editVal(keys[i][j]) }
        })
      }
    }

    editContainer.setProperty(prop.VISIBLE, false)
  }
})
