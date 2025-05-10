import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { getText } from "@zos/i18n"
import { createModal, MODAL_CONFIRM } from "@zos/interaction"
import { back, push, replace } from "@zos/router"
import { localStorage } from "@zos/storage"
import hmUI, { align, createWidget, deleteWidget, event, prop, widget } from "@zos/ui"
import { px } from "@zos/utils"

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, screenShape, deviceSource } = getDeviceInfo()
export const isRound = screenShape == SCREEN_SHAPE_ROUND

let settings = localStorage.getItem('settings', {})

export const COLORS = {
  primary: 0xffffff,
  secondary: 0xaaaaaa,
  lines: {
    normal: 0x666770,
    small: 0x333440
  },
  marks: [0xff0044, 0x00fbff, 0xe55622, 0x46a11b, 0x9500ff, 0x005eff, 0xffbb00, 0xff0000, 0xffffff, 0xaba692, 0x33ff99, 0xff00dd]
}

export const tableSize = {
  rows: 3,
  cols: 3
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
    checkboxFg.setProperty(prop.X, bool ? checkbox.fg.xOn : checkbox.fg.xOff)
    checkboxFg.setProperty(prop.COLOR, bool ? checkbox.fg.onColor : checkbox.fg.offColor)
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
  localStorage.setItem('table', Array.from(Array(tableSize.rows ** 2), () => Array.from(Array(tableSize.cols ** 2), () => 0)))
  localStorage.setItem('prevstep', {
    i: -1,
    j: -1,
    player: undefined
  })
  replace({ url: 'page/index' })
}

export class Menu {
  constructor() {
    this.group = {}
    this.bg = {}
    this.buttons = ['resume', 'newGame', 'resetCounters', 'settings', 'info']
    this.H = 0
    this.buttonsW = px(300)
    this.buttonsH = px(50)
    this.buttonsM = px(15)
    this.buttonsNormalColor = 0x222222
    this.buttonsPressColor = 0x333333
  }

  show() {
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
                  if (type === MODAL_CONFIRM) newGame()
                }
              })
              break
            case 'resetCounters':
              createModal({
                content: getText(v + 'Text'),
                onClick: (keyObj) => {
                  const { type } = keyObj
                  if (type === MODAL_CONFIRM) {
                    localStorage.setItem('winscount', { x: 0, o: 0 })
                    replace({ url: 'page/index' })
                  }
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
      h: this.H
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

function showVictory(winner) {
  createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: SCREEN_WIDTH,
    h: SCREEN_HEIGHT,
    alpha: 150
  })
  createWidget(widget.IMG, {
    x: (SCREEN_WIDTH - victoryMarkSize) / 2,
    y: SCREEN_HEIGHT / 2 - victoryMarkSize,
    src: `marks/${+(winner == 1)}_victory.png`
  })
  createWidget(widget.TEXT, {
    x: (SCREEN_WIDTH - px(300)) / 2,
    y: SCREEN_HEIGHT / 2 + px(20),
    w: px(300),
    h: px(50),
    text: getText('victoryText', getText(winner == 1 ? 'xText' : 'oText')),
    text_size: px(32),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    color: COLORS.primary
  })
  createWidget(widget.FILL_RECT, {
    x: (SCREEN_WIDTH - px(200)) / 2 + px(5),
    y: SCREEN_HEIGHT / 2 + px(90) + px(5),
    w: px(200),
    h: px(50),
    color: COLORS.marks[winner == 1 ? 0 : 1]
  })
  createWidget(widget.FILL_RECT, {
    x: (SCREEN_WIDTH - px(200)) / 2 - px(5),
    y: SCREEN_HEIGHT / 2 + px(90) - px(5),
    w: px(200),
    h: px(50),
    color: COLORS.marks[winner == 1 ? settings?.xColor ?? 1 : settings?.oColor ?? 0]
  })
  createWidget(widget.BUTTON, {
    x: (SCREEN_WIDTH - px(200)) / 2 - px(5),
    y: SCREEN_HEIGHT / 2 + px(90) - px(5),
    w: px(200),
    h: px(50),
    text: getText('newGame'),
    text_size: px(32),
    color: COLORS.marks[+(winner != 1)],
    radius: px(15),
    normal_src: '',
    press_src: '',
    click_func: () => {
      let winsCount = localStorage.getItem('winscount')
      winsCount[winner == 1 ? 'x' : 'o']++
      localStorage.setItem('winscount', winsCount)
      newGame()
    }
  })
}

/**
 * X or O class for drawing
 */
export class Mark {
  constructor(type, center_x, center_y, size) {
    this.type = type
    this.center_x = center_x
    this.center_y = center_y
    this.width = size
    this.bg = {}
    this.fg = {}
  }

  draw() {
    this.bg = createWidget(widget.FILL_RECT, {
      x: x ?? this.center_x - this.width / 2,
      y: y ?? this.center_y - this.width / 2,
      w: this.width,
      h: this.width,
      color: COLORS.marks[this.type == 1 ? settings?.xColor ?? 1 : settings?.oColor ?? 0]
    })
    this.widget = createWidget(widget.IMG, {
      x: x ?? this.center_x - this.width / 2,
      y: y ?? this.center_y - this.width / 2,
      w: this.width,
      h: this.width,
      auto_scale: true,
      src: `marks/${+(this.type == 1)}.png`
    })
  }

  remove() {
    deleteWidget(this.widget)
  }
}

const cellSize = px(100)

/**
 * Returns table
 * @param {boolean} isMainTable 
 * @param {Array} table 
 * @param {number} row 
 * @param {number} col 
 * @returns Array
 */
export function getTable(isMainTable = false, table, row, col) {
  let currentTable = isMainTable ? table : []
  let newtable = Array.from(Array(tableSize.rows), (v, k) => Array.from(tableSize.cols))
  for (let i = 0; i < tableSize.rows; i++) {
    for (let j = 0; j < tableSize.cols; j++) {
      newtable[i][j] = isMainTable ? getGameResult(getTable(false, currentTable, i, j)) : table[tableSize.rows * row + i][tableSize.cols * col + j]
    }
  }
  return newtable
}

/**
 * Returns wins
 * @param {Array} table 
 * @returns -1 || 0 || 1
 */
function getGameResult(table) {
  let counts = {
    x: 0,
    o: 0
  }
  let sum = 0
  let elem = 0

  for (let i = 0; i < table.length; i++) {
    sum = table[i].reduce((currentSum, val) => { // Горизонтальный перебор
      elem = val
      if (val == 1 || val == -1) val == 1 ? counts.x++ : counts.o++
      return currentSum += val
    })
    if (Math.abs(sum) == 3) return elem
  }

  elem = 0
  for (let i = 0; i < tableSize.rows; i++) { // Вертикальный перебор
    sum = 0
    for (let j = 0; j < tableSize.cols; j++) {
      elem = table[j][i]
      sum += elem
    }
    if (Math.abs(sum) == 3) return elem
  }

  sum = 0
  elem = 0
  for (let i = 0; i < tableSize.rows; i++) { // Диагональный слева направо перебор
    elem = table[i][i]
    sum += elem
  }
  if (Math.abs(sum) == 3) return elem

  elem = 0
  sum = 0
  for (let i = 0; i < tableSize.rows; i++) { // Диагональный справа налево перебор
    elem = table[i][tableSize.cols - i - 1]
    sum += elem
  }
  if (Math.abs(sum) == 3) return elem

  if ((counts.x > 0 || counts.y > 0) && counts.x + counts.o == 9) { // Сравнение количества ходов
    return counts.x > counts.y ? 1 : -1
  } else return 0
}

/**
 * Table class for drawing and game changing
 */
export class Table {
  constructor({ table, size = 'normal', isMainTable = false, center_x = SCREEN_WIDTH / 2, center_y = SCREEN_HEIGHT / 2, mainI, mainJ }) {
    this.isMain = isMainTable
    this.table = table
    this.drawableTable = isMainTable ? getTable(isMainTable, table) : table
    this.drawable = Array.from(Array(tableSize.rows), (v, k) => Array.from(tableSize.cols))
    this.size = size
    this.width = size == 'small' ? Math.floor(cellSize * .8) : cellSize * tableSize.rows
    this.lineW = px(size == 'small' ? 3 : 4)
    if (this.lineW < 1) this.lineW = 1
    this.lineColor = COLORS.lines[size]
    this.cellSize = Math.floor(this.width / 3)
    this.cellContentSize = Math.floor(this.cellSize * .8)
    this.x = center_x - this.width / 2
    this.y = center_y - this.width / 2
    this.buttons = Array.from(Array(tableSize.rows), (v, k) => Array.from(tableSize.cols))
    this.mainI = mainI,
      this.mainJ = mainJ
  }

  draw(prevStep) {
    this.drawableTable.forEach((row, i) => {
      row.forEach((col, j) => {
        if (i && j && i == j) {
          createWidget(widget.FILL_RECT, {
            x: this.x + this.cellSize * i - this.lineW / 2,
            y: this.y,
            w: this.lineW,
            h: this.width,
            radius: this.lineW / 2,
            color: this.lineColor
          })
          createWidget(widget.FILL_RECT, {
            x: this.x,
            y: this.y + this.cellSize * i - this.lineW / 2,
            w: this.width,
            h: this.lineW,
            radius: this.lineW / 2,
            color: this.lineColor
          })
        }
        if (col != 0) {
          this.drawable[i][j] = new Mark(col, this.x + this.cellSize * (j + .5), this.y + this.cellSize * (i + .5), this.cellContentSize)
          this.drawable[i][j].draw()
        } else {
          if (this.isMain) {
            this.drawable[i][j] = new Table({ table: getTable(false, this.table, i, j), size: 'small', center_x: this.x + this.cellSize * (j + .5), center_y: this.y + this.cellSize * (i + .5) })
            this.drawable[i][j].draw()
          }
          if (this.size != 'small') {
            let isVisible = !prevStep?.player || !this.isMain || this.isMain && getGameResult(getTable(false, this.table, prevStep?.i, prevStep.j)) != 0 || prevStep?.i == i && prevStep?.j == j ? 50 : 0
            this.buttons[i][j] = createWidget(widget.FILL_RECT, {
              x: this.x + this.cellSize * j + Math.floor(this.cellSize * .1),
              y: this.y + this.cellSize * i + Math.floor(this.cellSize * .1),
              w: this.cellSize - Math.floor(this.cellSize * .1) * 2,
              h: this.cellSize - Math.floor(this.cellSize * .1) * 2,
              radius: Math.floor(this.cellSize * .1),
              color: COLORS.marks[prevStep?.player == 1 ? settings?.oColor ?? 0 : settings?.xColor ?? 1],
              alpha: !settings?.hintsHidden && isVisible ? 50 : 0
            })
            if (isVisible) {
              this.buttons[i][j].addEventListener(event.CLICK_UP, () => {
                if (this.isMain) {
                  push({
                    url: 'page/cell',
                    params: {
                      row: i,
                      col: j,
                      player: prevStep?.player ?? 0
                    }
                  })
                } else this.drawMark(prevStep, i, j)
              })
            }
          }
        }
      })
    })
  }

  saveMark(type, i, j) {
    let mainTable = localStorage.getItem('table')
    mainTable[this.mainI * tableSize.rows + i][this.mainJ * tableSize.cols + j] = type
    localStorage.setItem('table', mainTable)
  }

  drawMark(prevStep, i, j) {
    prevStep.player = prevStep?.player == 1 ? -1 : 1
    prevStep.i = i
    prevStep.j = j
    this.table[i][j] = prevStep.player
    this.drawable[i][j] = new Mark(prevStep?.player, this.x + this.cellSize * (j + .5), this.y + this.cellSize * (i + .5), this.cellContentSize)
    this.buttons.forEach(val => val.forEach(wdgt => deleteWidget(wdgt)))
    this.drawable[i][j].draw()
    localStorage.setItem('prevstep', prevStep)
    this.saveMark(prevStep.player, i, j)
    let isDone = this.checkDone(prevStep.player)
    if (!this.isMain && !isDone && settings?.autoBack) back()
  }

  getSize() {
    return this.width
  }

  checkDone(prevPlayer) {
    if (getGameResult(this.drawableTable) != 0) {
      if (this.isMain) {
        this.buttons.forEach((row) => row.forEach((button) => deleteWidget(button)))
        showVictory(prevPlayer)
      } else back()
      return true
    }
    return false
  }
}