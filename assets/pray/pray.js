document.addEventListener('DOMContentLoaded', () => {
    const timesListToday = document.getElementById('times-today');
    const timesListTomorrow = document.getElementById('times-tomorrow');
    const cityNameElement = document.getElementById('city-name');
    const todayButton = document.getElementById('show-today');
    const tomorrowButton = document.getElementById('show-tomorrow');

    // Automatically display today's prayer times on page load
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Fetch the city name from latitude and longitude
            getCityName(latitude, longitude);

            // Show today's prayer times
            const today = new Date();
            calculatePrayerTimes(latitude, longitude, today, timesListToday);

            // Event listener to show today's prayer times
            todayButton.addEventListener('click', () => {
                timesListToday.style.display = 'block';  // Show today's times
                timesListTomorrow.style.display = 'none'; // Hide tomorrow's times
            });

            // Event listener to show tomorrow's prayer times
            tomorrowButton.addEventListener('click', () => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1); // Get tomorrow's date
                calculatePrayerTimes(latitude, longitude, tomorrow, timesListTomorrow);

                timesListTomorrow.style.display = 'block';  // Show tomorrow's times
                timesListToday.style.display = 'none'; // Hide today's times
            });
        }, (error) => {
            alert('Unable to retrieve your location');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Function to calculate prayer times
function calculatePrayerTimes(latitude, longitude, date, timesList) {
    const params = adhan.CalculationMethod.MuslimWorldLeague();
    params.madhab = adhan.Madhab.Shafi;

    const coordinates = new adhan.Coordinates(latitude, longitude);
    const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

    displayPrayerTimes(prayerTimes, Intl.DateTimeFormat().resolvedOptions().timeZone, timesList);
}

// Function to display prayer times
function displayPrayerTimes(prayerTimes, timezone, timesList) {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: timezone };
    timesList.innerHTML = `
        <li>Fajr: ${prayerTimes.fajr.toLocaleTimeString('en-US', options)}</li>
        <li>Dhuhr: ${prayerTimes.dhuhr.toLocaleTimeString('en-US', options)}</li>
        <li>Asr: ${prayerTimes.asr.toLocaleTimeString('en-US', options)}</li>
        <li>Maghrib: ${prayerTimes.maghrib.toLocaleTimeString('en-US', options)}</li>
        <li>Isha: ${prayerTimes.isha.toLocaleTimeString('en-US', options)}</li>
    `;
}

// Function to get the city name from latitude and longitude using Nominatim (OpenStreetMap)
function getCityName(latitude, longitude) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const city = data.address.city || data.address.town || data.address.village || "Unknown City";
            document.getElementById('city-name').textContent = city;
        })
        .catch(error => {
            console.error('Error fetching city name:', error);
            document.getElementById('city-name').textContent = "Your City";
        });
}
