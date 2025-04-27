import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { localStorage } from "@zos/storage"
import hmUI, { event, widget, prop } from "@zos/ui"
import { px } from "@zos/utils"

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, screenShape } = getDeviceInfo()
export const isRound = screenShape == SCREEN_SHAPE_ROUND

export const COLORS = {
  primary: 0xffffff,
  secondary: 0xaaaaaa,
  bgs: [0x000000, 0x006d77, 0x520c23, 0x0a3d62, 0x073b4c, 0x301a4b],
  shirts: [0xff8800, 0xbd0042, 0x5b00bd, 0x007cf8, 0x222222, 0x3c7a6d, 0x15505f, 0x84946c],
  face: 0x333333,
  shadow: 0x000000,
  checkboxOffBg: 0x333333
}

export const MARKS = {
  clubs: 'black',
  diamonds: 'red',
  spades: 'black',
  hearts: 'red'
}

export const VALS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const CARD = {
  W: px(50),
  H: px(70),
  R: px(10),
  M: px(isRound ? 10 : 6),
  offset: px(15),
  offsetStep: px(5)
}

let startX = (SCREEN_WIDTH - CARD.W * 7 - CARD.M * 6) / 2
let startY = px(isRound ? 10 : 70)
export const COORDINATES = {
  reserve: {
    X: isRound ? (SCREEN_WIDTH - 2 * CARD.W - CARD.M) / 2 : startX,
    Y: startY
  },
  buffer: {
    X: isRound ? (SCREEN_WIDTH + CARD.M) / 2 : startX + CARD.W + CARD.M,
    Y: startY,
  },
  homes: {
    X: isRound ? (SCREEN_WIDTH - CARD.W * 4 - CARD.M * 3) / 2 : startX + (CARD.W + CARD.M) * 3,
    Y: isRound ? startY + CARD.H + CARD.M : startY
  },
  tableau: {
    X: startX,
    Y: isRound ? startY + (CARD.H + CARD.M) * 2 : startY + CARD.H + CARD.M
  }
}

const TABLE = {
  reserve: [],
  buffer: [],
  tableau: Array.from(Array(7), () => []),
  homes: Array.from(Array(4), () => [])
}

function shuffleDeck() {
  const deck = Array.from({ length: 52 }, (_, i) => i)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function createRandomTable() {
  let table = JSON.parse(JSON.stringify(TABLE))
  let indexes = shuffleDeck()
  let visibleCards = new Set()
  for (let i = 0; i < table.tableau.length; i++) {
    for (let j = 0; j <= i; j++) {
      let index = parseInt(indexes.splice(0, 1))
      table.tableau[i][j] = index
      if (i == j) visibleCards.add(index)
    }
  }
  indexes.forEach((val) => {
    table.reserve.push(parseInt(val))
  })
  localStorage.setItem('table', table)
  localStorage.setItem('initialtable', table)
  return table
}

export function getTable(isNew = false) {
  let table = localStorage.getItem('table')
  return !isNew && table ? table : createRandomTable()
}

export const MENU_BUTTONS_PARAMS = {
  W: px(250),
  H: px(50),
  R: px(20),
  M: px(15),
  S: px(24),
  C: COLORS.primary,
  NC: 0x333333
}

export const MENU_BUTTON = {
  x: (SCREEN_WIDTH - 64) / 2,
  w: px(64),
  h: px(64),
}
export const MENU_BUTTON_OPEN = {
  ...MENU_BUTTON,
  y: 0,
  normal_src: 'image/menu_up.png',
  press_src: 'image/menu_up_active.png'
}
export const MENU_BUTTON_CLOSE = {
  ...MENU_BUTTON,
  y: 0,
  normal_src: 'image/menu_down.png',
  press_src: 'image/menu_down_active.png'
}
export const MENU_BUTTONS = ['resume', 'refresh', 'newgame', 'settings', 'info']

export function createSpace({ UI = hmUI, y, h }) {
  return UI.createWidget(widget.FILL_RECT, {
    x: 0,
    y: y,
    w: SCREEN_WIDTH,
    h: h,
    alpha: 0
  })
}

export const SETTINGS = localStorage.getItem('settings', {
  redeal: true,       // Возврат карт в магазин
  autoFace: false,    // Автоматический переворот карты
  flashCard: false,   // Подсвечивать аактивные карты
  failVibro: false,   // Вибрация неправильного хода
  autoHome: false,    // Отправляет карту по двойному клику на базу
  bgColor: 0,         // Цвет фона
  shirtPattern: 1,    // Рисунок рубашки
  shirtColor: 0,      // Цвет рубашки
  cardOffset: 0       // Смещение карт
})

export const checkbox = {
  W: px(54),
  H: px(54),
  R: px(20),
  bg: {
    onColor: COLORS.shirts[SETTINGS.shirtColor],
    offColor: COLORS.checkboxOffBg
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
  let bool = !!SETTINGS[param]
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
    SETTINGS[param] = bool
    localStorage.setItem('settings', SETTINGS)
  })
}

// let interval
// function animate(UI, param, increase, offset, len, type, x, endFunc = false) {
//   if (x <= 1) {
//     switch (type) {
//       case 'easeout':
//         x = 1 - Math.pow(1 - x, 5)
//         break
//       case 'easein':
//         x = 1 - Math.sqrt(1 - Math.pow(x, 2))
//         break
//       default:
//         break
//     }
//     offset += Math.ceil(len * (increase ? 1 : -1) * x)
//     UI.setProperty(param, offset)
//   }
//   if (x >= 1) {
//     clearInterval(interval)
//     if (endFunc) endFunc()
//   }
// }

// export function move({ UI, param = prop.Y, increase = true, offset = 0, len = SCREEN_HEIGHT, type = 'easeout', fps = 25, frames = 25, endFunc = false }) {
//   let iteration = 1
//   let x = 1 / frames
//   animate(UI, param, increase, offset, len, type, x, endFunc)
//   iteration ++

//   interval = setInterval(() => {
//     animate(UI, param, increase, offset, len, type, x, endFunc)
//     iteration ++
//     x = 1 / frames * iteration
//   }, Math.floor(1000 / fps))
// }

export const MENU_ANIMATIONS = {
  open: {
    anim_prop: prop.POS_Y,
    anim_from: SCREEN_HEIGHT,
    anim_to: 0,
    anim_duration: 600,
    anim_rate: 'easeout'
  },
  close: {
    anim_prop: prop.POS_Y,
    anim_from: 0,
    anim_to: SCREEN_HEIGHT,
    anim_duration: 600,
    anim_rate: 'easeout'
  }
}

export const PULSATION_ANIM = {
  up: {
    anim_prop: prop.ALPHA,
    anim_from: 0,
    anim_to: 30,
    anim_duration: 200,
    anim_rate: 'linear',
    anim_fps: 5
  },
  down: {
    anim_prop: prop.ALPHA,
    anim_from: 50,
    anim_to: 0,
    anim_duration: 200,
    anim_rate: 'linear',
    anim_fps: 10,
    anim_offset: 200
  }
}