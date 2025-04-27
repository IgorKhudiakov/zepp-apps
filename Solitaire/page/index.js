import { getText } from '@zos/i18n'
import { setStatusBarVisible, createWidget, widget, align, prop, deleteWidget, getImageInfo, event } from '@zos/ui'
import { localStorage } from '@zos/storage'
import { push } from "@zos/router"
import { setPageBrightTime, resetPageBrightTime } from '@zos/display'
import { Vibrator } from '@zos/sensor'

import { SCREEN_WIDTH, SCREEN_HEIGHT, isRound, MARKS, VALS, CARD, COORDINATES, MENU_BUTTON_OPEN, MENU_BUTTON_CLOSE, MENU_BUTTONS, MENU_BUTTONS_PARAMS, MENU_BUTTON, COLORS, createSpace, SETTINGS, getTable, MENU_ANIMATIONS, PULSATION_ANIM } from '../utils/constants'
import { createModal, MODAL_CONFIRM } from '@zos/interaction'

const vibrator = new Vibrator()
vibrator.setMode(VIBRATOR_SCENE_NOTIFICATION)

let clicks = 0
let clicksDelay = 300

// Получаем номера открытых карт
function getVisibleCards(isNew = false) {
  if (isNew) visibleCards.clear()
  let visibleArr = isNew ? [] : localStorage.getItem('visiblecards', [])
  if (!visibleArr.length) {
    table.tableau.forEach((col) => visibleArr.push(parseInt(col[col.length - 1])))
    localStorage.setItem('visiblecards', visibleArr)
  }
  return new Set(visibleArr)
}

// Получаем данные стола
let table = getTable()
let visibleCards = getVisibleCards()
let activeCards = new Set()

// Сохраняем расположение карт на столе
function saveGame() {
  localStorage.setItem('table', table)
  localStorage.setItem('visiblecards', Array.from(visibleCards))
}

// Получаем данные о карте (где находится, из чего состоит)
function getCardInfo(id) {
  let isFounded = false
  const card = {
    val: Math.floor(id / 4) + 1,
    mark: Object.keys(MARKS)[id % 4],
    col: 0
  }

  for (const [key, place] of Object.entries(table)) {
    if (!Array.isArray(place[0])) {
      const row = place.indexOf(id)
      if (row != -1) {
        isFounded = true
        card.place = key
        card.row = row
        card.isFace = visibleCards.has(id)
        break
      }
    } else {
      for (let col = 0; col < place.length; col++) {
        const row = place[col].indexOf(id)
        if (row != -1) {
          isFounded = true
          card.place = key
          card.col = col
          card.row = row
          card.isFace = visibleCards.has(id)
          break
        }
      }
      if (isFounded) break
    }
  }

  return card
}

Page({
  build() {
    setStatusBarVisible(false)
    setPageBrightTime({ brightTime: 30000 })

    // Функция отслеживания двойного нажатия
    function cardClick(elem, id) {
      if (!clicks) setTimeout(() => {
        changeTable(elem, id, clicks == 2)
        clicks = 0
      }, clicksDelay)
      clicks ++
    }

    // Начинаем игру (action передаём от кнопок)
    function getGame(action = false) {
      if (action) activeCards.clear()
      table = action == 'refresh' ? localStorage.getItem('initialtable') : getTable(action == 'newgame')
      visibleCards = getVisibleCards(!!action)
      drawTable(!!action)
    }

    // Проверяем, окончена ли партия
    function gameIsDone() {
      let count = table.homes.reduce((acc, row) => acc + row.length, 0)
      if (count == 52) showSuccess()
    }

    // Получаем список карт, которые следуют за указанной в столбце
    function getCards(id) {
      let card = getCardInfo(id)
      let place = table[card.place]
      let cards = Array.isArray(place[0]) ? place[card.col].slice(card.row, place[card.col].length) : place.slice(card.row, place.length)
      return cards
    }

    // Смена активного состояния карт
    function changeActive(id = false) {
      if (typeof id == 'number') {
        activeCards.clear()
        getCards(id).forEach((val) => {
          activeCards.add(val)
          updateCard(val)
        })
      } else {
        activeCards.forEach((val) => {
          activeCards.delete(val)
          updateCard(val)
        })
      }
    }

    // Перемещение карт
    function cardsMove(activeCard, target, isReserve = false) {
      let matrix = table[activeCard.place][activeCard?.col ?? 0]
      let spliceArr = Array.isArray(matrix)
        ? matrix.splice(activeCard.row, activeCards.size)
        : table[activeCard.place].splice(activeCard.row, (isReserve ? table[activeCard.place].length : 1))
      if (isReserve) spliceArr.reverse()
      Array.isArray(table[target.place][target?.col ?? 0])
        ? table[target.place][target.col].push(...spliceArr)
        : table[target.place].push(...spliceArr)

      if (activeCard.place == "tableau" && table.tableau[activeCard.col].length) {
        let cardIndex = table.tableau[activeCard.col][table.tableau[activeCard.col].length - 1]
        if (SETTINGS?.autoFace) visibleCards.add(cardIndex)
        updateCard(cardIndex)
      }
      else if (activeCard.place == "reserve" && table.reserve.length) updateCard(table.reserve[table.reserve.length - 1])
      if (!target.isEmpty && target.place == 'tableau' && table.tableau[target.col].length) updateCard(table.tableau[target.col][target.row])
      if (isReserve) {
        spliceArr.forEach((e) => {
          visibleCards.delete(e)
          updateCard(e)
        })
      }
      changeActive()
      updateBgs()
      gameIsDone()
    }

    // Логика игры
    function changeTable(target, targetID, doubleClick = false) {
      if (activeCards.size) {
        const [activeCardID] = activeCards
        let activeCard = getCardInfo(activeCardID)
        if (target?.isEmpty || target?.isFace) {
          if (['homes', 'tableau'].includes(target.place)) {
            if (target.place == 'homes') {
              if (activeCards.size == 1 && activeCard.mark == target.mark && activeCard.val == (target?.val ?? 0) + 1) cardsMove(activeCard, target)
              else if (SETTINGS?.failVibro) vibrator.start()
            } else if (target.place == 'tableau') {
              if (target?.isEmpty && activeCard.val == 13
                || !target?.isEmpty && target.val == activeCard.val + 1 && MARKS[target.mark] != MARKS[activeCard.mark]) cardsMove(activeCard, target)
              else if (target.col != activeCard.col && SETTINGS?.failVibro) vibrator.start()
            }
          }
        } else if (target.col != activeCard.col && SETTINGS?.failVibro) vibrator.start()
        changeActive()
      } else {
        if (target?.isFace) {
          if (['buffer', 'tableau'].includes(target.place) && doubleClick) {
            let homeID = targetID % 4
            let homeLastElem = table.homes[homeID].length ? getCardInfo(table.homes[homeID][table.homes[homeID].length - 1]) : {
              place: 'homes',
              mark: target.mark,
              col: homeID,
              isEmpty: true
            }
            if ((target.place == 'buffer' && target.row == table.buffer.length - 1 || target.place == 'tableau' && target.row == table.tableau[target.col].length - 1)
              && target.val == table.homes[homeID].length + 1) {
              activeCards.add(targetID)
              cardsMove(target, homeLastElem)
            }
          } else if (target.place == 'buffer' && target.row == table.buffer.length - 1
            || target.place == 'tableau') changeActive(targetID)
        } else {
          if (typeof targetID == 'number') {
            if (target.place == 'reserve' || target.place == 'tableau' && target.row == table.tableau[target.col].length - 1) {
              visibleCards.add(targetID)
              if (target.place == 'reserve') {
                cardsMove(target, { place: 'buffer' })
              }
              updateCard(targetID)
            }
          } else if (target.place == 'reserve' && table.buffer.length) {
            cardsMove({
              place: 'buffer',
              col: 0,
              row: 0
            }, target, true)
          }
        }
      }
      updateBottom()
    }

    // Меню успешного окончания партии
    let successContainer = {}
    function closeSuccess() {
      menuButtonLayout.setProperty(prop.VISIBLE, true)
      deleteWidget(successContainer)
    }
    function showSuccess() {
      menuButtonLayout.setProperty(prop.VISIBLE, false)

      successContainer = createWidget(widget.VIEW_CONTAINER, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT,
        z_index: 2
      })

      successContainer.createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT,
        alpha: 200
      })

      let contentH = 50

      let imgSrc = 'image/success.png'
      let imageInfo = getImageInfo(imgSrc)
      successContainer.createWidget(widget.FILL_RECT, {
        x: (SCREEN_WIDTH - imageInfo.width) / 2 + 1,
        y: contentH + 1,
        w: imageInfo.width - 2,
        h: imageInfo.height - 2,
        radius: Math.floor(imageInfo.width / 4),
        color: COLORS.shirts[SETTINGS.shirtColor]
      })
      successContainer.createWidget(widget.IMG, {
        x: (SCREEN_WIDTH - imageInfo.width) / 2,
        y: contentH,
        src: imgSrc
      })
      contentH += imageInfo.height + 20

      successContainer.createWidget(widget.TEXT, {
        x: 0,
        y: contentH,
        w: SCREEN_WIDTH,
        h: 50,
        text: getText('success'),
        text_size: 32,
        color: COLORS.shirts[SETTINGS.shirtColor],
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
      contentH += 80

      successContainer.createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - MENU_BUTTONS_PARAMS.W) / 2,
        y: contentH,
        w: MENU_BUTTONS_PARAMS.W,
        h: MENU_BUTTONS_PARAMS.H,
        radius: MENU_BUTTONS_PARAMS.R,
        text: getText('menu'),
        text_size: MENU_BUTTONS_PARAMS.S,
        color: MENU_BUTTONS_PARAMS.C,
        normal_color: MENU_BUTTONS_PARAMS.NC,
        press_color: COLORS.shirts[SETTINGS.shirtColor],
        click_func: () => {
          successContainer.setProperty(prop.ANIM, {
            anim_steps: [MENU_ANIMATIONS.close],
            anim_complete_func: () => {
              closeSuccess()
              showMenu()
            }
          })
        }
      })
      contentH += MENU_BUTTONS_PARAMS.H + MENU_BUTTONS_PARAMS.M

      successContainer.createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - MENU_BUTTONS_PARAMS.W) / 2,
        y: contentH,
        w: MENU_BUTTONS_PARAMS.W,
        h: MENU_BUTTONS_PARAMS.H,
        radius: MENU_BUTTONS_PARAMS.R,
        text: getText('newgame'),
        text_size: MENU_BUTTONS_PARAMS.S,
        color: MENU_BUTTONS_PARAMS.C,
        normal_color: MENU_BUTTONS_PARAMS.NC,
        press_color: COLORS.shirts[SETTINGS.shirtColor],
        click_func: () => {
          getGame('newgame')
          successContainer.setProperty(prop.ANIM, {
            anim_steps: [MENU_ANIMATIONS.close],
            anim_complete_func: closeSuccess
          })
        }
      })
      contentH += MENU_BUTTONS_PARAMS.H + MENU_BUTTONS_PARAMS.M

      createSpace({ UI: successContainer, y: contentH, h: 50 })

      successContainer.setProperty(prop.ANIM, {
        anim_steps: [MENU_ANIMATIONS.open]
      })
    }

    // Обычное меню
    let menuContainer = {}
    function closeMenu() {
      menuButtonLayout.setProperty(prop.VISIBLE, true)
      deleteWidget(menuContainer)
    }
    function showMenu() {
      let menuH = 0
      menuButtonLayout.setProperty(prop.VISIBLE, false)

      menuContainer = createWidget(widget.VIEW_CONTAINER, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT,
        POS_Y: SCREEN_HEIGHT,
        z_index: 1
      })

      const menuBg = menuContainer.createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT,
        alpha: 200
      })

      menuContainer.createWidget(widget.BUTTON, {
        ...MENU_BUTTON_CLOSE,
        click_func: () => {
          menuContainer.setProperty(prop.ANIM, {
            anim_steps: [MENU_ANIMATIONS.close],
            anim_complete_func: closeMenu
          })
        }
      })
      menuH += MENU_BUTTON.h + 10

      menuContainer.createWidget(widget.TEXT, {
        x: 0,
        y: menuH,
        w: SCREEN_WIDTH,
        h: 30,
        text: getText('menu'),
        text_size: 24,
        color: COLORS.primary,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
      menuH += 50

      MENU_BUTTONS.forEach((val, i) => {
        menuContainer.createWidget(widget.BUTTON, {
          x: (SCREEN_WIDTH - MENU_BUTTONS_PARAMS.W) / 2,
          y: menuH + (MENU_BUTTONS_PARAMS.H + MENU_BUTTONS_PARAMS.M) * i,
          w: MENU_BUTTONS_PARAMS.W,
          h: MENU_BUTTONS_PARAMS.H,
          radius: MENU_BUTTONS_PARAMS.R,
          text: getText(val),
          text_size: MENU_BUTTONS_PARAMS.S,
          color: MENU_BUTTONS_PARAMS.C,
          normal_color: MENU_BUTTONS_PARAMS.NC,
          press_color: COLORS.shirts[SETTINGS.shirtColor],
          click_func: () => {
            switch (val) {
              case 'resume':
                menuContainer.setProperty(prop.ANIM, {
                  anim_steps: [MENU_ANIMATIONS.close],
                  anim_complete_func: closeMenu
                })
                break
              case 'refresh':
              case 'newgame':
                createModal({
                  content: getText(val + 'text'),
                  onClick: (keyObj) => {
                    if (keyObj.type === MODAL_CONFIRM) {
                      getGame(val)
                      menuContainer.setProperty(prop.ANIM, {
                        anim_steps: [MENU_ANIMATIONS.close],
                        anim_complete_func: closeMenu
                      })
                    }
                  }
                })
                break
              default:
                push({
                  url: `page/${val}`
                })
                break
            }
          }
        })
      })
      menuH += (MENU_BUTTONS_PARAMS.H + MENU_BUTTONS_PARAMS.M) * MENU_BUTTONS.length

      createSpace({ UI: menuContainer, y: menuH, h: (isRound ? 50 : 20) })
      menuH += (isRound ? 50 : 20)
      if (menuH > SCREEN_HEIGHT) menuBg.setProperty(prop.MORE, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: menuH
      })
      menuContainer.setProperty(prop.ALPHA, 255)

      menuContainer.setProperty(prop.ANIM, {
        anim_steps: [MENU_ANIMATIONS.open]
      })
    }

    // Рисуем выкладку
    function drawTable(isNew = false) {
      updateBgs()
      for (const [key, place] of Object.entries(table)) {
        if (key == 'tableau') {
          place.forEach(col => {
            col.forEach(el => {
              updateCard(el)
            })
          })
        } else {
          if (Array.isArray(place[0])) {
            for (let col = 0; col < place.length; col++) {
              if (place[col].length) updateCard(place[col][place[col].length - 1])
            }
          } else {
            if (key == 'reserve' && isNew) place.forEach(el => updateCard(el, isNew))
            if (place.length) updateCard(place[place.length - 1])
          }
        }
      }
      updateBottom()
    }

    // Обновляем карту
    function updateCard(id, remove = false) {
      if (cardsGroups[id]) {
        cardsGroups[id].removeEventListener(event.CLICK_DOWN)
        deleteWidget(cardsGroups[id])
      }
      if (remove) return

      let elem = getCardInfo(id)

      cardsGroups[id] = tableContainer.createWidget(widget.GROUP, {
        x: COORDINATES[elem.place].X + elem.col * (CARD.W + CARD.M),
        y: COORDINATES[elem.place].Y + (elem.place == 'tableau' ? elem.row * (CARD.offset + SETTINGS.cardOffset * CARD.offsetStep) : 0)
          + (['tableau', 'buffer'].includes(elem.place) ? activeCards.has(id) * (CARD.offset + SETTINGS.cardOffset * CARD.offsetStep) : 0),
        w: CARD.W,
        h: CARD.H
      })
      cardsGroups[id].addEventListener(event.CLICK_DOWN, () => {
        SETTINGS?.autoHome && elem.isFace && ['tableau', 'buffer'].includes(elem.place) ? cardClick(elem, id) : changeTable(elem, id)
      })

      if (elem.place == 'tableau') {
        cardsGroups[id].createWidget(widget.FILL_RECT, {
          x: 1,
          y: -1,
          w: CARD.W - 2,
          h: CARD.R * 2,
          radius: CARD.R,
          color: COLORS.shadow,
          alpha: 100
        })
      }
      const rect = cardsGroups[id].createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: CARD.W,
        h: CARD.H,
        radius: CARD.R,
        color: elem.isFace ? COLORS.face : COLORS.shirts[SETTINGS.shirtColor]
      })
      if (elem.isFace) {
        let isBig = elem.row == (Array.isArray(table[elem.place][0]) ? table[elem.place][elem.col].length : table[elem.place].length) - 1
        elem.isMini = !isBig

        cardsGroups[id].createWidget(widget.TEXT, {
          x: isBig ? 0 : CARD.W / 2 - 20,
          y: isBig ? CARD.H / 2 - 26 : (CARD.offset + SETTINGS.cardOffset * CARD.offsetStep - 12) / 2,
          w: isBig ? CARD.W : 18,
          h: isBig ? 26 : 12,
          text: `${VALS[elem.val - 1]}`,
          text_size: isBig ? 24 : 10,
          color: COLORS.primary,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V
        })

        let imgSrc = `image/marks/${elem.mark}${isBig ? '' : '_small'}.png`
        let imageInfo = getImageInfo(imgSrc)
        cardsGroups[id].createWidget(widget.IMG, {
          x: isBig ? (CARD.W - imageInfo.width) / 2 : CARD.W / 2 + (20 - imageInfo.width) / 2,
          y: isBig ? CARD.H / 2 + 5 : (CARD.offset + SETTINGS.cardOffset * CARD.offsetStep - imageInfo.height) / 2,
          src: imgSrc
        })
        if (SETTINGS?.flashCard && activeCards.has(id)) {
          cardsGroups[id].createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: CARD.W,
            h: CARD.H,
            radius: CARD.R,
            color: 0xffffff
          }).setProperty(prop.ANIM, {
            anim_steps: [PULSATION_ANIM.up, PULSATION_ANIM.down],
            anim_repeat: 2
          })
        }
      } else if (SETTINGS.shirtPattern) {
        let imgSrc = `image/cards/shirts/${SETTINGS.shirtPattern}.png`
        cardsGroups[id].createWidget(widget.IMG, {
          x: (CARD.W - getImageInfo(imgSrc).width) / 2,
          y: (CARD.H - getImageInfo(imgSrc).height) / 2,
          src: imgSrc
        })
      }
    }

    // Обновляем пустые клетки
    function updateBgs() {
      const backgrounds = {
        reserve: reserveBg,
        buffer: bufferBg,
        homes: homes_cols,
        tableau: table_cols
      }
      for (key in table) {
        if (Array.isArray(table[key][0])) {
          table[key].forEach((col, i) => backgrounds[key][i].setProperty(prop.VISIBLE, !table[key][i].length))
        } else backgrounds[key].setProperty(prop.VISIBLE, !table[key].length)
      }
    }

    function updateBottom() {
      let maxColCards = Math.max(...table.tableau.map(row => row.length))
      let bottomY = COORDINATES.tableau.Y + CARD.H + maxColCards * (CARD.offset + SETTINGS.cardOffset * CARD.offsetStep)
      bottomSpace.setProperty(prop.MORE, {
        x: 0,
        y: bottomY,
        w: SCREEN_WIDTH,
        h: MENU_BUTTON.h
      })
    }

    //
    // Здесь и далее рисуем стол
    //
    const bg = createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT,
      color: COLORS.bgs[SETTINGS.bgColor]
    })

    const tableContainer = createWidget(widget.VIEW_CONTAINER, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT,
      z_index: 0
    })

    // Магазин (резерв)
    const reserveBg = tableContainer.createWidget(widget.IMG, {
      x: COORDINATES.reserve.X,
      y: COORDINATES.reserve.Y,
      src: `image/cards/empty/${SETTINGS.redeal ? 'normal' : 'block'}.png`
    })
    if (SETTINGS?.redeal) {
      reserveBg.addEventListener(event.CLICK_DOWN, () => {
        const elem = {
          place: 'reserve',
          isEmpty: true
        }
        changeTable(elem)
      })
    }

    // Буфер
    const bufferBg = tableContainer.createWidget(widget.IMG, {
      x: COORDINATES.buffer.X,
      y: COORDINATES.buffer.Y,
      src: 'image/cards/empty/normal.png'
    })

    // Дома (база)
    let homes_cols = []
    for (let i = 0; i < table.homes.length; i++) {
      homes_cols[i] = tableContainer.createWidget(widget.IMG, {
        x: COORDINATES.homes.X + (CARD.W + CARD.M) * i,
        y: COORDINATES.homes.Y,
        src: `image/cards/empty/${Object.keys(MARKS)[i]}.png`
      })
      homes_cols[i].addEventListener(event.CLICK_DOWN, () => {
        const elem = {
          col: i,
          place: 'homes',
          mark: Object.keys(MARKS)[i],
          isEmpty: true
        }
        changeTable(elem)
      })
    }

    // Раскладка (основные колонки)
    let table_cols = []
    for (let i = 0; i < table.tableau.length; i++) {
      table_cols[i] = tableContainer.createWidget(widget.IMG, {
        x: COORDINATES.tableau.X + (CARD.W + CARD.M) * i,
        y: COORDINATES.tableau.Y,
        src: `image/cards/empty/normal.png`
      })
      table_cols[i].addEventListener(event.CLICK_DOWN, () => {
        const elem = {
          col: i,
          place: 'tableau',
          isEmpty: true
        }
        changeTable(elem)
      })
    }
    const cardsGroups = []
    const bottomSpace = createSpace({ UI: tableContainer, y: 0, h: MENU_BUTTON.h })

    getGame()

    // Кнопка откытия меню
    const menuButtonLayout = createWidget(widget.VIEW_CONTAINER, {
      x: 0,
      y: SCREEN_HEIGHT - MENU_BUTTON.h,
      w: SCREEN_WIDTH,
      h: MENU_BUTTON.h,
      scroll_enable: false,
      z_index: 1
    })
    menuButtonLayout.createWidget(widget.BUTTON, {
      ...MENU_BUTTON_OPEN,
      click_func: () => { showMenu() }
    })

    gameIsDone()
  },
  onDestroy() {
    resetPageBrightTime()
    saveGame()
  }
})