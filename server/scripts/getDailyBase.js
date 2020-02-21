const axios = require('axios')
const fs = require('fs')

const apiBase = `https://gbfs.citibikenyc.com/gbfs/en`
const stationStatusApi = `${apiBase}/station_status.json`
const stationInfoApi = `${apiBase}/station_information.json`

export default function getDailyBase() {
  return axios.get(stationStatusApi)
    .then(x => x.data)
    .then(getStationInfoAndMergeWithStatus)
    .then(cleanStationData)
    .then(writeToFile)
    .catch(console.error)
}

function getStationInfoAndMergeWithStatus(status) {
  return axios.get(stationInfoApi)
    .then(x => x.data.data)
    .then(x => x.stations.map(y =>
      Object.assign({}, y, status.data.stations.find(
          z => z.station_id === y.station_id
        ))
    ))
}

function cleanStationData(s) {
  return s.map(x => ({
      id: x.station_id,
      lat: x.lat,
      lon: x.lon,
      timestamp: x.last_reported,
      usage: x.is_renting + x.is_returning,
    }))
}

function writeToFile(x) {
  const data = JSON.stringify(x)

  fs.writeFile('./data/dailyBase.json', data, 'utf-8', (err) => {
    if (err) throw err
    console.log('The file has been saved!')
  })
}
