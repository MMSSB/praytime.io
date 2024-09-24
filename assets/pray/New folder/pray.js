document.addEventListener('DOMContentLoaded', () => {
            const timesListToday = document.getElementById('times-today');
            const timesListTomorrow = document.getElementById('times-tomorrow');
            const todayButton = document.getElementById('show-today');
            const tomorrowButton = document.getElementById('show-tomorrow');
            const cityNameElement = document.getElementById('city-name');

            // Event listener for showing today's prayer times
            todayButton.addEventListener('click', () => {
                getLocationAndCalculatePrayerTimes(new Date(), timesListToday);
                timesListTomorrow.style.display = 'none'; // Hide tomorrow's times
                timesListToday.style.display = 'block';  // Show today's times
            });

            // Event listener for showing tomorrow's prayer times
            tomorrowButton.addEventListener('click', () => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                getLocationAndCalculatePrayerTimes(tomorrow, timesListTomorrow);
                timesListToday.style.display = 'none'; // Hide today's times
                timesListTomorrow.style.display = 'block';  // Show tomorrow's times
            });

            // Function to get the user's location and calculate prayer times
            function getLocationAndCalculatePrayerTimes(date, timesList) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        // Fetch the city name from the latitude and longitude
                        getCityName(latitude, longitude);

                        calculatePrayerTimes(latitude, longitude, date, timesList);
                    }, (error) => {
                        alert('Unable to retrieve your location');
                    });
                } else {
                    alert('Geolocation is not supported by this browser.');
                }
            }

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
        });