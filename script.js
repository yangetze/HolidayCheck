const year = 2024; // Nager.Date supports recent years freely

const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const currentMonthIndex = new Date().getMonth();
const currentMonthName = monthNames[currentMonthIndex];

// Update static subtitle
document.getElementById('month-subtitle').textContent = `Celebraciones de ${currentMonthName} ${year}`;

const countrySelect = document.getElementById('country-select');

function fetchHolidays(countryCode) {
    const listContainer = document.getElementById('holidays-list');
    listContainer.innerHTML = '<div class="loading">Cargando festivos...</div>';

    // Using Nager.Date API (Public, CORS-friendly)
    fetch(`https://date.nager.at/api/v3/publicholidays/${year}/${countryCode}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Nager.Date returns a flat array of holiday objects
            const allHolidays = data;
            listContainer.innerHTML = '';

            if (allHolidays && allHolidays.length > 0) {
                // Filter by current month
                const currentMonthHolidays = allHolidays.filter(h => {
                    const hDate = new Date(h.date + 'T00:00:00');
                    return hDate.getMonth() === currentMonthIndex;
                });

                if (currentMonthHolidays.length === 0) {
                    listContainer.innerHTML = `<div class="empty-state">No hay festivos en ${currentMonthName} para este país.</div>`;
                    return;
                }

                const ul = document.createElement('ul');
                ul.id = 'holidays-list-container';

                currentMonthHolidays.forEach((holiday, index) => {
                    const li = document.createElement('li');
                    li.className = 'holiday-card';
                    li.style.animationDelay = `${index * 0.07}s`;

                    const dateObj = new Date(holiday.date + 'T00:00:00');

                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const yearStr = dateObj.getFullYear();
                    const dateFormatted = `${day}-${month}-${yearStr}`;

                    const weekdayName = dateObj.toLocaleDateString('es-CO', { weekday: 'long' });
                    const weekdayCapitalized = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1);

                    // Map 'localName' to name for display
                    const holidayName = holiday.localName || holiday.name;

                    li.innerHTML = `
                        <div class="holiday-name">${holidayName}</div>

                        <div class="holiday-info-col">
                            <span class="holiday-label">Fecha</span>
                            <span class="holiday-value date-badge">${dateFormatted}</span>
                        </div>

                        <div class="holiday-info-col">
                            <span class="holiday-label">Día</span>
                            <span class="holiday-value weekday-text">${weekdayCapitalized}</span>
                        </div>
                    `;
                    ul.appendChild(li);
                });
                listContainer.appendChild(ul);
            } else {
                listContainer.innerHTML = '<div class="empty-state">No se encontraron datos.</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching holidays:', error);
            listContainer.innerHTML = `<div class="error">Error al cargar: ${error.message}</div>`;
        });
}

// Initial Load
fetchHolidays(countrySelect.value);

// Event Listener
countrySelect.addEventListener('change', (e) => {
    fetchHolidays(e.target.value);
});
