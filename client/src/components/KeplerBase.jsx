import React from 'react'
import axios from 'axios'

export default class KeplerBase extends React.Component {
  state = {

  }

  componentDidMount() {
    axios.get('/api/dailyTimeSeries.json')
      .then(x => console.log(x.data))
  }

  render() {
    return (
      <>
      </>
    )
  }


}
