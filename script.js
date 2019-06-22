var averageDeviceHashrate = 62000000000000, // H/s of Antminer S17 Pro
    // averageDeviceHashrate = 14000000000000, // H/s of Antminer S9
    averageDevicePower = 2790, // W of Antminer S17 Pro
    // averageDevicePower = 1350, // W of Antminer S9
    selectedPeriodHours = 365.25 * 24

function updateFigures() {
  var hashrateRequest = new Request('https://blockchain.info/q/hashrate?cors=true')
  var carbonIntensityRequest = new Request('https://api.carbonintensity.org.uk/intensity')
  var btcperblockRequest = new Request('https://blockchain.info/q/bcperblock?cors=true')
  var intervalRequest = new Request('https://blockchain.info/q/interval?cors=true')

  fetch(hashrateRequest)
    .then(function(response) {
      return response.text()
    })
    .then(function(hashrate) {
      var deviceCount = (hashrate * 1000000000) / averageDeviceHashrate,
          totalPower = deviceCount * averageDevicePower

      fetch(carbonIntensityRequest)
        .then(function(response) {
          return response.json()
        })
        .then(function(response) {
          var intensity = response.data[0].intensity.actual || response.data[0].intensity.forecast, // intensity in gCO2/kWh
              btcCarbon = intensity / 1000 * totalPower * selectedPeriodHours

          document.getElementById('hashrate').textContent = `${formatSI(hashrate * 1000000000)}H/s`
          document.getElementById('power').textContent = `${formatSI(totalPower)}W`
          document.getElementById('carbon').textContent = `${numberWithCommas(Math.round(btcCarbon / 1000000))} metric tonnes`
          //document.getElementById('comparison').textContent = `${getCarbonComparison(btcCarbon)}` // disabled until better facts are found!

          fetch(btcperblockRequest)
            .then(function(response) {
              return response.text()
            })
            .then(function(btcperblock) {
              fetch(intervalRequest)
                .then(function(response) {
                  return response.text()
                })
                .then(function(interval) {
                  var carbonPerBlock = intensity / 1000 * totalPower * (interval / 3600)
                      carbonPerCoin = carbonPerBlock / (btcperblock / 100000000)

                      document.getElementById('carbon-per-block').textContent = `${numberWithCommas(Math.round(carbonPerBlock / 100000) / 10)} metric tonnes`
                      document.getElementById('carbon-per-coin').textContent = `${numberWithCommas(Math.round(carbonPerCoin / 100000) / 10)} metric tonnes`
                })
            })
        })
    })
}

function handlePeriodChange(e) {
  var selectedPeriod = e.target.value

  switch (selectedPeriod) {
    case 'year':
      selectedPeriodHours = 8766
      break;
    case 'month':
      selectedPeriodHours = 744
      break;
    case 'week':
      selectedPeriodHours = 168
      break;
    case 'day':
      selectedPeriodHours = 24
      break;
    case 'hour':
      selectedPeriodHours = 1
      break;
  }

  updateFigures()
}

// convert number to Kilo, Mega, Giga...
function formatSI(a,b){if(0==a)return'0';var c=1000,d=b||2,e=['','K','M','G','T','P','E','Z','Y'],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+' '+e[f]}

// add commas to a long number
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// return string of something with similar carbon emission
function getCarbonComparison(carbon) {
  if (carbon < 30000) {
    return 'something quite small'
  } else if (carbon >= 30000 && carbon < 60000) { // 41100g
    return 'a 100 mile journey in an average family car'
  } else if (carbon >= 60000 && carbon < 165000000) {
    return 'something'
  } else if (carbon >= 165000000 && carbon < 275000000) {
    return 'half the takeoff emissions of a Falcon 9 rocket'
  } else if (carbon >= 275000000 && carbon < 999999999999) {
    return 'big'
  } else {
    return 'something really big'
  }
}

updateFigures()
setInterval(updateFigures, 2000)
document.getElementById('timeframe').addEventListener('change', handlePeriodChange)
