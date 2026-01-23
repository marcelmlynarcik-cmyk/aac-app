let isParentMode = false;
let data = null;
let currentCategory = null;
let mode = null;
let selectedItem = null;

const sentenceEl = document.querySelector(".sentence");


// Helper function to sanitize filenames for Supabase Storage
function sanitizeFilename(filename) {
    // Replace non-alphanumeric, non-underscore, non-hyphen, non-dot characters with a hyphen
    // and replace multiple hyphens with a single hyphen, trim leading/trailing hyphens.
    // Convert to lowercase.
    return filename
        .replace(/[^a-zA-Z0-9_.-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}

const categoriesEl = document.getElementById("categories");
const gridEl = document.getElementById("grid");

const btnChci = document.querySelector(".choice.yes");
const btnNechci = document.querySelector(".choice.no");
const quickYes = document.querySelector(".quick.yes");
const quickNo = document.querySelector(".quick.no");
const resetBtn = document.querySelector(".reset");
const parentModeBtn = document.querySelector(".parent-mode-btn");
parentModeBtn.onclick = toggleParentMode;

// ===== SPEAK =====
function speak(text, delay = 300) {
  if (!text) return;
  speechSynthesis.cancel();

  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "cs-CZ";
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }, delay);
}

// ===== LOAD DATA =====
async function loadData() {
    let { data: categories, error: categoriesError } = await supabaseClient
        .from('categories')
        .select('*');

    let { data: items, error: itemsError } = await supabaseClient
        .from('items')
        .select('*');

    if (categoriesError || itemsError) {
        console.error(categoriesError || itemsError);
        return;
    }

    data = {
        categories: categories.map(category => ({
            ...category,
            items: items.filter(item => item.category_id === category.id)
        }))
    };

    renderCategories();
    selectCategory("all");
}

loadData();

// ===== CATEGORIES =====
function renderCategories() {
  categoriesEl.innerHTML = "";

  data.categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.innerHTML = `${cat.icon} ${cat.label}`;
    btn.onclick = () => selectCategory(cat.id);
    btn.dataset.id = cat.id;
    categoriesEl.appendChild(btn);
  });
}

function selectCategory(catId) {
  currentCategory = data.categories.find(c => c.id === catId);

  document.querySelectorAll(".category-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.id === catId)
  );

  clearSelection();
  updateControls();
  renderGrid();
}

// ===== GRID =====
function renderGrid() {
  gridEl.innerHTML = "";

  let items = [];

  if (currentCategory.id === "all") {
    data.categories.forEach(c => {
      if (c.items) items.push(...c.items.map(i => ({ ...i, mode: c.mode })));
    });
  } else {
    items = currentCategory.items.map(i => ({ ...i, mode: currentCategory.mode }));
  }

  items.forEach(item => {
    const card = document.createElement("button");
    card.className = "card";
    if (item.image_url) {
        card.innerHTML = `<img src="${item.image_url}" alt="${item.text}"><span>${item.text}</span>`;
    } else {
        card.innerHTML = `${item.icon}<span>${item.text}</span>`;
    }

    card.onclick = () => onItemClick(item, card);
    gridEl.appendChild(card);
  });
}

// ===== ITEM CLICK =====
function onItemClick(item, card) {
  document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
  card.classList.add("active");

  selectedItem = item;

  if (item.mode === "statement") {
    sentenceEl.textContent = item.text;
    speak(item.text);
    return;
  }

  if (mode) {
    updateSentence();
  } else {
    sentenceEl.textContent = item.text;
    speak(item.text);
  }
}

// ===== MODE BUTTONS =====
btnChci.onclick = () => {
  mode = "chci";
  btnChci.classList.add("active");
  btnNechci.classList.remove("active");
  updateSentence();
};

// ===== QUICK ANSWERS =====
quickYes.onclick = () => {
  clearSelection();
  sentenceEl.textContent = "Ano";
  speak(sentenceEl.textContent);
  quickYes.classList.add("active");
};


quickNo.onclick = () => {
  clearSelection();
  sentenceEl.textContent = "Ne";
  speak(sentenceEl.textContent);
  quickNo.classList.add("active");
};

// ===== SENTENCE =====
function updateSentence() {
  if (!mode || !selectedItem) {
    sentenceEl.textContent = "";
    return;
  }

  const verb = mode === "chci" ? "Chci" : "Nechci";
  const text = `${verb} ${selectedItem.text}`;
  sentenceEl.textContent = text;
  speak(text);
}

// ===== UI CONTROL =====
function updateControls() {
  const showWant = currentCategory.mode !== "statement";

  document.querySelector(".choices").style.display = showWant ? "flex" : "none";
}

// ===== RESET =====
function clearSelection() {
  mode = null;
  selectedItem = null;

  btnChci.classList.remove("active");
  btnNechci.classList.remove("active");
  quickYes.classList.remove("active");
  quickNo.classList.remove("active");

  document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
  sentenceEl.textContent = "";
}

resetBtn.onclick = clearSelection;
function toggleParentMode() {
  isParentMode = !isParentMode;
  document.body.classList.toggle("parent-mode", isParentMode);

  if (isParentMode) {
    speak("Rodičovský režim");
    loadParentModeData();
  } else {
    loadData(); // Reload main app data
  }
}

// ===== PARENT MODE =====
const parentModeControls = document.querySelector('.parent-mode-controls');
const closeParentModeBtn = document.querySelector('.close-parent-mode');
const categoryForm = document.getElementById('category-form');
const itemForm = document.getElementById('item-form');
const categoryList = document.getElementById('category-list');
const itemList = document.getElementById('item-list');
const categoryInput = itemForm.querySelector('select[name="category_id"]');
const deleteCategoryBtn = document.getElementById('delete-category');
const deleteItemBtn = document.getElementById('delete-item');

let parentCategories = [];
let parentItems = [];
let selectedCategoryId = null;
let selectedItemId = null;
let isSubmittingItem = false;

async function loadParentModeData() {
    const { data: categories, error: catError } = await supabaseClient.from('categories').select('*').order('label');
    if (catError) return console.error(catError);
    parentCategories = categories;

    const { data: items, error: itemError } = await supabaseClient.from('items').select('*').order('text');
    if (itemError) return console.error(itemError);
    parentItems = items;

    renderParentCategories();
    renderParentItems();
    updateCategoryDropdown();
}

function renderParentCategories() {
    categoryList.innerHTML = '';
    parentCategories.forEach(cat => {
        if (cat.id === 'all') return;
        const div = document.createElement('div');
        div.className = 'list-item';
        div.textContent = `${cat.icon} ${cat.label}`;
        div.dataset.id = cat.id;
        div.onclick = () => selectParentCategory(cat);
        if (cat.id === selectedCategoryId) {
            div.classList.add('selected');
        }
        categoryList.appendChild(div);
    });
}

function renderParentItems() {
    itemList.innerHTML = '';
    parentItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        
        if (item.image_url) {
            const img = document.createElement('img');
            img.src = item.image_url;
            img.alt = item.text;
            img.style.height = '1.5em';
            img.style.verticalAlign = 'middle';
            img.style.marginRight = '0.5em';
            div.appendChild(img);
            div.appendChild(document.createTextNode(item.text));
        } else {
            div.textContent = `${item.icon || ''} ${item.text}`;
        }
        
        div.dataset.id = item.id;
        div.onclick = () => selectParentItem(item);
        if (item.id === selectedItemId) {
            div.classList.add('selected');
        }
        itemList.appendChild(div);
    });
}

function updateCategoryDropdown() {
    categoryInput.innerHTML = '';
    parentCategories.forEach(cat => {
        if (cat.id === 'all') return;
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.label;
        categoryInput.appendChild(option);
    });
}

function selectParentCategory(cat) {
    selectedCategoryId = cat.id;
    categoryForm.querySelector('[name="id"]').value = cat.id;
    categoryForm.querySelector('[name="label"]').value = cat.label;
    categoryForm.querySelector('[name="icon"]').value = cat.icon;
    categoryForm.querySelector('[name="mode"]').value = cat.mode;
    deleteCategoryBtn.style.display = 'block';
    renderParentCategories();
}

function selectParentItem(item) {
    selectedItemId = item.id;
    itemForm.querySelector('[name="id"]').value = item.id;
    itemForm.querySelector('[name="category_id"]').value = item.category_id;
    itemForm.querySelector('[name="text"]').value = item.text;
    itemForm.querySelector('[name="icon"]').value = item.icon || '';
    deleteItemBtn.style.display = 'block';
    renderParentItems();
}

closeParentModeBtn.onclick = () => toggleParentMode();

categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(categoryForm);
    const id = formData.get('id') || undefined;
    const record = {
        label: formData.get('label'),
        icon: formData.get('icon'),
        mode: formData.get('mode'),
    };

    if (id) {
        // Update
        const { error } = await supabaseClient.from('categories').update(record).eq('id', id);
        if (error) return console.error(error);
    } else {
        // Create
        record.id = record.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        const { error } = await supabaseClient.from('categories').insert(record);
        if (error) return console.error(error);
    }

    categoryForm.reset();
    deleteCategoryBtn.style.display = 'none';
    selectedCategoryId = null;
    loadParentModeData();
});

deleteCategoryBtn.onclick = async () => {
    if (!selectedCategoryId || !confirm('Opravdu smazat kategorii?')) return;
    
    // Items in this category will be deleted by CASCADE constraint
    const { error } = await supabaseClient.from('categories').delete().eq('id', selectedCategoryId);
    if (error) return console.error(error);

    categoryForm.reset();
    deleteCategoryBtn.style.display = 'none';
    selectedCategoryId = null;
    loadParentModeData();
};

itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmittingItem) {
        console.log('Submission in progress, please wait.');
        return;
    }
    isSubmittingItem = true;
    const submitButton = itemForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Ukládání...';

    try {
        const formData = new FormData(itemForm);
        const id = formData.get('id') || undefined;
        const imageFile = formData.get('image');

        const record = {
            category_id: formData.get('category_id'),
            text: formData.get('text'),
            icon: formData.get('icon'),
        };

        if (!record.text) {
            alert('Text položky nesmí být prázdný.');
            return;
        }

        if (imageFile && imageFile.size > 0) {
            const fileName = `${Date.now()}_${sanitizeFilename(imageFile.name)}`;
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('images')
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                alert(`Chyba při nahrávání obrázku: ${uploadError.message}`);
                return;
            }
            
            const { data: urlData } = supabaseClient.storage.from('images').getPublicUrl(uploadData.path);
            if (!urlData || !urlData.publicUrl) {
                const errorMessage = 'Nepodařilo se získat veřejnou URL obrázku.';
                console.error(errorMessage);
                alert(errorMessage);
                return;
            }

            record.image_url = urlData.publicUrl;
            record.icon = '';
        }

        if (id) {
            const { error } = await supabaseClient.from('items').update(record).eq('id', id);
            if (error) {
                console.error('Error updating item:', error);
                alert(`Chyba při ukládání položky: ${error.message}`);
                return;
            }
        } else {
            const safeTextId = record.text.toLowerCase().replace(/[^a-z0-9]/g, '');
            record.id = `${safeTextId}-${Math.random().toString(36).substring(2, 9)}`;
            const { error } = await supabaseClient.from('items').insert(record);
            if (error) {
                console.error('Error creating item:', error);
                alert(`Chyba při vytváření položky: ${error.message}`);
                return;
            }
        }

        itemForm.reset();
        deleteItemBtn.style.display = 'none';
        selectedItemId = null;
        loadParentModeData();
    } finally {
        isSubmittingItem = false;
        submitButton.disabled = false;
        submitButton.textContent = 'Uložit položku';
    }
});

deleteItemBtn.onclick = async () => {
    if (!selectedItemId || !confirm('Opravdu smazat položku?')) return;

    // To ensure we have the correct image_url, fetch the item directly from the database
    const { data: items, error: fetchError } = await supabaseClient
        .from('items')
        .select('image_url')
        .eq('id', selectedItemId);

    if (fetchError) {
        console.error('Could not fetch item to delete:', fetchError);
        // We can still attempt to delete, but we won't be able to remove the image.
    }
    const itemToDelete = items && items.length > 0 ? items[0] : null;

    // Now, delete the database record
    const { error: dbError } = await supabaseClient.from('items').delete().eq('id', selectedItemId);

    if (dbError) {
        console.error('Error deleting item from database:', dbError);
        alert(`Chyba při mazání položky: ${dbError.message}`);
        return;
    }

    // If database deletion was successful, and we found an image_url, delete the image from storage
    if (itemToDelete && itemToDelete.image_url) {
        try {
            const fileName = itemToDelete.image_url.substring(itemToDelete.image_url.lastIndexOf('/') + 1);
            if (fileName) {
                const { error: storageError } = await supabaseClient.storage
                    .from('images')
                    .remove([fileName]);
                
                if (storageError) {
                    console.error('Failed to delete image from storage:', storageError);
                }
            }
        } catch (e) {
            console.error('Could not determine image filename for deletion:', e);
        }
    }

    // Reset UI
    itemForm.reset();
    deleteItemBtn.style.display = 'none';
    selectedItemId = null;
    loadParentModeData();
};


