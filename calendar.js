document.addEventListener('DOMContentLoaded', () => {
    let currentMonth = new Date();

    function updateTime() {
        const now = new Date();
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const formattedTime = new Intl.DateTimeFormat('en-US', options).format(now);
        document.getElementById('taskbarTime').querySelector('span').innerText = formattedTime;

        const dateOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
        document.querySelector('.calendar-time').innerText = formattedTime;
        document.querySelector('.calendar-date').innerText = formattedDate;

        populateCalendar(currentMonth);
    }

    function populateCalendar(date) {
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

    function toggleCalendarPopup() {
        const calendarPopup = document.getElementById('calendarPopup');
        calendarPopup.style.display = calendarPopup.style.display === 'block' ? 'none' : 'block';
    }

    function hideCalendarPopup(event) {
        const calendarPopup = document.getElementById('calendarPopup');
        if (calendarPopup.style.display === 'block' && !calendarPopup.contains(event.target) && !document.getElementById('taskbarTime').contains(event.target)) {
            calendarPopup.style.display = 'none';
        }
    }

    document.getElementById('taskbarTime').addEventListener('click', toggleCalendarPopup);

    document.addEventListener('click', hideCalendarPopup);
    document.addEventListener('touchstart', hideCalendarPopup);



    updateTime();
    setInterval(updateTime, 1000);
});
