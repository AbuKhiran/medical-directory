let rawData = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data.json');
        rawData = await response.json();
        initFilters();
        renderData(rawData);
        
        document.getElementById('search-input').addEventListener('input', applyFilters);
        document.getElementById('city-filter').addEventListener('change', applyFilters);
        document.getElementById('category-filter').addEventListener('change', applyFilters);
        document.getElementById('subcategory-filter').addEventListener('change', applyFilters);
        document.getElementById('reset-btn').addEventListener('click', resetFilters);
    } catch (error) {
        console.error('Error loading data:', error);
    }
});

function initFilters() {
    const cities = [...new Set(rawData.map(i => i.city))].filter(Boolean).sort();
    const categories = [...new Set(rawData.map(i => i.category))].filter(Boolean).sort();
    const subCategories = [...new Set(rawData.map(i => i.subCategory))].filter(Boolean).sort();

    populateSelect('city-filter', cities);
    populateSelect('category-filter', categories);
    populateSelect('subcategory-filter', subCategories);
    document.getElementById('total-count').textContent = rawData.length.toLocaleString('ar-EG');
}

function populateSelect(id, items) {
    const select = document.getElementById(id);
    items.forEach(item => {
        if(item !== "-") {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = item;
            select.appendChild(opt);
        }
    });
}

function applyFilters() {
    const searchVal = document.getElementById('search-input').value.trim().toLowerCase();
    const cityVal = document.getElementById('city-filter').value;
    const catVal = document.getElementById('category-filter').value;
    const subCatVal = document.getElementById('subcategory-filter').value;

    const filtered = rawData.filter(item => {
        const matchesSearch = !searchVal || 
            item.name.toLowerCase().includes(searchVal) ||
            item.address.toLowerCase().includes(searchVal) ||
            item.phone.includes(searchVal) ||
            item.mobile.includes(searchVal);

        const matchesCity = !cityVal || item.city === cityVal;
        const matchesCat = !catVal || item.category === catVal;
        const matchesSubCat = !subCatVal || item.subCategory === subCatVal;

        return matchesSearch && matchesCity && matchesCat && matchesSubCat;
    });

    renderData(filtered);
}

function renderData(data) {
    const tbody = document.getElementById('data-table-body');
    const noResults = document.getElementById('no-results');
    document.getElementById('filtered-count').textContent = data.length.toLocaleString('ar-EG');

    if (data.length === 0) {
        tbody.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    noResults.classList.add('hidden');
    
    tbody.innerHTML = data.slice(0, 500).map(item => `
        <tr class="hover:bg-blue-50/50 transition-colors border-b border-slate-100">
            <td class="py-3 px-4 font-bold text-slate-800">${item.name}</td>
            <td class="py-3 px-4"><span class="bg-slate-100 text-slate-700 py-1 px-2.5 rounded-lg text-xs font-semibold">${item.city}</span></td>
            <td class="py-3 px-4 text-slate-600 truncate max-w-xs" title="${item.address}">${item.address}</td>
            <td class="py-3 px-4"><span class="bg-blue-50 text-blue-700 border border-blue-100 py-1 px-2.5 rounded-lg text-xs font-medium">${item.category}</span></td>
            <td class="py-3 px-4 text-slate-600">${item.subCategory !== '-' ? item.subCategory : '-'}</td>
            <td class="py-3 px-4 dir-ltr text-right font-mono text-xs text-slate-600">${item.phone !== '-' ? `<a href="tel:${item.phone}" class="hover:text-blue-600"><i class="fa-solid fa-phone text-blue-500 ml-1"></i>${item.phone}</a>` : '-'}</td>
            <td class="py-3 px-4 dir-ltr text-right font-mono text-xs text-slate-600">${item.mobile !== '-' ? `<a href="tel:${item.mobile}" class="hover:text-emerald-600"><i class="fa-solid fa-mobile-screen text-emerald-500 ml-1"></i>${item.mobile}</a>` : '-'}</td>
        </tr>
    `).join('');
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('city-filter').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('subcategory-filter').value = '';
    renderData(rawData);
}
