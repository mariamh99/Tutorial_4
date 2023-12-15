document.addEventListener('DOMContentLoaded', () => {
    const cityDropdown = document.getElementById('city');
    const getForecastBtn = document.getElementById('getForecast');
    const weatherDisplay = document.getElementById('weatherDisplay');

    const csvFilePath = 'city_coordinates.csv';

    fetch(csvFilePath)
        .then(response => response.text())
        .then(data => {
            const cities = parseCSV(data);
            populateDropdown(cities);
        })
        .catch(error => {
            console.error('Error fetching city coordinates:', error);
        });

    function parseCSV(data) {
        const lines = data.split('\n');
        const cities = [];

        for (let i = 1; i < lines.length; i++) {
            const [latitude, longitude, city, country] = lines[i].split(',');
            cities.push({ latitude, longitude, city, country });
        }

        return cities;
    }

    function populateDropdown(cities) {
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = `${city.latitude},${city.longitude}`;
            option.textContent = `${city.city}, ${city.country}`;
            cityDropdown.appendChild(option);
        });
    }

    getForecastBtn.addEventListener('click', () => {
        const selectedCity = cityDropdown.value;
        const [latitude, longitude] = selectedCity.split(',');

        // Fetch weather data in JSON format from the API
        const apiUrl = `http://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civil&output=json`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                renderWeatherForecast(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                weatherDisplay.innerHTML = '<p>Error fetching weather data. Please try again.</p>';
            });
    });
    function getWeatherIcon(weatherCondition) {
        // Define a mapping of weather conditions to icon URLs
        const iconMap = {
            "clearnight": "images/clear.png",
            "clearday": "images/clear.png",
            "cloudynight": "images/cloudy.png",
            "cloudyday": "images/cloudy.png",
            "lightrainnight": "images/lightrain.png",
            "lightrainday": "images/lightrain.png",
            "pcloudyday": "images/pcloudy.png",
            "pcloudynight" : "images/pcloudy.png",
            "oshowerday": "images/oshower.png",
            "oshowernight": "images/oshower.png", 
            // Add more mappings for other weather conditions
        };
    
        // Get the corresponding icon URL for the weather condition
        return iconMap[weatherCondition] || "N/A"; // Return a default icon URL if condition not found
    }
    

    function renderWeatherForecast(data) {
        const days = data.dataseries.slice(0, 7);
        let weatherForecastHTML = '<div class="row">';
        
        days.forEach((day, index) => {
            const currentDate = new Date(); // Replace this with the date of the forecast
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + index);
            const formattedDate = date.toLocaleDateString();
            const weatherIcon = getWeatherIcon(day.weather); // Fetch weather condition for icon
            const temps = days
            .slice(index * 3, (index + 1) * 3)
            .map(d => d.temp2m)
            .filter(temp => !isNaN(temp));
        
        // Check if there are valid temperatures to calculate max and min
        const maxTemp = temps.length > 0 ? Math.max(...temps) : 'N/A';
        const minTemp = temps.length > 0 ? Math.min(...temps) : 'N/A';
        
        weatherForecastHTML += `
            <div class="col-md-2 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${formattedDate}</h5>
                        <img src="${weatherIcon}" class="card-img-top" alt="Weather Icon">
                        <p class="card-text">Max Temp: ${maxTemp}°C</p>
                        <p class="card-text">Min Temp: ${minTemp}°C</p>
                    </div>
                </div>
            </div>
        `;
    });

    weatherForecastHTML += '</div>';
    weatherDisplay.innerHTML = weatherForecastHTML;
}

    
    
});
