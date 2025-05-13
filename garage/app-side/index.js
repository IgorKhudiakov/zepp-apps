import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'

function getTransport() {
  return settingsLib.getItem('transport')
    ? JSON.parse(settingsLib.getItem('transport'))
    : []
}
function removeTransport(id) {
  const transport = JSON.parse(settingsLib.getItem('transport'))
  delete transport[id]
  return transport
}

AppSideService(
  BaseSideService({
    onInit() { },
    onRequest(req, res) {
      if (req.method === "GET_TRANSPORT") {
        res(null, {
          result: getTransport()
        })
      }
    },
    onCall(req) {
      if (req.method === "SAVE_TRANSPORT") settingsLib.setItem('transport', JSON.stringify(req.params))
      else if (req.method === "SAVE_SETTINGS") settingsLib.setItem('settings', JSON.stringify(req.params))
    },
    onSettingsChange({ key, newValue, oldValue }) {
      if (key == "transport") {
        this.call({
          method: "SAVE_TRANSPORT",
          result: getTransport()
        })
      }
    },
    onRun() { },
    onDestroy() { }
  })
)