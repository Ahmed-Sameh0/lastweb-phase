function generateHomeCard(book) {
    const isUserAdmin = (typeof isAdmin !== 'undefined') ? isAdmin : false;

    let actionBtn = '';
    if (isUserAdmin) {
        actionBtn = `<button class="view-btn" onclick="viewBook(${book.id})">View</button>`;
    } else {
        if (book.isBorrowed) {
            actionBtn = `<button disabled style="opacity:0.5; background:#ccc; width:100%; padding:6px 0; border-radius:8px; border:none; cursor:not-allowed;">Not Available</button>`;
        } else {
            actionBtn = `
                <button class="view-btn" onclick="viewBook(${book.id})">View</button>
                <button class="borrow_btn_script" data-id="${book.id}" style="margin-top:6px;">Borrow</button>
            `;
        }
    }

    return `
        <div class="book-card">
            <img src="${book.image || 'https://via.placeholder.com/120'}" alt="Cover" onerror="this.src='https://via.placeholder.com/120'">
            <h3>${book.name || 'No Title'}</h3>
            <p>${book.author || 'Unknown'}</p>
            <span class="book-category">📁 ${book.category || 'General'}</span>
            <div style="margin-top: 8px;">
                ${actionBtn}
            </div>
        </div>
    `;
}

const icons = {
    fantasy: '🔮', romantic: '❤️', programming: '💻',
    'Science fiction': '❤️', Historical: '📜', horror: '👻',
    adventure: '🗺️', default: '📚'
};

fetch('/api/books/')
    .then(res => res.json())
    .then(data => {
        // Recent books
        const recent = data.slice(-5).reverse();
        const recentContainer = document.getElementById('recentBooks');

        if (!recent.length) {
            recentContainer.innerHTML = '<p class="loading-text">No books added yet.</p>';
        } else {
            recentContainer.innerHTML = recent.map(book => generateHomeCard(book)).join('');
        }

        // Category grid
        const categories = {};
        data.forEach(book => {
            const cat = book.category ? book.category.trim() : 'General';
            if (!categories[cat]) categories[cat] = 0;
            categories[cat]++;
        });

        const grid = document.getElementById('categoryGrid');
        grid.innerHTML = Object.entries(categories).map(([cat, count]) => {
            const icon = icons[cat.toLowerCase()] || icons.default;
            return `
                <div class="category-card" onclick="window.location.href='/books/?category=${cat}'">
                    <span class="cat-icon">${icon}</span>
                    <p class="cat-name">${cat}</p>
                    <p class="cat-count">${count} book${count > 1 ? 's' : ''}</p>
                </div>
            `;
        }).join('');
    })
    .catch(() => {
        document.getElementById('recentBooks').innerHTML = '<p style="color:red;">Could not load books.</p>';
        document.getElementById('categoryGrid').innerHTML = '<p style="color:red;">Could not load categories.</p>';
    });

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('borrow_btn_script')) {
        borrowBook(e.target.getAttribute('data-id'));
    }
});

function borrowBook(bookId) {
    fetch(`/books/${bookId}/borrow/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(res => {
        if (res.ok) { alert("Borrowed successfully!"); location.reload(); }
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}