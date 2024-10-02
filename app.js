let chemicalData = [
    { id: 1, name: 'Ammonium Persulfate', vendor: 'LG Chem', density: 3525.92, viscosity: 60.63, packaging: 'Bag', packSize: 100, unit: 'kg', quantity: 6495.18 },
    { id: 2, name: 'Caustic Potash', vendor: 'Formosa', density: 3172.15, viscosity: 48.22, packaging: 'Bag', packSize: 100, unit: 'kg', quantity: 8751.90 },
    { id: 3, name: 'Dimethylaminopropylamino', vendor: 'LG Chem', density: 8435.37, viscosity: 12.62, packaging: 'Barrel', packSize: 75, unit: 'L', quantity: 5964.61 },
    { id: 4, name: 'Mono Ammonium Phosphate', vendor: 'Sinopec', density: 1597.65, viscosity: 76.51, packaging: 'Bag', packSize: 105, unit: 'kg', quantity: 8183.73 },
    { id: 5, name: 'Ferric Nitrate', vendor: 'DowDuPont', density: 364.04, viscosity: 14.90, packaging: 'Bag', packSize: 105, unit: 'kg', quantity: 4154.33 },
    { id: 6, name: 'n-Pentane', vendor: 'Sinopec', density: 4535.26, viscosity: 66.76, packaging: 'N/A', packSize: 'N/A', unit: 't', quantity: 6272.34 },
    { id: 7, name: 'Glycol Ether PM', vendor: 'LG Chem', density: 6495.18, viscosity: 72.12, packaging: 'Bag', packSize: 250, unit: 'kg', quantity: 8749.54 }
];

let undoStack = [];
const MAX_UNDO_HISTORY = 10;
let selectedRow = null;
let isEditingMode = false; 
let currentEditingCell = null;

function populateTable() {
    const tableBody = document.querySelector('#chemicalTable tbody');
    tableBody.innerHTML = ''; 

    chemicalData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.vendor}</td>
            <td>${item.density.toFixed(2)}</td>
            <td>${item.viscosity.toFixed(2)}</td>
            <td>${item.packaging}</td>
            <td>${item.packSize}</td>
            <td>${item.unit}</td>
            <td>${item.quantity.toFixed(2)}</td>
        `;

        row.addEventListener('click', () => {
            if (isEditingMode) {
                showFeedback('Please save your changes first!', 'error');
                return;
            }
            if (selectedRow) {
                selectedRow.classList.remove('selected');
            }
            row.classList.add('selected');
            selectedRow = row;
        });

        row.addEventListener('dblclick', (e) => {
            if (isEditingMode) {
                showFeedback('Please save or cancel your current changes first!', 'error');
                return;
            }
            let cell = e.target;
            let originalContent = cell.textContent;

            if (currentEditingCell) {
                showFeedback('Please save or cancel your current changes first!', 'error');
                return;
            }

            cell.innerHTML = `<input type="text" value="${originalContent}" class="edit-input" />`;
            let input = cell.querySelector('input');
            input.focus();

            const columnIndex = Array.from(cell.parentElement.children).indexOf(cell);
            const restrictions = [
                { maxLength: 0 },
                { maxLength: 30 },
                { maxLength: 20 },
                { maxLength: 7 },
                { maxLength: 5 },
                { maxLength: 10 },
                { maxLength: 7 },
                { maxLength: 4 },
                { maxLength: 8 },
            ];

            if (restrictions[columnIndex].maxLength > 0) {
                input.maxLength = restrictions[columnIndex].maxLength;
            }

            cell.classList.add('editing-cell');
            currentEditingCell = cell;
            isEditingMode = true;

            const cells = row.children;
            for (const c of cells) {
                if (c !== cell) {
                    c.classList.add('non-editable');
                }
            }

            input.addEventListener('blur', () => {
                handleInputBlur(input, cell, originalContent);
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleInputBlur(input, cell, originalContent);
                }
            });
        });

        tableBody.appendChild(row);
    });
}
let currentSortColumn = null; 
let currentSortOrder = 'asc'; 

function sortTable(columnIndex) {
    const keys = ['id', 'name', 'vendor', 'density', 'viscosity', 'packaging', 'packSize', 'unit', 'quantity'];

    const key = keys[columnIndex];
    const isNumberColumn = typeof chemicalData[0][key] === 'number';


    if (currentSortColumn === columnIndex) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortOrder = 'asc'; 
    }
    currentSortColumn = columnIndex;

    chemicalData.sort((a, b) => {
        if (isNumberColumn) {
            return currentSortOrder === 'asc' ? a[key] - b[key] : b[key] - a[key];
        } else {
            return currentSortOrder === 'asc' ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
        }
    });

    populateTable(); 
}

document.addEventListener('DOMContentLoaded', () => {
    populateTable();
    
  
    const headers = document.querySelectorAll('#chemicalTable th');
    headers.forEach((header, index) => {
        header.addEventListener('click', () => sortTable(index));
    });
})
function populateMobileCards() {
    const mobileCardsContainer = document.getElementById('mobileCards');
    mobileCardsContainer.innerHTML = ''; 

    chemicalData.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('mobile-card');
        card.innerHTML = `
            <h4>${item.name}</h4>
            <p>Vendor: ${item.vendor}</p>
            <p>Density: ${item.density.toFixed(2)} g/m³</p>
            <p>Viscosity: ${item.viscosity.toFixed(2)} m²/s</p>
            <p>Packaging: ${item.packaging} (${item.packSize} ${item.unit})</p>
            <p>Quantity: ${item.quantity.toFixed(2)} ${item.unit}</p>
            <button class="edit-mobile-btn" data-id="${item.id}">Edit</button>
        `;

        card.querySelector('.edit-mobile-btn').addEventListener('click', (e) => {
            if (isEditingMode) {
                showFeedback('Please save your changes first!', 'error');
                return;
            }

            const cardId = e.target.dataset.id;
            const itemToEdit = chemicalData.find(i => i.id == cardId);

            if (itemToEdit) {
                showFeedback(`Editing ${itemToEdit.name}`, 'info');
                showEditForm(itemToEdit);
            }
        });

        mobileCardsContainer.appendChild(card);
    });


    mobileCardsContainer.style.display = 'block';
}

function showEditForm(itemToEdit) {
    const mobileCardsContainer = document.getElementById('mobileCards');
    const editForm = document.createElement('div');
    editForm.classList.add('edit-form');

    editForm.innerHTML = `
        <h4>Edit ${itemToEdit.name}</h4>
        <label for="vendor">Vendor:</label>
        <input type="text" id="vendor" value="${itemToEdit.vendor}" required />
        <label for="density">Density:</label>
        <input type="number" id="density" value="${itemToEdit.density}" required />
        <label for="viscosity">Viscosity:</label>
        <input type="number" id="viscosity" value="${itemToEdit.viscosity}" required />
        <label for="packaging">Packaging:</label>
        <input type="text" id="packaging" value="${itemToEdit.packaging}" required />
        <label for="packSize">Pack Size:</label>
        <input type="number" id="packSize" value="${itemToEdit.packSize}" required />
        <label for="unit">Unit:</label>
        <input type="text" id="unit" value="${itemToEdit.unit}" required />
        <label for="quantity">Quantity:</label>
        <input type="number" id="quantity" value="${itemToEdit.quantity}" required />
        <button id="saveEdit">Save</button>
        <button id="cancelEdit">Cancel</button>
    `;

    mobileCardsContainer.innerHTML = '';
    mobileCardsContainer.appendChild(editForm);

    document.getElementById('saveEdit').addEventListener('click', () => {
        saveEdit(itemToEdit.id);
    });

    document.getElementById('cancelEdit').addEventListener('click', () => {
        populateMobileCards();
    });
}

function saveEdit(id) {
    const vendor = document.getElementById('vendor').value;
    const density = parseFloat(document.getElementById('density').value);
    const viscosity = parseFloat(document.getElementById('viscosity').value);
    const packaging = document.getElementById('packaging').value;
    const packSize = parseInt(document.getElementById('packSize').value);
    const unit = document.getElementById('unit').value;
    const quantity = parseFloat(document.getElementById('quantity').value);

    const index = chemicalData.findIndex(item => item.id === id);
    if (index !== -1) {
        undoStack.push(JSON.stringify(chemicalData[index]));
        if (undoStack.length > MAX_UNDO_HISTORY) {
            undoStack.shift(); 
        }
        chemicalData[index] = { id, name: chemicalData[index].name, vendor, density, viscosity, packaging, packSize, unit, quantity };
        showFeedback(`Updated ${chemicalData[index].name} successfully!`, 'success');
        populateMobileCards(); 
    }
}

function showFeedback(message, type) {
    const feedbackContainer = document.getElementById('feedbackMessage');
    feedbackContainer.textContent = message;
    feedbackContainer.className = type; 
    setTimeout(() => {
        feedbackContainer.textContent = '';
        feedbackContainer.className = '';
    }, 3000);
}

function handleInputBlur(input, cell, originalContent) {
    const newValue = input.value.trim();

    if (newValue === '') {
        cell.innerHTML = originalContent; 
    } else {
        cell.innerHTML = newValue; 
        const columnIndex = Array.from(cell.parentElement.children).indexOf(cell);
        chemicalData[selectedRow.rowIndex - 1][Object.keys(chemicalData[selectedRow.rowIndex - 1])[columnIndex - 1]] = newValue; 
    }
    cell.classList.remove('editing-cell');
    selectedRow.classList.remove('non-editable');
    currentEditingCell = null;
    isEditingMode = false;
}

document.getElementById('addRow').addEventListener('click', () => {
    if (isEditingMode) {
        showFeedback('Please save your changes first!', 'error');
        return;
    }
    const newRow = {
        id: chemicalData.length + 1,
        name: '',
        vendor: '',
        density: 0,
        viscosity: 0,
        packaging: '',
        packSize: 0,
        unit: '',
        quantity: 0
    };
    chemicalData.push(newRow);
    populateTable();
    showFeedback('New row added!', 'success');
});

document.getElementById('deleteRow').addEventListener('click', () => {
    if (selectedRow) {
        const rowIndex = selectedRow.rowIndex - 1;
        undoStack.push(JSON.stringify(chemicalData[rowIndex])); 
        chemicalData.splice(rowIndex, 1);
        selectedRow.remove();
        selectedRow = null;
        showFeedback('Row deleted!', 'success');
        populateTable(); 
    } else {
        showFeedback('No row selected to delete!', 'error');
    }
});

document.getElementById('undo').addEventListener('click', () => {
    if (undoStack.length > 0) {
        const lastAction = JSON.parse(undoStack.pop());
        chemicalData.push(lastAction);
        populateTable();
        showFeedback('Undo successful!', 'success');
    } else {
        showFeedback('Nothing to undo!', 'error');
    }
});

document.getElementById('moveDown').addEventListener('click', () => {
    if (selectedRow) {
        const rowIndex = selectedRow.rowIndex - 1;
        if (rowIndex < chemicalData.length - 1) {
            const temp = chemicalData[rowIndex];
            chemicalData[rowIndex] = chemicalData[rowIndex + 1];
            chemicalData[rowIndex + 1] = temp;
            populateTable();
            showFeedback('Row moved down!', 'success');
        } else {
            showFeedback('Cannot move down, already at the bottom!', 'error');
        }
    } else {
        showFeedback('No row selected to move!', 'error');
    }
});

document.getElementById('moveUp').addEventListener('click', () => {
    if (selectedRow) {
        const rowIndex = selectedRow.rowIndex - 1;
        if (rowIndex > 0) {
            const temp = chemicalData[rowIndex];
            chemicalData[rowIndex] = chemicalData[rowIndex - 1];
            chemicalData[rowIndex - 1] = temp;
            populateTable();
            showFeedback('Row moved up!', 'success');
        } else {
            showFeedback('Cannot move up, already at the top!', 'error');
        }
    } else {
        showFeedback('No row selected to move!', 'error');
    }
});


function showMobileView() {
    const isMobile = window.innerWidth < 768; // Adjust the threshold as needed
    const mobileCardsContainer = document.getElementById('mobileCards');

    if (isMobile) {
        mobileCardsContainer.style.display = 'block';
        populateMobileCards();
    } else {
        mobileCardsContainer.style.display = 'none';
        populateTable(); 
    }
}


window.addEventListener('resize', showMobileView);


populateTable();
showMobileView();
