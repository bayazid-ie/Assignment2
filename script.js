const container = document.getElementById('drinkContainer');
const selectedList = document.getElementById('selectedList');
const countEl = document.getElementById('count');
const notFound = document.getElementById('notFound');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

let selected = [];
let currentDrinks = [];

function searchCocktail(term) {
    return fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${term}`)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            return data.drinks || [];
        });
}

function loadDrinks() {
    return searchCocktail('margarita')
        .then(function (drinks) {
            return drinks || [];
        });
}

function render(list) {
    container.innerHTML = '';
    currentDrinks = list;

    if (!list || list.length === 0) {
        notFound.classList.remove('d-none');
        return;
    }
    notFound.classList.add('d-none');

    list.forEach(function (d, idx) {
        const col = document.createElement('div');
        col.className = 'col-4 mb-3';

        const shortInstr = (d.strInstructions || '').substring(0, 15);
        const img = d.strDrinkThumb || 'https://via.placeholder.com/300x180?text=No+Image';

        const isSelected = selected.some(function (s) { return s.idDrink === d.idDrink; });

        col.innerHTML = `
      <div class="card drink-card h-100">
        <img src="${img}" class="card-img-top" alt="${d.strDrink}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${d.strDrink}</h5>
          <p class="card-text text-muted mb-1"><small>${d.strCategory || 'Cocktail'}</small></p>
          <p class="card-text flex-grow-1"><small>${shortInstr}...</small></p>
          <div class="mt-auto">
            <button class="btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-success'} me-2" 
                    onclick="addToGroup(${idx})"
                    ${isSelected ? 'disabled' : ''}>
              ${isSelected ? '✓ Added' : 'Add to Group'}
            </button>
            <button class="btn btn-sm btn-info text-white" onclick="showDetails(${idx})">Details</button>
          </div>
        </div>
      </div>`;
        container.appendChild(col);
    });
}

function addToGroup(index) {
    if (selected.length >= 7) {
        alert('You cannot add more than 7 drinks');
        return;
    }
    const drink = currentDrinks[index];
    if (!selected.some(function (s) { return s.idDrink === drink.idDrink; })) {
        selected.push(drink);
        updateSelected();
        updateAddButtons();
    }
}

function updateSelected() {
    selectedList.innerHTML = '';
    if (selected.length === 0) {
        selectedList.innerHTML = '<p class="text-muted text-center">No drinks added yet</p>';
    } else {
        selected.forEach(function (d, index) {
            const div = document.createElement('div');
            div.className = 'selected-item d-flex justify-content-between align-items-center';
            div.innerHTML = `
        <span>${index + 1}. ${d.strDrink}</span>
        <button class="btn btn-sm btn-outline-danger" onclick="removeFromGroup('${d.idDrink}')">×</button>
      `;
            selectedList.appendChild(div);
        });
    }
    countEl.textContent = selected.length;
}

function removeFromGroup(drinkId) {
    selected = selected.filter(function (s) { return s.idDrink !== drinkId; });
    updateSelected();
    updateAddButtons();
}

function updateAddButtons() {
    const buttons = document.querySelectorAll('.btn-success, .btn-secondary');
    buttons.forEach(function (btn, idx) {
        const drink = currentDrinks[idx];
        if (drink && selected.some(function (s) { return s.idDrink === drink.idDrink; })) {
            btn.className = 'btn btn-sm btn-secondary me-2';
            btn.disabled = true;
            btn.textContent = '✓ Added';
        } else {
            btn.className = 'btn btn-sm btn-success me-2';
            btn.disabled = false;
            btn.textContent = 'Add to Group';
        }
    });
}

function showDetails(index) {
    const d = currentDrinks[index];
    document.getElementById('modalTitle').textContent = d.strDrink;

    document.getElementById('modalBody').innerHTML = `
    <img src="${d.strDrinkThumb}" class="img-fluid rounded mb-3" style="max-height:200px;" />
    <p><strong>Category:</strong> ${d.strCategory || ''}</p>
    <p><strong>Alcoholic:</strong> ${d.strAlcoholic || ''}</p>
    <p><strong>Glass:</strong> ${d.strGlass || ''}</p>
    <p><strong>Instructions:</strong> ${d.strInstructions || ''}</p>
  `;

    const modal = new bootstrap.Modal(document.getElementById('drinkModal'));
    modal.show();
}

function search() {
    const term = searchInput.value.trim();
    if (!term) {
        loadDrinks()
            .then(function (drinks) {
                render(drinks);
            });
        return;
    }
    searchCocktail(term)
        .then(function (result) {
            render(result);
        });
}

searchBtn.addEventListener('click', search);
searchInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') search();
});

loadDrinks()
    .then(function (drinks) {
        render(drinks);
    });