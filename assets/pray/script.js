document.addEventListener('DOMContentLoaded', () => {
    const timesListToday = document.getElementById('times-today');
    const timesListTomorrow = document.getElementById('times-tomorrow');
    const todayButton = document.getElementById('show-today');
    const tomorrowButton = document.getElementById('show-tomorrow');

    // Cairo's coordinates and timezone
    const latitude = 30.0444;
    const longitude = 31.2357;
    const timezone = "Africa/Cairo";

    // Event listener for showing today's prayer times
    todayButton.addEventListener('click', () => {
        calculatePrayerTimes(new Date(), timesListToday);
        timesListTomorrow.style.display = 'none'; // Hide tomorrow's times
        timesListToday.style.display = 'block';  // Show today's times
    });

    // Event listener for showing tomorrow's prayer times
    tomorrowButton.addEventListener('click', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        calculatePrayerTimes(tomorrow, timesListTomorrow);
        timesListToday.style.display = 'none'; // Hide today's times
        timesListTomorrow.style.display = 'block';  // Show tomorrow's times
    });

    // Function to calculate prayer times
    function calculatePrayerTimes(date, timesList) {
        const params = adhan.CalculationMethod.MuslimWorldLeague();
        params.madhab = adhan.Madhab.Shafi;

        const coordinates = new adhan.Coordinates(latitude, longitude);
        const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

        displayPrayerTimes(prayerTimes, timezone, timesList);
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
});
