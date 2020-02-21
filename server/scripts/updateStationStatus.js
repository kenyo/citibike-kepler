/*
gets current station status and creates new dailyTimeSeries.json which appends
to dailyBase. should be run every five minutes to give view of daily activity
*/

const axios = require('axios')
const fs = require('fs')
const { getDailyBase, cleanStationData } = require('./getDailyBase')

const apiBase = `https://gbfs.citibikenyc.com/gbfs/en`
const stationStatusApi = `${apiBase}/station_status.json`

function updateStationStatus() {
  getFilePromise('./data/dailyTimeSeries.json')
    .then(getNewStatus)
    .then(writeToFile)
    .catch(e => {
      console.error(e)
      initializeTimeSeries()
    })
}

function initializeTimeSeries() {
  Promise.all([
      getFilePromise('./data/dailyBase.json'),
      axios.get(stationStatusApi),
    ])
      .then(x => generateNewStatusWithBaseInfo(x[0], x[1].data.data))
      .then(writeToFile)
      .catch(e => {
        console.error(e)
        getDailyBase().then(initializeTimeSeries)
      })
}

function getNewStatus(base) {
  return axios.get(stationStatusApi)
    .then(x => generateNewStatusWithBaseInfo(base, x.data.data))
}

function generateNewStatusWithBaseInfo(base, newStatus) {
  return base.concat(cleanStationData(base.map(x =>
    Object.assign({}, x, newStatus.stations.find(
      y => y.station_id === x.id)))
    ))
}

function writeToFile(x) {
  const data = JSON.stringify(x)

  fs.writeFile('./data/dailyTimeSeries.json', data, 'utf-8', (err) => {
    if (err) throw err
    console.log('The file has been saved!')
  })
}

function getFilePromise(file) {
  return new Promise(function(ok, notOk) {
    fs.readFile(file, 'utf-8', function(err, data) {
        if (err) {
          notOk(err)
        } else {
          ok(JSON.parse(data))
        }
    })
  })
}

module.exports = updateStationStatus
