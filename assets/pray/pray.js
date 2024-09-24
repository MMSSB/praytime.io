// Request notification permission
if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            alert('Notification permission denied');
        }
    });
}

// Automatically access user's location to calculate prayer times
document.addEventListener('DOMContentLoaded', () => {
    const timesListToday = document.getElementById('times-today');
    const cityNameElement = document.getElementById('city-name');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Fetch the city name from the latitude and longitude
            getCityName(latitude, longitude);

            // Calculate today's prayer times
            const today = new Date();
            calculatePrayerTimes(latitude, longitude, today, timesListToday);

            // Check and schedule notifications
            scheduleAdhanNotifications(latitude, longitude, today);
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
            cityNameElement.textContent = city;
        })
        .catch(error => {
            console.error('Error fetching city name:', error);
            cityNameElement.textContent = "Your City";
        });
}

// Function to schedule notifications at adhan times
function scheduleAdhanNotifications(latitude, longitude, date) {
    const params = adhan.CalculationMethod.MuslimWorldLeague();
    params.madhab = adhan.Madhab.Shafi;

    const coordinates = new adhan.Coordinates(latitude, longitude);
    const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

    // Check for each prayer time and schedule a notification if it's still in the future
    const currentTime = new Date();
    const adhanTimes = [
        { name: "Fajr", time: prayerTimes.fajr },
        { name: "Dhuhr", time: prayerTimes.dhuhr },
        { name: "Asr", time: prayerTimes.asr },
        { name: "Maghrib", time: prayerTimes.maghrib },
        { name: "Isha", time: prayerTimes.isha },
    ];

    adhanTimes.forEach(prayer => {
        const timeUntilPrayer = prayer.time - currentTime;
        if (timeUntilPrayer > 0) {
            setTimeout(() => {
                sendAdhanNotification(prayer.name);
            }, timeUntilPrayer);
        }
    });
}

// Function to send Adhan notification
function sendAdhanNotification(prayerName) {
    if (Notification.permission === 'granted') {
        new Notification(`Adhan: ${prayerName}`, {
            body: `It's time for ${prayerName} prayer.`,
            icon: '/adhan_icon.png',
        });
    }
}
