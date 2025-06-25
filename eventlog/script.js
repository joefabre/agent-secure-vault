// Initialize events array from localStorage or empty array
let events = JSON.parse(localStorage.getItem('events')) || [];

// Show/Hide form sections
function showAddEvent() {
    document.getElementById('addEventForm').style.display = 'block';
    document.getElementById('reportsSection').style.display = 'none';
    // Set default date and time
    const now = new Date();
    document.getElementById('eventDate').value = now.toISOString().split('T')[0];
    document.getElementById('eventTime').value = now.toTimeString().slice(0, 5);
}

function showReports() {
    document.getElementById('addEventForm').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'block';
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    document.getElementById('startDate').value = start.toISOString().split('T')[0];
    document.getElementById('endDate').value = end.toISOString().split('T')[0];
}

// Save new event
function saveEvent(e) {
    e.preventDefault();

    const event = {
        id: Date.now(), // Unique ID for the event
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        category: document.getElementById('eventCategory').value,
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        tags: document.getElementById('eventTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag), // Remove empty tags
        timestamp: new Date().toISOString()
    };

    events.unshift(event); // Add to beginning of array
    localStorage.setItem('events', JSON.stringify(events));
    
    // Reset form
    e.target.reset();
    // Set current date and time again
    const now = new Date();
    document.getElementById('eventDate').value = now.toISOString().split('T')[0];
    document.getElementById('eventTime').value = now.toTimeString().slice(0, 5);

    // Refresh events list
    displayEvents(events);

    // Show success message
    alert('Event saved successfully!');
}

// Generate report based on filters
function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const category = document.getElementById('filterCategory').value;
    const tags = document.getElementById('filterTags').value
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag);

    let filteredEvents = events.filter(event => {
        // Date range filter
        const eventDate = event.date;
        const dateMatch = (!startDate || eventDate >= startDate) && 
                         (!endDate || eventDate <= endDate);

        // Category filter
        const categoryMatch = !category || event.category === category;

        // Tags filter
        const eventTags = event.tags.map(tag => tag.toLowerCase());
        const tagsMatch = tags.length === 0 || 
                         tags.some(tag => eventTags.includes(tag));

        return dateMatch && categoryMatch && tagsMatch;
    });

    displayReport(filteredEvents);
}

// Display report results
function displayReport(filteredEvents) {
    const reportResults = document.getElementById('reportResults');
    
    if (filteredEvents.length === 0) {
        reportResults.innerHTML = '<p>No events found matching the criteria.</p>';
        return;
    }

    // Group events by category
    const groupedEvents = filteredEvents.reduce((acc, event) => {
        acc[event.category] = acc[event.category] || [];
        acc[event.category].push(event);
        return acc;
    }, {});

    // Generate report HTML
    let html = '<div class="report-summary">';
    html += `<h3>Total Events: ${filteredEvents.length}</h3>`;
    html += '<h3>Events by Category:</h3>';
    html += '<ul>';
    
    for (const category in groupedEvents) {
        html += `<li>${category}: ${groupedEvents[category].length} events</li>`;
    }
    
    html += '</ul></div>';
    html += '<h3>Detailed Events:</h3>';
    
    // Add filtered events
    html += filteredEvents.map(event => createEventHTML(event)).join('');
    
    reportResults.innerHTML = html;
}

// Display events in the recent events list
function displayEvents(eventsToDisplay = events) {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = eventsToDisplay
        .slice(0, 10) // Show only the 10 most recent events
        .map(event => createEventHTML(event))
        .join('');
}

// Create HTML for a single event
function createEventHTML(event) {
    return `
        <div class="event-item" data-id="${event.id}">
            <div class="event-header">
                <h3 class="event-title">${event.title}</h3>
                <span class="event-datetime">${event.date} ${event.time}</span>
            </div>
            <span class="event-category ${event.category}">${event.category}</span>
            <p class="event-description">${event.description}</p>
            <div class="event-tags">
                ${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <button onclick="deleteEvent(${event.id})" class="delete-btn">Delete</button>
        </div>
    `;
}

// Delete an event
function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(event => event.id !== eventId);
        localStorage.setItem('events', JSON.stringify(events));
        displayEvents();
        // If reports section is visible, refresh the report
        if (document.getElementById('reportsSection').style.display !== 'none') {
            generateReport();
        }
    }
}

// Export events to CSV
function exportToCSV() {
    const headers = ['Date', 'Time', 'Category', 'Title', 'Description', 'Tags'];
    const csvContent = [
        headers.join(','),
        ...events.map(event => [
            event.date,
            event.time,
            event.category,
            `"${event.title.replace(/"/g, '""')}"`,
            `"${event.description.replace(/"/g, '""')}"`,
            `"${event.tags.join(', ')}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `events_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Initialize the display
document.addEventListener('DOMContentLoaded', () => {
    showAddEvent(); // Show the add event form by default
    displayEvents(); // Display recent events
});
