/*
  Данная страница не используется. Функционал перенесён в приложение Zepp.
  This page is not in use. The functionality has been transferred to the Zepp application.
*/

// import * as hmUI from "@zos/ui"
// import { getText } from "@zos/i18n"
// import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
// import { back } from '@zos/router'
// import { readFileSync } from "@zos/fs"
// import { Time } from '@zos/sensor'

// const { screenShape } = getDeviceInfo()
// const screenWidth = getDeviceInfo().width
// const screenHeight = getDeviceInfo().height
// const isRoundedScreen = screenShape == SCREEN_SHAPE_ROUND

// Page({
//   onInit(options) {
//     hmUI.setStatusBarVisible(false)
//     const params = options ? JSON.parse(options) : false
//     const time = new Time()

//     let colorPrimary = 0xffffff
//     let colorSecondary = 0xaaaaaa

//     let accentColor = 0x0066aa
//     let startY = isRoundedScreen ? 150 : 100
//     let bottomM = 20
//     let sideM = 30
//     let cardW = screenWidth - sideM * 2
//     let cardH = 440
//     let cardP = 15
//     let cardM = 20
//     let deskM = 10
//     let textM = 20
//     let groups = []

//     const viewContainer = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
//       x: 0,
//       y: 0,
//       w: screenWidth,
//       h: screenHeight,
//       scroll_enable: pos_y
//     })

//     viewContainer.createWidget(hmUI.widget.TEXT, {
//       x: 0,
//       y: isRoundedScreen ? 50 : 20,
//       w: screenWidth,
//       h: 50,
//       text: getText('transport'),
//       text_size: 24,
//       align_h: hmUI.align.CENTER_H,
//       align_v: hmUI.align.CENTER_V,
//       text_style: hmUI.text_style.WRAP,
//       color: accentColor
//     })

//     function updatePos() {
//       let y = groups.length > 0 ? startY + groups.length * (cardH + cardM) : (screenHeight - buttonH) / 2
//       addButton.setProperty(hmUI.prop.Y, y)
//       saveButton.setProperty(hmUI.prop.VISIBLE, groups.length > 0)
//       saveButton.setProperty(hmUI.prop.Y, y + 80)
//       space.setProperty(hmUI.prop.Y, y + 160)
//       // if (groups.length > 0) {
//       //   for(let i = 0; i < groups.length; i++) {
//       //     if (groups[i] == null) groups
//       //     groups[i].setProperty(hmUI.prop.Y, startY + i * (cardH + cardM))
//       //   }
//       // }
//     }
    
//     // Создаёт транспорт
//     // А, В, Е, К, М, Н, О, Р, С, Т, У, Х
    
//     // let blocks = ['oil', 'oilFilter', 'salonFilter', 'fuelFilter', 'cooling', 'brake']
//     function createTrans() {
//       let autoId = time.getTime()
//       var trans = {
//         autoID: autoId,
//         type: 0,
//         name: 'Name',
//         model: 'Model',
//         carnum: {
//             visible: true,
//             num: "а000аа",
//             reg: "00"
//         },
//         mileage: 0
//       }
//       return trans
//     }

//     // Создаёт карточку транспорта
//     function createCard(group, trans) {
//       const cardBG = group.createWidget(hmUI.widget.FILL_RECT, {
//         x: 0,
//         y: 0,
//         w: cardW,
//         h: cardH,
//         radius: 15,
//         color: 0x111111
//       })

//       group.createWidget(hmUI.widget.TEXT, {
//         x: cardP,
//         y: cardP,
//         w: cardW - cardP * 2,
//         h: 20,
//         text: getText("type"),
//         text_size: 16,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorSecondary
//       })
//       group.createWidget(hmUI.widget.TEXT, {
//         x: cardP,
//         y: cardP + 25,
//         w: cardW - cardP * 2,
//         h: 30,
//         text: getText("type0"),
//         text_size: 24,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorPrimary
//       })
//       group.createWidget(hmUI.widget.TEXT, {
//         x: cardP + hmUI.getTextLayout(getText("type0"), { text_size: 24, text_width: screenWidth }).width + 80,
//         y: cardP + 25,
//         w: cardW - cardP * 2,
//         h: 30,
//         text: getText("type1"),
//         text_size: 24,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorPrimary
//       })

//       const radioGroup = group.createWidget(hmUI.widget.RADIO_GROUP, {
//         x: cardP,
//         y: cardP + 20,
//         w: cardW - cardP * 2,
//         h: 40,
//         unselect_src: 'radio_off.png',
//         select_src: 'radio_on.png',
//         check_func: (group, index, checked) => {}
//       })
//       // const radio1 = radioGroup.createWidget(hmUI.widget.STATE_BUTTON, {
//       //   x: hmUI.getTextLayout(getText("type0"), { text_size: 24, text_width: 0 }).width + 10,
//       //   y: 0,
//       //   w: 40,
//       //   h: 40
//       // })
//       // const radio2 = radioGroup.createWidget(hmUI.widget.STATE_BUTTON, {
//       //   x: hmUI.getTextLayout(getText("type0"), { text_size: 24, text_width: screenWidth }).width + 80 + hmUI.getTextLayout(getText("type1"), { text_size: 24, text_width: screenWidth }).width + 10,
//       //   y: 0,
//       //   w: 40,
//       //   h: 40
//       // })
//       // radioGroup.setProperty(hmUI.prop.INIT, radio1)

//       group.createWidget(hmUI.widget.TEXT, {
//         x: cardP,
//         y: cardP + 70,
//         w: cardW - cardP * 2,
//         h: 20,
//         text: `Марка`,
//         text_size: 16,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorSecondary
//       })
//       group.createWidget(hmUI.widget.TEXT, {
//         x: cardP,
//         y: cardP + 95,
//         w: cardW - cardP * 2,
//         h: 30,
//         text: trans.name,
//         text_size: 24,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorPrimary
//       })

//       group.createWidget(hmUI.widget.TEXT, {
//         x: cardP,
//         y: cardP + 140,
//         w: cardW - cardP * 2,
//         h: 20,
//         text: `Модель`,
//         text_size: 16,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorSecondary
//       })
//       group.createWidget(hmUI.widget.TEXT, {
//         x: cardP,
//         y: cardP + 170,
//         w: cardW - cardP * 2,
//         h: 30,
//         text: trans.model,
//         text_size: 24,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorPrimary
//       })

//       group.createWidget(hmUI.widget.TEXT, {
//         x: cardP,
//         y: cardP + 210,
//         w: cardW - cardP * 2,
//         h: 20,
//         text: `Отображать госномер`,
//         text_size: 16,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorSecondary
//       })
//       group.createWidget(hmUI.widget.SLIDE_SWITCH, {
//         x: cardP,
//         y: cardP + 240,
//         w: 96,
//         h: 40,
//         un_select_bg: 'switch_off.png',
//         select_bg: 'switch_on.png',
//         slide_src: 'switch_fg.png',
//         slide_select_x: 36,
//         slide_un_select_x: 4,
//         checked: trans.carnum.visible,
//         checked_change_func: (slide, checked) => {
//           trans.carnum.visible = checked
//         }
//       })

//       const carNumDesk = group.createWidget(hmUI.widget.TEXT, {
//         x: cardP,
//         y: cardP + 290,
//         w: cardW - cardP * 2,
//         h: 20,
//         text: `Госномер`,
//         text_size: 16,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorSecondary
//       })
//       const carNum = group.createWidget(hmUI.widget.TEXT, {
//         x: cardP,
//         y: cardP + 315,
//         w: cardW - cardP * 2,
//         h: 30,
//         text: `А000АА`,
//         text_size: 24,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorPrimary
//       })

//       const carNumRegDesk = group.createWidget(hmUI.widget.TEXT, {
//         x: cardW / 2 + cardP,
//         y: cardP + 290,
//         w: cardW - cardP * 2,
//         h: 20,
//         text: `Регион`,
//         text_size: 16,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorSecondary
//       })
//       const carNumReg = group.createWidget(hmUI.widget.TEXT, {
//         x: cardW / 2 + cardP,
//         y: cardP + 315,
//         w: cardW - cardP * 2,
//         h: 30,
//         text: `000`,
//         text_size: 24,
//         align_h: hmUI.align.LEFT,
//         align_v: hmUI.align.CENTER_V,
//         color: colorPrimary
//       })
//       const deleteCard = group.createWidget(hmUI.widget.BUTTON, {
//         x: cardP,
//         y: cardP + 360,
//         w: cardW - cardP * 2,
//         h: buttonH,
//         text: getText('delete'),
//         text_size: 24,
//         normal_color: '0xff3333',
//         press_color: '0x333333',
//         radius: 15,
//         click_func: () => {
//           removeTransport(trans.autoID)
//           hmUI.deleteWidget(group)
//           groups.splice()
//           updatePos()
//         }
//       })
//     }

//     if (!params || !params.new) {
//       var transports = getTransport()

//       for(const key in transports) {
//         groups[groups.length] = viewContainer.createWidget(hmUI.widget.GROUP, {
//           x: sideM,
//           y: startY + groups.length * (cardH + cardM),
//           w: cardW,
//           h: cardH
//         })
//         createCard(groups[groups.length], transports[key])
//       }
//     }

//     let buttonW = 200
//     let buttonH = 50
//     const addButton = viewContainer.createWidget(hmUI.widget.BUTTON, {
//       x: (screenWidth - buttonW) / 2,
//       y: screenHeight,
//       w: buttonW,
//       h: buttonH,
//       text: getText('add'),
//       normal_color: 0x111111,
//       press_color: 0x666666,
//       text_size: 24,
//       radius: 15,
//       click_func: () => {
//         groups[groups.length] = viewContainer.createWidget(hmUI.widget.GROUP, {
//           x: sideM,
//           y: startY + groups.length * (cardH + cardM),
//           w: cardW,
//           h: cardH
//         })

//         updatePos()

//         const newTrans = createTrans()
//         createCard(groups[groups.length - 1], newTrans)
//       }
//     })

//     const saveButton = viewContainer.createWidget(hmUI.widget.BUTTON, {
//       x: (screenWidth - 200) / 2,
//       y: screenHeight,
//       w: 200,
//       h: 50,
//       text: getText('save'),
//       normal_color: accentColor,
//       press_color: 0x666666,
//       text_size: 24,
//       radius: 15,
//       click_func: () => {
//         back()
//       }
//     })

//     const space = viewContainer.createWidget(hmUI.widget.FILL_RECT, {
//       x: 0,
//       y: screenHeight,
//       w: screenWidth,
//       h: screenHeight / 10
//     })
    
//     updatePos()
//   },
//   build() {},
//   onDestroy() {},
// });
