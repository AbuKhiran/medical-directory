let rawData = [];
let currentSelectedItem = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data.json');
        const jsonResult = await response.json();
        
        // Handle both old array format or new wrapper object format safely
        if (jsonResult.lastUpdated) {
            document.getElementById('last-updated-text').textContent = `آخر تحديث للملف: ${jsonResult.lastUpdated}`;
            rawData = jsonResult.data;
        } else {
            rawData = jsonResult; // fallback if old format
        }
        
        rawData = rawData.map(item => ({
            ...item,
            name: item.name ? item.name.trim() : '',
            city: item.city ? item.city.trim() : '',
            category: item.category ? item.category.trim() : '',
            subCategory: item.subCategory ? item.subCategory.trim().replace(/\s+/g, ' ') : '-',
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

    const getAvailableCities = () => {
        const subset = rawData.filter(i => {
            const matchesCat = !catSelect.value || i.category === catSelect.value;
            const matchesSub = !subCatSelect.value || i.subCategory === subCatSelect.value;
            return matchesCat && matchesSub;
        });
        return [...new Set(subset.map(i => i.city))].filter(Boolean).sort();
    };

    const getAvailableCategories = () => {
        const subset = rawData.filter(i => {
            const matchesCity = !citySelect.value || i.city === citySelect.value;
            const matchesSub = !subCatSelect.value || i.subCategory === subCatSelect.value;
            return matchesCity && matchesSub;
        });
        return [...new Set(subset.map(i => i.category))].filter(Boolean).sort();
    };

    const getAvailableSubCategories = () => {
        const subset = rawData.filter(i => {
            const matchesCity = !citySelect.value || i.city === citySelect.value;
            const matchesCat = !catSelect.value || i.category === catSelect.value;
            return matchesCity && matchesCat;
        });
        return [...new Set(subset.map(i => i.subCategory))].filter(sub => sub && sub !== "-").sort();
    };

    fillSelectOptions(citySelect, getAvailableCities(), selectedCity, 'جميع المدن');
    fillSelectOptions(catSelect, getAvailableCategories(), selectedCat, 'جميع التصنيفات');
    fillSelectOptions(subCatSelect, getAvailableSubCategories(), selectedSubCat, 'جميع التخصصات');
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
    const filtered = getFilteredSubset();
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

    container.innerHTML = displayData.map((item, index) => `
        <div onclick="openModal(${index})" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70 hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between group">
            <div>
                <div class="flex justify-between items-start gap-2 mb-3">
                    <span class="bg-blue-50 text-blue-700 border border-blue-100 py-1 px-3 rounded-xl text-xs font-bold">${item.category}</span>
                    <span class="bg-slate-100 text-slate-700 py-1 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1">
                        <i class="fa-solid fa-location-dot text-rose-500"></i> ${item.city}
                    </span>
                </div>

                <h3 class="text-lg font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">${item.name}</h3>
                
                ${item.subCategory !== '-' ? `<p class="text-xs font-bold text-indigo-600 mb-3 bg-indigo-50/60 py-1 px-2.5 rounded-lg inline-block">${item.subCategory}</p>` : '<div class="mb-2"></div>'}

                <div class="flex items-start gap-2 text-slate-600 text-sm mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <i class="fa-solid fa-map-pin text-slate-400 mt-1 flex-shrink-0"></i>
                    <span class="leading-relaxed line-clamp-2">${item.address !== '-' ? item.address : 'العنوان غير متوفر'}</span>
                </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span class="text-xs font-bold text-blue-600 group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
                    عرض كافة التفاصيل <i class="fa-solid fa-arrow-left"></i>
                </span>
                <i class="fa-solid fa-up-right-from-square text-slate-300 text-xs"></i>
            </div>
        </div>
    `).join('');
    
    window.currentDisplayedData = displayData;
}

function openModal(index) {
    const item = window.currentDisplayedData[index];
    currentSelectedItem = item;

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="text-right">
            <div class="flex items-center gap-2 mb-4">
                <span class="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-xl">${item.category}</span>
                <span class="bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold px-3 py-1 rounded-xl"><i class="fa-solid fa-location-dot"></i> ${item.city}</span>
            </div>

            <h2 class="text-2xl font-black text-slate-900 mb-2">${item.name}</h2>
            ${item.subCategory !== '-' ? `<p class="text-sm font-bold text-indigo-700 bg-indigo-50 py-1.5 px-3 rounded-xl inline-block mb-4">${item.subCategory}</p>` : ''}

            <div class="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-sm">
                <div class="flex items-start gap-2">
                    <i class="fa-solid fa-map-location-dot text-slate-400 mt-1"></i>
                    <div>
                        <span class="block text-xs font-bold text-slate-400">العنوان التفصيلي</span>
                        <span class="font-medium text-slate-700">${item.address !== '-' ? item.address : 'غير متوفر'}</span>
                    </div>
                </div>

                ${item.phone !== '-' ? `
                    <div class="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                        <i class="fa-solid fa-phone text-blue-500"></i>
                        <div>
                            <span class="block text-xs font-bold text-slate-400">الهاتف الأرضي</span>
                            <a href="tel:${item.phone}" class="font-mono font-bold text-blue-600 hover:underline dir-ltr inline-block">${item.phone}</a>
                        </div>
                    </div>
                ` : ''}

                ${item.mobile !== '-' ? `
                    <div class="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                        <i class="fa-solid fa-mobile-screen text-emerald-500"></i>
                        <div>
                            <span class="block text-xs font-bold text-slate-400">الجوال</span>
                            <a href="tel:${item.mobile}" class="font-mono font-bold text-emerald-600 hover:underline dir-ltr inline-block">${item.mobile}</a>
                        </div>
                    </div>
                ` : ''}
            </div>

            <button onclick="shareWhatsApp()" class="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-all">
                <i class="fa-brands fa-whatsapp text-xl"></i>
                <span>مشاركة البطاقة عبر الواتساب</span>
            </button>
        </div>
    `;

    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200);
}

function shareWhatsApp() {
    if (!currentSelectedItem) return;
    const item = currentSelectedItem;
    
    const text = `🏥 *تفاصيل مقدم الخدمة الطبية - العالمية للتأمين* 🏥\n\n` +
                 `👤 *الاسم:* ${item.name}\n` +
                 `🏙️ *المدينة:* ${item.city}\n` +
                 `📌 *التصنيف:* ${item.category} ${item.subCategory !== '-' ? `(${item.subCategory})` : ''}\n` +
                 `📍 *العنوان:* ${item.address}\n` +
                 (item.phone !== '-' ? `📞 *الهاتف:* ${item.phone}\n` : '') +
                 (item.mobile !== '-' ? `📱 *الجوال:* ${item.mobile}\n` : '') +
                 `\n🌐 *رابط الشبكة الطبية:* ${window.location.href}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('city-filter').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('subcategory-filter').value = '';
    
    updateFilterDropdowns(rawData);
    renderData(rawData);
}
