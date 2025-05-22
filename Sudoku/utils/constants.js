import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { getText } from "@zos/i18n"
import { createModal, MODAL_CONFIRM } from "@zos/interaction"
import { push } from "@zos/router"
import { localStorage } from "@zos/storage"
import hmUI, { align, createWidget, deleteWidget, event, getTextLayout, prop, text_style, widget } from "@zos/ui"
import { px } from "@zos/utils"

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, screenShape, deviceSource } = getDeviceInfo()
export const isRound = screenShape == SCREEN_SHAPE_ROUND

let settings = localStorage.getItem('settings', {})

export const difficults = ['easy', 'medium', 'hard', 'expert']
export const defaultCounters = {}
difficults.forEach(difficult => {
  defaultCounters[difficult] = 0
})

export const COLORS = {
  primary: 0xffffff,
  secondary: 0xaaaaaa,
  accent: 0x005eff,
  difficults: {
    normal: [0x20bf6b, 0xf7b731, 0xfa8231, 0xeb3b5a],
    press: [0x26de81, 0xfed330, 0xfd9644, 0xfc5c65]
  },
  cell: {
    active: 0x005eff,
    default: 0x222222,
    inline: 0x444444,
    highlight: 0x00aa53
  },
  cells: []
}

export function getSFA(arr) {
  let str = ''
  arr.forEach((n, i) => {
    str += +n ? n : ' '
    if (i && (i + 1) % 3 == 0) str += '\n'
  })
  return str
}

export function getGame(difficulty) {
  const table = {
    full: generateFullTable(),
  }
  table.start = generateStartTable(table.full, difficulty)
  table.current = JSON.parse(JSON.stringify(table.start))
  return table
}

function solveSudoku(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)

        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num
            if (solveSudoku(grid)) return true
            grid[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

function isValid(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false
  }

  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) return false
    }
  }

  return true
}

function generateFullTable() {
  const grid = Array(9).fill().map(() => Array(9).fill(0))

  for (let box = 0; box < 9; box += 3) {
    fillBox(grid, box, box)
  }

  solveSudoku(grid)
  return grid
}

function fillBox(grid, row, col) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      grid[row + i][col + j] = nums.pop()
    }
  }
}

function generateStartTable(solved, difficulty) {
  const grid = solved.map(row => [...row])

  const levels = {
    easy: 36,
    medium: 28,
    hard: 22,
    expert: 17
  }

  removeNumbers(grid, 81 - levels[difficulty])
  return grid
}

function removeNumbers(grid, count) {
  while (count > 0) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)

    if (grid[row][col] !== 0) {
      grid[row][col] = 0
      count--
    }
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

function newGame(session) {
  delete session.table
  localStorage.setItem('session', session)
  push({
    url: 'page/choosen'
  })
}

export class Menu {
  constructor() {
    this.group = {}
    this.bg = {}
    this.buttons = ['resume', 'newGame', 'info']
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
      h: SCREEN_HEIGHT
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

export function showVictory(session) {
  const group = createWidget(widget.GROUP, {
    x: 0,
    y: 0,
    w: SCREEN_WIDTH,
    h: SCREEN_HEIGHT
  })
  group.createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: SCREEN_WIDTH,
    h: SCREEN_HEIGHT,
    alpha: 200
  })
  let text = getText('victoryText')
  let textRect = getTextLayout(text, { text_size: px(32), text_width: SCREEN_WIDTH - px(36) * 2, wrapped: true })
  group.createWidget(widget.TEXT, {
    x: px(36),
    y: SCREEN_HEIGHT / 2 - textRect.height,
    w: SCREEN_WIDTH - px(36) * 2,
    h: textRect.height,
    text: text,
    text_size: px(32),
    text_style: text_style.WRAP,
    color: COLORS.primary,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V
  })
  group.createWidget(widget.BUTTON, {
    x: (SCREEN_WIDTH - px(250)) / 2,
    y: SCREEN_HEIGHT / 2 + px(50),
    w: px(250),
    h: px(50),
    text: getText('newGame'),
    text_size: px(32),
    color: COLORS.primary,
    radius: px(15),
    normal_color: COLORS.accent,
    press_color: COLORS.accent,
    click_func: () => {
      session.counters[session.difficulty]++
      newGame(session)
    }
  })
}

/**
 * Checks if the puzzle is solved
 * @returns
 */
export function getGameResult() {
  let session = localStorage.getItem('session')
  for (let i = 0; i < session.table.current.length; i++) {
    for (let j = 0; j < session.table.current[i].length; j++) {
      if (session.table.current[i][j] != session.table.full[i][j]) return false
    }
  }
  return true
}

export class Keyboard {
  constructor(oldVal) {
    this.contentLocker = {}
    this.keysArr = [
      ['1', '2', '3', 'apply'],
      ['4', '5', '6', 'backspace'],
      ['7', '8', '9', 'shift']
    ]
    this.keySize = {
      w: px(96),
      h: px(64)
    }
    this.keyTextSize = {
      normal: px(32),
      small: px(16)
    }
    this.textBlockSize = {
      w: px(90),
      h: px(90)
    }
    this.group = {}
    this.drawableKeysBgs = Array.from(Array(this.keysArr.length), (v, k) => Array.from(Array(3), () => ({})))
    this.drawableKeys = Array.from(Array(this.keysArr.length), (v, k) => Array.from(Array(this.keysArr[k].length), () => ({})))
    this.drawableCell = {}
    this.isShift = !Array.isArray(oldVal)
    this.oldVal = oldVal
    this.onChanged = {}
    this.textBg = {}
    this.drawableText = []
    this.isHidden = false
    this.hideButton = {}
  }

  draw() {
    this.contentLocker = createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT,
      alpha: 0
    })
    this.group = createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    })
    this.group.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    })
    this.keysArr.forEach((row, i) => {
      row.forEach((key, j) => {
        if (Number.isInteger(+key)) {
          this.drawableKeys[i][j] = this.group.createWidget(widget.TEXT, {
            x: (SCREEN_WIDTH - row.length * this.keySize.w) / 2 + j * this.keySize.w,
            y: SCREEN_HEIGHT - (this.keysArr.length - i) * this.keySize.h - px(isRound ? 80 : 20),
            w: this.keySize.w,
            h: this.keySize.h,
            text: key,
            text_size: this.keyTextSize[this.isShift ? 'normal' : 'small'],
            color: COLORS.primary,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V
          })
          this.drawableKeys[i][j].addEventListener(event.CLICK_DOWN, () => {
            if (this.isShift) this.oldVal = key
            else {
              if (!Array.isArray(this.oldVal)) this.oldVal = Array.from(Array(9), () => '0')
              this.oldVal[key - 1] = this.oldVal.includes(key) ? 0 : key
            }
            this.updateText()
          })
        } else {
          this.drawableKeys[i][j] = this.group.createWidget(widget.IMG, {
            x: (SCREEN_WIDTH - row.length * this.keySize.w) / 2 + j * this.keySize.w,
            y: SCREEN_HEIGHT - (this.keysArr.length - i) * this.keySize.h - px(isRound ? 80 : 20),
            src: `buttons/${key}${key == 'shift' ? this.isShift ? '_off': '_on' : ''}.png`
          })
          this.drawableKeys[i][j].addEventListener(event.CLICK_DOWN, () => {
            switch (key) {
              case 'apply':
                this.remove()
                this.onChanged?.(this.oldVal)
                break
              case 'backspace':
                this.oldVal = 0
                this.updateText()
                this.updateNumbers()
                break
              case 'shift':
                this.isShift = !this.isShift
                this.updateNumbers()
                this.drawableKeys[i][j].setProperty(prop.SRC, `buttons/${key}_${this.isShift ? 'off' : 'on'}.png`)
                break
            }
          })
        }
      })
    })
    let textBgY = SCREEN_HEIGHT - px(isRound ? 80 : 20) - this.keysArr.length * this.keySize.h - px(20) - this.textBlockSize.h
    if (textBgY > (SCREEN_HEIGHT - this.textBlockSize.h) / 2) textBgY = (SCREEN_HEIGHT - this.textBlockSize.h) / 2
    this.textBg = this.group.createWidget(widget.FILL_RECT, {
      x: (SCREEN_WIDTH - this.textBlockSize.w) / 2,
      y: textBgY,
      w: this.textBlockSize.w,
      h: this.textBlockSize.h,
      radius: Math.floor(this.textBlockSize.w / 10),
      color: COLORS.cell.default
    })
    this.updateText()
    this.hideButton = createWidget(widget.IMG, {
      x: Math.floor((SCREEN_WIDTH - px(64)) / 2),
      y: 0,
      src: 'buttons/hide.png'
    })
    this.hideButton.addEventListener(event.CLICK_DOWN, () => {
      this.group.setProperty(prop.VISIBLE, this.isHidden)
      this.isHidden = !this.isHidden
    })
  }

  remove() {
    deleteWidget(this.contentLocker)
    deleteWidget(this.hideButton)
    deleteWidget(this.group)
  }

  updateNumbers() {
    this.keysArr.forEach((row, i) => {
      row.forEach((key, j) => {
        if (Number.isInteger(+key)) {
          this.drawableKeys[i][j].setProperty(prop.MORE, {
            color: this.isShift || Array.isArray(this.oldVal) && this.oldVal.includes(key) ? COLORS.primary : COLORS.secondary,
            text_size: this.keyTextSize[this.isShift ? 'normal' : 'small']
          })
        }
      })
    })
  }

  updateText() {
    this.drawableText.forEach(w => deleteWidget(w))
    let textArr = []
    if (Array.isArray(this.oldVal)) textArr = this.oldVal
    else textArr.push(this.oldVal)

    textArr.forEach((w, i) => {
      this.drawableText[i] = this.group.createWidget(widget.TEXT, {
        x: this.textBg.getProperty(prop.X) + (i % 3) * Math.floor(this.textBlockSize.w / 3),
        y: this.textBg.getProperty(prop.Y) + Math.floor(i / 3) * Math.floor(this.textBlockSize.h / 3),
        w: textArr.length > 1 ? Math.floor(this.textBlockSize.w / 3) : this.textBlockSize.w,
        h: textArr.length > 1 ? Math.floor(this.textBlockSize.h / 3) : this.textBlockSize.h,
        text: w == 0 ? '' : w,
        text_size: Math.floor((textArr.length > 1 ? Math.floor(this.textBlockSize.h / 3) : this.textBlockSize.h) / 4) * 3,
        color: COLORS.primary,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
    })
  }
}