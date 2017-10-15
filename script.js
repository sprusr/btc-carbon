var averageDeviceHashrate = 14000000000000, // H/s of Antminer S9
    averageDevicePower = 1350, // W of Antminer S9
    selectedPeriodHours = 365.25 * 24

function updateFigures() {
  var hashrateRequest = new Request('https://blockchain.info/q/hashrate?cors=true')
  var carbonIntensityRequest = new Request('https://api.carbonintensity.org.uk/intensity')

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
          document.getElementById('carbon').textContent = `${formatSI(btcCarbon)}g`
          document.getElementById('comparison').textContent = `${getCarbonComparison(btcCarbon)}`
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
function formatSI(a,b){if(0==a)return'0';var c=1024,d=b||2,e=['','K','M','G','T','P','E','Z','Y'],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+' '+e[f]}

// return string of something with similar carbon emission
function getCarbonComparison(carbon) {
  if (carbon < 30000) {
    return 'something quite small'
  } else if (carbon < 60000) { // 41100g
    return 'a 100 mile journey in an average family car'
  } else if (carbon < 164999999) {
    return 'something'
  } else if (carbon < 275000000) {
    return 'half the takeoff emissions of a Falcon 9 rocket'
  } else {
    return 'something really big'
  }
}

updateFigures()
setInterval(updateFigures, 2000)
document.getElementById('timeframe').addEventListener('change', handlePeriodChange)
