window.populateCalendar = function(date) {
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendarBody.appendChild(document.createElement('div'));
    }

    for (let i = 1; i <= lastDate; i++) {
        const dayCell = document.createElement('div');
        dayCell.innerText = i;
        if (i === date.getDate() && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()) {
            dayCell.style.backgroundColor = '#555';
        }
        calendarBody.appendChild(dayCell);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let currentMonth = new Date();

    document.getElementById('taskbarTime').addEventListener('click', toggleCalendarPopup);
    document.addEventListener('click', hideCalendarPopup);
    document.addEventListener('touchstart', hideCalendarPopup);

    function toggleCalendarPopup() {
        const calendarPopup = document.getElementById('calendarPopup');
        if (calendarPopup.style.display === 'block') {
            calendarPopup.style.display = 'none';
        } else {
            calendarPopup.style.display = 'block';
            console.log(`Calendar popup opened. Bringing to front.`);
            bringToFront(calendarPopup); // Bring the calendar popup to the front when opening
        }
    }

    function hideCalendarPopup(event) {
        const calendarPopup = document.getElementById('calendarPopup');
        if (calendarPopup.style.display === 'block' && !calendarPopup.contains(event.target) && !document.getElementById('taskbarTime').contains(event.target)) {
            calendarPopup.style.display = 'none';
        }
    }

    window.updateTime = function() {
        const timeZone = localStorage.getItem('timeZone') || 'UTC';
        const timeFormat = localStorage.getItem('timeFormat') || '12-hour';
        const now = new Date();

        const timeOptions = {
            timeZone: timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: timeFormat === '12-hour'
        };
        const dateOptions = {
            timeZone: timeZone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
        const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(now);

        document.getElementById('taskbarTime').querySelector('span').innerText = formattedTime;
        document.querySelector('.calendar-time').innerText = formattedTime;
        document.querySelector('.calendar-date').innerText = formattedDate;

        populateCalendar(currentMonth);
    };

    updateTime();
    setInterval(updateTime, 1000);
});
