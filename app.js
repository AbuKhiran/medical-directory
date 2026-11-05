let rawData = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data.json');
        rawData = await response.json();
        
        // Clean and normalize text fields to eliminate duplicate variations
        rawData = rawData.map(item => ({
            ...item,
            name: item.name ? item.name.trim() : '',
            city: item.city ? item.city.trim() : '',
            category: item.category ? item.category.trim() : '',
            subCategory: item.subCategory ? item.subCategory.trim() : '-',
            address: item.address ? item.address.trim() : '-',
            phone: item.phone ? item.phone.trim() : '-',
            mobile: item.mobile ? item.mobile.trim() : '-'
        }));

        updateFilterDropdowns(rawData);
        renderData(rawData);
        
        document.getElementById('search-input').addEventListener('input', applyFilters);
        document.getElementById('city-filter').addEventListener('change', applyFilters);
        document.getElementById('category-filter').addEventListener('change', applyFilters);
        document.getElementById('subcategory-filter').addEventListener('change', applyFilters);
        document.getElementById('reset-btn').addEventListener('click', resetFilters);
        
        document.getElementById('total-count').textContent = rawData.length.toLocaleString('ar-EG');
    } catch (error) {
        console.error('Failed to load data.json:', error);
    }
});

function getFilteredSubset() {
    const searchVal = document.getElementById('search-input').value.trim().toLowerCase();
    const cityVal = document.getElementById('city-filter').value;
    const catVal = document.getElementById('category-filter').value;
    const subCatVal = document.getElementById('subcategory-filter').value;

    return rawData.filter(item => {
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
}

function updateFilterDropdowns(currentData) {
    const citySelect = document.getElementById('city-filter');
    const catSelect = document.getElementById('category-filter');
    const subCatSelect = document.getElementById('subcategory-filter');

    const selectedCity = citySelect.value;
    const selectedCat = catSelect.value;
    const selectedSubCat = subCatSelect.value;

    // Get unique active options based on data pool to prevent empty selections
    const cities = [...new Set(rawData.map(i => i.city))].filter(Boolean).sort();
    const categories = [...new Set(rawData.map(i => i.category))].filter(Boolean).sort();
    
    // Subcategories available for current filtered dataset (excluding subcategory filter itself for flexibility)
    const subCategories = [...new Set(currentData.map(i => i.subCategory))]
        .filter(sub => sub && sub !== "-")
        .sort();

    fillSelectOptions(citySelect, cities, selectedCity, 'جميع المدن');
    fillSelectOptions(catSelect, categories, selectedCat, 'جميع التصنيفات');
    fillSelectOptions(subCatSelect, subCategories, selectedSubCat, 'جميع التخصصات');
}

function fillSelectOptions(selectElement, items, currentValue, defaultLabel) {
    selectElement.innerHTML = `<option value="">${defaultLabel}</option>`;
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        if (item === currentValue) opt.selected = true;
        selectElement.appendChild(opt);
    });
}

function applyFilters() {
    // Filter data based on current inputs
    const filtered = getFilteredSubset();
    
    // Update dynamic dropdowns with the filtered dataset so only valid choices remain
    updateFilterDropdowns(filtered);
    
    renderData(filtered);
}

function renderData(data) {
    const container = document.getElementById('cards-container');
    const noResults = document.getElementById('no-results');
    document.getElementById('filtered-count').textContent = data.length.toLocaleString('ar-EG');

    if (data.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');
    const displayData = data.slice(0, 300);

    container.innerHTML = displayData.map(item => `
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70 hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start gap-2 mb-3">
                    <span class="bg-blue-50 text-blue-700 border border-blue-100 py-1 px-3 rounded-xl text-xs font-bold">${item.category}</span>
                    <span class="bg-slate-100 text-slate-700 py-1 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1">
                        <i class="fa-solid fa-location-dot text-rose-500"></i> ${item.city}
                    </span>
                </div>

                <h3 class="text-lg font-extrabold text-slate-900 mb-1">${item.name}</h3>
                
                ${item.subCategory !== '-' ? `<p class="text-xs font-bold text-indigo-600 mb-3 bg-indigo-50/60 py-1 px-2.5 rounded-lg inline-block">${item.subCategory}</p>` : '<div class="mb-2"></div>'}

                <div class="flex items-start gap-2 text-slate-600 text-sm mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <i class="fa-solid fa-map-pin text-slate-400 mt-1 flex-shrink-0"></i>
                    <span class="leading-relaxed">${item.address !== '-' ? item.address : 'العنوان غير متوفر'}</span>
                </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between mt-auto">
                <div class="flex items-center gap-2 flex-wrap">
                    ${item.phone !== '-' ? `
                        <a href="tel:${item.phone}" class="flex items-center gap-1.5 text-xs font-mono font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 py-1.5 px-3 rounded-xl transition">
                            <i class="fa-solid fa-phone text-blue-500"></i> ${item.phone}
                        </a>
                    ` : ''}
                    
                    ${item.mobile !== '-' ? `
                        <a href="tel:${item.mobile}" class="flex items-center gap-1.5 text-xs font-mono font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-1.5 px-3 rounded-xl transition">
                            <i class="fa-solid fa-mobile-screen text-emerald-500"></i> ${item.mobile}
                        </a>
                    ` : ''}

                    ${item.phone === '-' && item.mobile === '-' ? '<span class="text-xs text-slate-400">لا توجد أرقام مسجلة</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('city-filter').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('subcategory-filter').value = '';
    
    updateFilterDropdowns(rawData);
    renderData(rawData);
}
