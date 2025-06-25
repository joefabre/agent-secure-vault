// Make all functions available in the global scope
window.generateDocumentNumber = function() {
    let counter = parseInt(localStorage.getItem('documentCounter') || '0');
    counter = (counter + 1) % 1000;
    localStorage.setItem('documentCounter', counter.toString());
    
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}-${counter.toString().padStart(3, '0')}`;
};

window.formatWebsiteLink = function(website) {
    if (website.match(/^(https?:\/\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w-./?%&=]*)?$/)) {
        const url = website.startsWith('http') ? website : `https://${website}`;
        return `<a href="${url}" target="_blank" class="stealth-link">${website}</a>`;
    }
    return website;
};

window.savePassword = function() {
    const website = document.getElementById('websiteInput').value;
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    if (website && username && password) {
        const timestamp = new Date().toLocaleString();
        const documentNumber = generateDocumentNumber();
        const passwordsListElement = document.getElementById('passwordsList');
        const passwordItemElement = document.createElement('div');
        passwordItemElement.classList.add('password-item');

        passwordItemElement.innerHTML = `
            <div class="password-field">[CLASSIFIED DOCUMENT #${documentNumber}]</div>
            <div class="password-field"><strong>TARGET:</strong> <span class="typewriter-text">${formatWebsiteLink(website)}</span></div>
            <div class="password-field"><strong>AGENT ID:</strong> <span class="typewriter-text">${username}</span></div>
            <div class="password-field">
                <strong>ACCESS KEY:</strong> 
                <span class="password-dots">${'•'.repeat(password.length)}</span>
                <span class="spy-icon" onclick="togglePassword(this, '${password}')">🔍</span>
            </div>
            <div class="password-field"><strong>TIMESTAMP:</strong> ${timestamp}</div>
            <div class="password-actions">
                <button class="delete-btn" onclick="deletePassword(this.parentElement.parentElement, '${website}')">DESTROY RECORD</button>
            </div>
        `;

        passwordsListElement.appendChild(passwordItemElement);

        // Apply typewriter effect
        const typewriterElements = passwordItemElement.querySelectorAll('.typewriter-text');
        typewriterElements.forEach(element => {
            const text = element.innerHTML;
            typewriterText(element, text);
        });

        // Clear input fields
        document.getElementById('websiteInput').value = '';
        document.getElementById('usernameInput').value = '';
        document.getElementById('passwordInput').value = '';

        // Save to local storage
        saveToLocal(website, username, password, timestamp, documentNumber);
    } else {
        alert('WARNING: ALL FIELDS MUST BE COMPLETED FOR SECURE STORAGE');
    }
};

window.typewriterText = function(element, text, speed = 50) {
    if (text.includes('<a')) {
        element.innerHTML = text;
        return;
    }

    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
};

window.togglePassword = function(icon, password) {
    const dotsSpan = icon.previousElementSibling;
    const isHidden = !icon.classList.contains('showing');
    
    if (isHidden) {
        icon.classList.add('showing');
        typewriterText(dotsSpan, password);
        setTimeout(() => {
            dotsSpan.textContent = '•'.repeat(password.length);
            icon.classList.remove('showing');
        }, 5000);
    } else {
        dotsSpan.textContent = '•'.repeat(password.length);
        icon.classList.remove('showing');
    }
};

window.saveToLocal = function(website, username, password, timestamp, documentNumber) {
    let passwords = JSON.parse(localStorage.getItem('passwords')) || [];
    passwords.push({ website, username, password, timestamp, documentNumber });
    localStorage.setItem('passwords', JSON.stringify(passwords));
};

window.loadSavedPasswords = function() {
    const passwordsList = document.getElementById('passwordsList');
    passwordsList.innerHTML = '';
    
    let passwords = JSON.parse(localStorage.getItem('passwords')) || [];
    passwords.forEach(entry => {
        const passwordItemElement = document.createElement('div');
        passwordItemElement.classList.add('password-item');

        passwordItemElement.innerHTML = `
            <div class="password-field">[CLASSIFIED DOCUMENT #${entry.documentNumber}]</div>
            <div class="password-field"><strong>TARGET:</strong> <span class="typewriter-text">${formatWebsiteLink(entry.website)}</span></div>
            <div class="password-field"><strong>AGENT ID:</strong> <span class="typewriter-text">${entry.username}</span></div>
            <div class="password-field">
                <strong>ACCESS KEY:</strong> 
                <span class="password-dots">${'•'.repeat(entry.password.length)}</span>
                <span class="spy-icon" onclick="togglePassword(this, '${entry.password}')">🔍</span>
            </div>
            <div class="password-field"><strong>TIMESTAMP:</strong> ${entry.timestamp}</div>
            <div class="password-actions">
                <button class="delete-btn" onclick="deletePassword(this.parentElement.parentElement, '${entry.website}')">DESTROY RECORD</button>
            </div>
        `;

        passwordsList.appendChild(passwordItemElement);

        // Apply typewriter effect
        const typewriterElements = passwordItemElement.querySelectorAll('.typewriter-text');
        typewriterElements.forEach(element => {
            const text = element.innerHTML;
            typewriterText(element, text);
        });
    });
};

window.deletePassword = function(element, website) {
    element.style.animation = 'fadeOut 0.5s';
    setTimeout(() => element.remove(), 500);
    deleteFromLocal(website);
};

window.deleteFromLocal = function(website) {
    let passwords = JSON.parse(localStorage.getItem('passwords')) || [];
    passwords = passwords.filter(entry => entry.website !== website);
    localStorage.setItem('passwords', JSON.stringify(passwords));
};
