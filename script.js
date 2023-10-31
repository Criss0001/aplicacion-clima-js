let urlBase = 'https://api.openweathermap.org/data/2.5/weather'
let api_key = '5c11bffb1d11abf2b07a0d56f7e53a1c'
let difkelvin = 273.15
// let ciudad = 'paris'

document.getElementById('botonBusqueda').addEventListener('click', () => {
    const ciudad = document.getElementById('ciudadEntrada').value
    if(ciudad){
        fetchDatosClima(ciudad)
    }    
})

function fetchDatosClima(ciudad){
    fetch(`${urlBase}?q=${ciudad}&appid=${api_key}`)
    .then(data => data.json())
    .then(data => mostrarDatosClima(data))
}

function mostrarDatosClima(data) {
    // console.log(data)
    const divDatosClima = document.getElementById('datosClima')
    divDatosClima.innerHTML =''

    const ciudadNombre = data.name
    const paisNombre = data.sys.country
    const temperatura = data.main.temp
    const descripcion = data.weather[0].description
    const sensacion = data.main.feels_like
    const humedad = data.main.humidity
    const icono = data.weather[0].icon

    // creamos los elementos
    const ciudadTitulo = document.createElement('h2')
    ciudadTitulo.textContent = `${ciudadNombre}, ${paisNombre}`	

    const temperaturaInfo = document.createElement('p')
    temperaturaInfo.textContent = `La temperatura es:  ${Math.floor(temperatura-difkelvin)}°C`
   
    const humedadInfo = document.createElement('p')
    humedadInfo.textContent = `La humedad es:  ${humedad}%`

    const sensacionInfo = document.createElement('p')
    sensacionInfo.textContent = `La sensación térmica es: ${Math.floor(sensacion-difkelvin)}°C`

    const iconoInfo = document.createElement('img')
    iconoInfo.src = `http://openweathermap.org/img/wn/${icono}@2x.png`

    const descripcionInfo = document.createElement('p')
    descripcionInfo.textContent = `La descripción es: ${descripcion}`
    
    // Meter el hijo en el div 
    divDatosClima.appendChild(ciudadTitulo)
    divDatosClima.appendChild(temperaturaInfo)
    divDatosClima.appendChild(sensacionInfo)
    divDatosClima.appendChild(descripcionInfo)
    divDatosClima.appendChild(iconoInfo)
    divDatosClima.appendChild(humedadInfo)


}




