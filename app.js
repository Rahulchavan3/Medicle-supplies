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
let currentEditingRow = null;  

const populateTable = () => {
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

        row.onclick = () => selectRow(row, item.id);
        row.ondblclick = (e) => editCell(e, row);

        tableBody.appendChild(row);
    });
};
let currentSortColumn = null;
let currentSortOrder = 'asc';

const sortTable = (column) => {
    if (currentSortColumn === column) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc'; 
    } else {
        currentSortColumn = column;
        currentSortOrder = 'asc'; 
    }

    chemicalData.sort((a, b) => {
        if (typeof a[column] === 'string') {
            return currentSortOrder === 'asc' 
                ? a[column].localeCompare(b[column]) 
                : b[column].localeCompare(a[column]);
        } else {
            return currentSortOrder === 'asc' 
                ? a[column] - b[column] 
                : b[column] - a[column];
        }
    });

    populateTable(); 
};

const selectRow = (row, id) => {
    if (isEditingMode) {
        showFeedback('Please save your changes first!', 'error');
        return;
    }

    if (selectedRow) {
        selectedRow.classList.remove('selected');
    }
    row.classList.add('selected');
    selectedRow = row;
};

const editCell = (e, row) => {
    if (isEditingMode) {
        showFeedback('Please save or cancel your current changes first!', 'error');
        return;
    }
    const cell = e.target;
    const originalContent = cell.textContent;

    if (currentEditingCell) {
        showFeedback('Please save or cancel your current changes first!', 'error');
        return;
    }

    cell.innerHTML = `<input type="text" value="${originalContent}" class="edit-input" />`;
    const input = cell.querySelector('input');
    input.focus();

    currentEditingCell = cell;
    isEditingMode = true;
    currentEditingRow = row; 

    input.onblur = () => handleInputBlur(input, cell, originalContent);
    input.onkeypress = (event) => {
        if (event.key === 'Enter') {
            handleInputBlur(input, cell, originalContent);
        }
    };
};

const handleInputBlur = (input, cell, originalContent) => {
    const newValue = input.value.trim();
    cell.innerHTML = newValue ? newValue : originalContent;
    currentEditingCell = null;
    isEditingMode = false;
    currentEditingRow = null;  
};

const showFeedback = (message, type) => {
    const feedbackContainer = document.getElementById('feedbackMessage');
    feedbackContainer.textContent = message;
    feedbackContainer.className = type;
    setTimeout(() => {
        feedbackContainer.textContent = '';
        feedbackContainer.className = '';
    }, 3000);
};

const addRow = () => {
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
};

const deleteRow = () => {
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
};

const undoLastAction = () => {
    if (undoStack.length > 0) {
        const lastAction = JSON.parse(undoStack.pop());
        chemicalData.push(lastAction);
        populateTable();
        showFeedback('Undo successful!', 'success');
    } else {
        showFeedback('Nothing to undo!', 'error');
    }
};

const moveRowDown = () => {
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
};

const moveRowUp = () => {
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
};

const saveData = () => {
  
    console.log('Data saved', JSON.stringify(chemicalData));
    showFeedback('Data saved successfully!', 'success');

    isEditingMode = false;
    currentEditingCell = null;
    currentEditingRow = null;
};


const preventOtherActions = (event) => {
    if (isEditingMode) {
        event.stopPropagation(); 
        showFeedback('Please save your changes first!', 'error');
    }
};

document.addEventListener('DOMContentLoaded', populateTable);


document.querySelectorAll('.toolbar i').forEach(icon => {
    icon.addEventListener('click', (e) => {
        preventOtherActions(e);
    });
});


const tableRows = document.querySelectorAll('#chemicalTable tbody tr');
tableRows.forEach(row => {
    row.addEventListener('click', (e) => {
        preventOtherActions(e); 
    });
});




const createCard = (item) => {
    const card = document.createElement('div');
    card.classList.add('mobile-card');
    card.innerHTML = `
        <h4>${item.name}</h4>
        <p><strong>Vendor:</strong> ${item.vendor}</p>
        <p><strong>Density:</strong> ${item.density.toFixed(2)} g/m³</p>
        <p><strong>Viscosity:</strong> ${item.viscosity.toFixed(2)} m²/s</p>
        <p><strong>Packaging:</strong> ${item.packaging}</p>
        <p><strong>Pack Size:</strong> ${item.packSize} ${item.unit}</p>
        <p><strong>Quantity:</strong> ${item.quantity.toFixed(2)}</p>
        <button onclick="editChemical(${item.id})">Edit</button>
        <button onclick="deleteChemical(${item.id})">Delete</button>
    `;
    return card;
};

const populateMobileCards = () => {
    const mobileCardsContainer = document.getElementById('mobileCards');
    mobileCardsContainer.innerHTML = ''; 

    chemicalData.forEach(item => {
        const card = createCard(item);
        mobileCardsContainer.appendChild(card);
    });
};

const showAddForm = () => {
    const mobileCardsContainer = document.getElementById('mobileCards');
    mobileCardsContainer.innerHTML = `
        <div class="edit-form">
            <h4>Add New Chemical</h4>
            <label>Chemical Name:</label>
            <input type="text" id="newName" required />
            <label>Vendor:</label>
            <input type="text" id="newVendor" required />
            <label>Density (g/m³):</label>
            <input type="number" id="newDensity" required />
            <label>Viscosity (m²/s):</label>
            <input type="number" id="newViscosity" required />
            <label>Packaging:</label>
            <input type="text" id="newPackaging" required />
            <label>Pack Size:</label>
            <input type="number" id="newPackSize" required />
            <label>Unit:</label>
            <input type="text" id="newUnit" required />
            <label>Quantity:</label>
            <input type="number" id="newQuantity" required />
            <button onclick="addNewChemical()">Save</button>
            <button onclick="populateMobileCards()">Cancel</button>
        </div>
    `;
};

const addNewChemical = () => {
    const newChemical = {
        id: chemicalData.length + 1,
        name: document.getElementById('newName').value,
        vendor: document.getElementById('newVendor').value,
        density: parseFloat(document.getElementById('newDensity').value),
        viscosity: parseFloat(document.getElementById('newViscosity').value),
        packaging: document.getElementById('newPackaging').value,
        packSize: parseFloat(document.getElementById('newPackSize').value),
        unit: document.getElementById('newUnit').value,
        quantity: parseFloat(document.getElementById('newQuantity').value)
    };

    chemicalData.push(newChemical);
    showFeedback('Chemical added successfully!', 'success');
    populateMobileCards(); 
};

const editChemical = (id) => {
    const item = chemicalData.find(chemical => chemical.id === id);
    if (!item) return;

    const mobileCardsContainer = document.getElementById('mobileCards');
    mobileCardsContainer.innerHTML = `
        <div class="edit-form">
            <h4>Edit Chemical</h4>
            <label>Chemical Name:</label>
            <input type="text" id="editName" value="${item.name}" required />
            <label>Vendor:</label>
            <input type="text" id="editVendor" value="${item.vendor}" required />
            <label>Density (g/m³):</label>
            <input type="number" id="editDensity" value="${item.density}" required />
            <label>Viscosity (m²/s):</label>
            <input type="number" id="editViscosity" value="${item.viscosity}" required />
            <label>Packaging:</label>
            <input type="text" id="editPackaging" value="${item.packaging}" required />
            <label>Pack Size:</label>
            <input type="number" id="editPackSize" value="${item.packSize}" required />
            <label>Unit:</label>
            <input type="text" id="editUnit" value="${item.unit}" required />
            <label>Quantity:</label>
            <input type="number" id="editQuantity" value="${item.quantity}" required />
            <button onclick="saveEdit(${id})">Save</button>
            <button onclick="populateMobileCards()">Cancel</button>
        </div>
    `;
};

const saveEdit = (id) => {
    const index = chemicalData.findIndex(chemical => chemical.id === id);
    if (index !== -1) {
        chemicalData[index].name = document.getElementById('editName').value;
        chemicalData[index].vendor = document.getElementById('editVendor').value;
        chemicalData[index].density = parseFloat(document.getElementById('editDensity').value);
        chemicalData[index].viscosity = parseFloat(document.getElementById('editViscosity').value);
        chemicalData[index].packaging = document.getElementById('editPackaging').value;
        chemicalData[index].packSize = parseFloat(document.getElementById('editPackSize').value);
        chemicalData[index].unit = document.getElementById('editUnit').value;
        chemicalData[index].quantity = parseFloat(document.getElementById('editQuantity').value);

        showFeedback('Chemical updated successfully!', 'success');
        populateMobileCards(); 
    }
};

const deleteChemical = (id) => {
    const index = chemicalData.findIndex(chemical => chemical.id === id);
    if (index !== -1) {
        undoStack.push(JSON.stringify(chemicalData[index]));
        chemicalData.splice(index, 1);
        showFeedback('Chemical deleted!', 'success');
        populateMobileCards(); 
    } else {
        showFeedback('Chemical not found!', 'error');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    populateTable();
    populateMobileCards(); 
});


document.getElementById('addRow').addEventListener('click', showAddForm);

document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth < 768) {
        document.getElementById('mobileView').style.display = 'block';
        document.getElementById('desktopView').style.display = 'none';
        populateMobileCards(); 
    } else {
        document.getElementById('desktopView').style.display = 'block';
        document.getElementById('mobileView').style.display = 'none';
        populateTable(); 
    }
});


window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        document.getElementById('mobileView').style.display = 'block';
        document.getElementById('desktopView').style.display = 'none';
    } else {
        document.getElementById('desktopView').style.display = 'block';
        document.getElementById('mobileView').style.display = 'none';
    }
});
