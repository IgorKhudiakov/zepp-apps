import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { getText } from "@zos/i18n"
import { createModal, MODAL_CONFIRM } from "@zos/interaction"
import { push, replace } from "@zos/router"
import { localStorage } from "@zos/storage"
import hmUI, { align, createWidget, deleteWidget, event, prop, widget } from "@zos/ui"
import { px } from "@zos/utils"

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, screenShape, deviceSource } = getDeviceInfo()
export const isRound = screenShape == SCREEN_SHAPE_ROUND

let settings = localStorage.getItem('settings', {})

export const SESSION = {
  table: Array.from(Array(4), () => Array.from(Array(4), () => 0)),
  white: {
    count: 8
  },
  black: {
    count: 8
  },
  button: {
    count: 0
  },
  active: {
    row: -1,
    col: -1,
    val: 0
  },
  current: '',
  step: 2 // 1 - move, 2 - put, 3 - press main button
}

export const COLORS = {
  primary: 0xffffff,
  secondary: 0xaaaaaa,
  accent: 0x005eff,
  table: {
    bg: 0x45301f,
    bg2: 0x875e3d,
  },
  marks: {
    white: 0xffffff,
    black: 0x000000
  }
}

export const checkbox = {
  W: px(80),
  H: px(54),
  R: px(20),
  bg: {
    onColor: 0x005eff,
    offColor: 0x222222
  },
  fg: {
    W: px(32),
    H: px(32),
    R: px(10),
    onColor: COLORS.primary,
    offColor: 0x666666
  }
}
checkbox.X = SCREEN_WIDTH - M - checkbox.W
checkbox.R = checkbox?.R ?? Math.floor(checkbox.H / 2)
checkbox.bg.onColor = checkbox.bg?.onColor ?? checkbox.bg.offColor
checkbox.fg.W = checkbox.fg?.W ?? checkbox.fg?.H ?? checkbox.H
checkbox.fg.H = checkbox.fg?.H ?? checkbox.fg.W
checkbox.fg.R = checkbox.fg?.R ?? Math.floor(Math.min(checkbox.fg.W, checkbox.fg.H) / 2)
checkbox.fg.xOff = (checkbox.H - checkbox.fg.H) / 2
checkbox.fg.xOn = checkbox.W - (checkbox.H - checkbox.fg.H) / 2 - checkbox.fg.W
checkbox.fg.Y = (checkbox.H - checkbox.fg.H) / 2
checkbox.fg.offColor = checkbox.fg?.offColor ?? checkbox.fg.onColor

export function createCheckBox({ UI = hmUI, x, y, param }) {
  let bool = !!settings[param]
  const checkboxGroup = UI.createWidget(widget.GROUP, {
    x: x,
    y: y,
    w: checkbox.W,
    h: checkbox.H
  })
  const checkboxBg = checkboxGroup.createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: checkbox.W,
    h: checkbox.H,
    radius: checkbox.R,
    color: bool ? checkbox.bg.onColor : checkbox.bg.offColor
  })
  const checkboxFg = checkboxGroup.createWidget(widget.FILL_RECT, {
    x: bool ? checkbox.fg.xOn : checkbox.fg.xOff,
    y: checkbox.fg.Y,
    w: checkbox.fg.W,
    h: checkbox.fg.H,
    radius: checkbox.fg.R,
    color: bool ? checkbox.fg.onColor : checkbox.fg.offColor
  })
  checkboxGroup.addEventListener(event.CLICK_DOWN, () => {
    bool = !bool
    checkboxBg.setProperty(prop.COLOR, bool ? checkbox.bg.onColor : checkbox.bg.offColor)
    checkboxFg.setProperty(prop.MORE, {
      x: bool ? checkbox.fg.xOn : checkbox.fg.xOff,
      y: checkbox.fg.Y,
      w: checkbox.fg.W,
      h: checkbox.fg.H,
      color: bool ? checkbox.fg.onColor : checkbox.fg.offColor
    })
    settings[param] = bool
    localStorage.setItem('settings', settings)
  })
}

export function createSpace({ UI = hmUI, y = 0, h = px(isRound ? 50 : 20) }) {
  return UI.createWidget(widget.FILL_RECT, {
    x: 0,
    y: y,
    w: SCREEN_WIDTH,
    h: h,
    alpha: 0
  })
}

function newGame() {
  localStorage.setItem('session', JSON.parse(JSON.stringify(SESSION)))
  replace({
    url: 'page/index'
  })
}

export class Menu {
  constructor() {
    this.group = {}
    this.bg = {}
    this.buttons = ['resume', 'newGame', 'faq', 'info']
    this.H = 0
    this.buttonsW = px(300)
    this.buttonsH = px(50)
    this.buttonsM = px(15)
    this.buttonsNormalColor = 0x222222
    this.buttonsPressColor = 0x333333
  }

  show(session) {
    this.group = createWidget(widget.VIEW_CONTAINER, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    })

    this.bg = this.group.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT,
      alpha: 150
    })
    this.H = px(20)

    this.group.createWidget(widget.BUTTON, {
      x: (SCREEN_WIDTH - px(50)) / 2,
      y: this.H,
      w: px(50),
      h: px(30),
      normal_src: 'buttons/hide_menu_gray.png',
      press_src: 'buttons/hide_menu.png',
      click_func: () => this.remove()
    })
    this.H += px(60)

    this.group.createWidget(widget.TEXT, {
      x: 0,
      y: this.H,
      w: SCREEN_WIDTH,
      h: px(40),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: getText('menu'),
      text_size: px(32),
      color: COLORS.primary
    })
    this.H += px(60)

    this.buttons.forEach((v) => {
      this.group.createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - this.buttonsW) / 2,
        y: this.H,
        w: this.buttonsW,
        h: this.buttonsH,
        radius: Math.floor(this.buttonsH / 4),
        text: getText(v),
        text_size: px(24),
        normal_color: this.buttonsNormalColor,
        press_color: this.buttonsPressColor,
        click_func: () => {
          switch (v) {
            case 'resume':
              this.remove()
              break
            case 'newGame':
              createModal({
                content: getText(v + 'Text'),
                onClick: (keyObj) => {
                  const { type } = keyObj
                  if (type === MODAL_CONFIRM) newGame(session)
                }
              })
              break
            default:
              push({ url: `page/${v}` })
              break
          }
        }
      })
      this.H += this.buttonsH + this.buttonsM
    })

    createSpace({ UI: this.group, y: this.H })
    this.H += px(isRound ? 50 : 20)

    this.bg.setProperty(prop.MORE, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: this.H <= SCREEN_HEIGHT ? SCREEN_HEIGHT : this.H
    })

    this.group.setProperty(prop.ANIM, {
      anim_steps: [{
        anim_rate: 'easeout',
        anim_duration: 500,
        anim_from: SCREEN_HEIGHT,
        anim_to: 0,
        anim_prop: prop.POS_Y
      }]
    })
  }

  remove() {
    this.group.setProperty(prop.ANIM, {
      anim_steps: [{
        anim_rate: 'easeout',
        anim_duration: 500,
        anim_from: 0,
        anim_to: SCREEN_HEIGHT,
        anim_prop: prop.POS_Y,
      }],
      anim_complete_func: () => deleteWidget(this.group)
    })
  }
}

const victoryMarkSize = px(100)

export function showVictory(winners) {
  const victoryGroup = createWidget(widget.GROUP, {
    x: 0,
    y: 0,
    w: SCREEN_WIDTH,
    h: SCREEN_HEIGHT
  })
  victoryGroup.createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: SCREEN_WIDTH,
    h: SCREEN_HEIGHT,
    alpha: 150
  })
  let keys = Object.keys(winners)
  if (keys.length == 1) {
    victoryGroup.createWidget(widget.FILL_RECT, {
      x: (SCREEN_WIDTH - victoryMarkSize) / 2,
      y: SCREEN_HEIGHT / 2 - victoryMarkSize,
      w: victoryMarkSize,
      h: victoryMarkSize,
      radius: Math.floor(victoryMarkSize / 2),
      color: COLORS.marks['white']
    })
    if (keys[0] == 'black') {
      victoryGroup.createWidget(widget.FILL_RECT, {
        x: (SCREEN_WIDTH - victoryMarkSize) / 2 + px(5),
        y: SCREEN_HEIGHT / 2 - victoryMarkSize + px(5),
        w: victoryMarkSize - px(10),
        h: victoryMarkSize - px(10),
        radius: Math.floor(victoryMarkSize / 2) - px(5),
        color: COLORS.marks.black
      })
    }
    victoryGroup.createWidget(widget.TEXT, {
      x: (SCREEN_WIDTH - px(300)) / 2,
      y: SCREEN_HEIGHT / 2 + px(20),
      w: px(300),
      h: px(50),
      text: getText('victoryText', getText(keys[0])),
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
  } else {
    victoryGroup.createWidget(widget.FILL_RECT, {
      x: SCREEN_WIDTH / 2 - Math.floor(victoryMarkSize / 5 * 4),
      y: SCREEN_HEIGHT / 2 - victoryMarkSize,
      w: victoryMarkSize,
      h: victoryMarkSize,
      radius: Math.floor(victoryMarkSize / 2),
      color: COLORS.marks.white
    })
    victoryGroup.createWidget(widget.FILL_RECT, {
      x: SCREEN_WIDTH / 2 - Math.floor(victoryMarkSize / 5),
      y: SCREEN_HEIGHT / 2 - victoryMarkSize,
      w: victoryMarkSize,
      h: victoryMarkSize,
      radius: Math.floor(victoryMarkSize / 2),
      color: COLORS.marks.white
    })
    victoryGroup.createWidget(widget.FILL_RECT, {
      x: SCREEN_WIDTH / 2 - Math.floor(victoryMarkSize / 5) + px(5),
      y: SCREEN_HEIGHT / 2 - victoryMarkSize + px(5),
      w: victoryMarkSize - px(10),
      h: victoryMarkSize - px(10),
      radius: Math.floor((victoryMarkSize - px(10)) / 2),
      color: COLORS.marks.black
    })
    victoryGroup.createWidget(widget.TEXT, {
      x: (SCREEN_WIDTH - px(300)) / 2,
      y: SCREEN_HEIGHT / 2 + px(20),
      w: px(300),
      h: px(50),
      text: getText('victoryText2'),
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
  }
  victoryGroup.createWidget(widget.BUTTON, {
    x: (SCREEN_WIDTH - px(250)) / 2,
    y: SCREEN_HEIGHT / 2 + px(90),
    w: px(250),
    h: px(50),
    text: getText('newGame'),
    text_size: px(32),
    color: COLORS.primary,
    radius: px(15),
    normal_color: COLORS.table.bg2,
    press_color: COLORS.table.bg,
    click_func: () => newGame()
  })
  let victoryVisible = true
  let hideButton = createWidget(widget.IMG, {
    x: (SCREEN_WIDTH - px(64)) / 2,
    y: px(20),
    src: 'buttons/hide.png'
  })
  hideButton.addEventListener(event.CLICK_DOWN, () => {
    victoryVisible = !victoryVisible
    hideButton.setProperty(prop.SRC, `buttons/${victoryVisible ? 'hide' : 'view'}.png`)
    victoryGroup.setProperty(prop.VISIBLE, victoryVisible)
  })
}

/**
 * Returns wins
 * @param {Array}
 * @returns
 */
export function getGameResult(table) {
  let sum = 0
  let elem = 0
  let victory = {}
  const victorySum = 8

  for (let i = 0; i < table.length; i++) {
    sum = table[i].reduce((currentSum, val) => { // Горизонтальный перебор
      elem = val
      return currentSum += val
    })
    if (Math.abs(sum) == victorySum) {
      victory[(elem == 2 ? 'black' : 'white')] = {
        type: 'row'
      }
    }
  }

  elem = 0
  for (let i = 0; i < table.length; i++) { // Вертикальный перебор
    sum = 0
    for (let j = 0; j < table[i].length; j++) {
      elem = table[j][i]
      sum += elem
    }
    if (Math.abs(sum) == victorySum) {
      victory[(elem == 2 ? 'black' : 'white')] = {
        type: 'row'
      }
    }
  }

  sum = 0
  elem = 0
  for (let i = 0; i < table.length; i++) { // Диагональный слева направо перебор
    elem = table[i][i]
    sum += elem
  }
  if (Math.abs(sum) == victorySum) {
    victory[(elem == 2 ? 'black' : 'white')] = {
      type: 'dltr'
    }
  }

  elem = 0
  sum = 0
  for (let i = 0; i < table.length; i++) { // Диагональный справа налево перебор
    elem = table[i][table.length - i - 1]
    sum += elem
  }
  if (Math.abs(sum) == victorySum) {
    victory[(elem == 2 ? 'black' : 'white')] = {
      type: 'drtl'
    }
  }

  let circleCount = table.flat().filter(x => Math.abs(x) == 2).length
  if (!Object.keys(victory).length && circleCount == 16) victory = { white: '', black: '' }

  return victory
}