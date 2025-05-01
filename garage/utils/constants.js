const TRANSPORT_DETAILS = ['oil', 'oilFilter', 'salonFilter', 'fuelFilter', 'cooling', 'brake', 'transOil', 'airFilter', 'spark', 'chain']
export const TRANSPORT_TYPES = ['truck', 'auto', 'moto', 'moped', 'bike', 'scooter']

var details = {}
TRANSPORT_DETAILS.forEach(e => {
    switch (e) {
        case "spark":
            details[e] = {
                types: {
                    arr: ['spark', 'sparks'],
                    current: '0'
                },
                visible: false,
                period: '5000',
                lastUpdate: '0'
            }
            break
        case "chain":
            details[e] = {
                types: {
                    arr: ['chain', 'belt'],
                    current: '0'
                },
                visible: false,
                period: '5000',
                lastUpdate: '0'
            }
            break
        default:
            details[e] = {
                visible: false,
                period: '5000',
                lastUpdate: '0'
            }
            break
    }
})
export const TRANSPORT_DETAILS_PARAMS = details

export const COLORS = {
    primary: '0xffffff',
    secondary: '0xaaaaaa',
    accentArray: ['ffffff', 'e74c3c', 'e67e22', 'f1c40f', '2ecc71', '1abc9c', '3498db', '9b59b6'],
    carnum: {
        text: ['000000', '000000', 'ffffff', 'ffffff', 'ffffff', 'ffffff'],
        bg: ['ffffff', 'ff8800', '0033aa', '000000', 'aa3333', '006633']
    }
}

export const NEW_TRANSPORT = {
    autoID: 0,
    type: 'auto',
    name: "Brand",
    model: "Model",
    carnum: {
        visible: false,
        num: "а 000 аа",
        reg: "000",
        format: 1,
        color: 0
    },
    mileage: {
        current: '0',
        auto: false,
        perMonth: '1000'
    },
    maintenance: {
        last: '0',
        period: '15000'
    },
    accent: {
        isCustom: false,
        customColor: '000000'
    },
    details: {...details}
}

export const SERVICE_PERMISSION = ["device:os.bg_service"]