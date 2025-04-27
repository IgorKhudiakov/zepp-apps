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
    accentArray: ['0xffffff', '0xe74c3c', '0xe67e22', '0xf1c40f', '0x2ecc71', '0x1abc9c', '0x3498db', '0x9b59b6']
}

export const NEW_TRANSPORT = {
    autoID: 0,
    type: 'auto',
    name: "Brand",
    model: "Model",
    carnum: {
        visible: false,
        num: "а000аа",
        reg: "000"
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