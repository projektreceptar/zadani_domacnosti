document.addEventListener('DOMContentLoaded', () => {
    // === NASTAVENÍ ===
    const SAVE_WEBHOOK_URL = 'https://jbzone.app.n8n.cloud/webhook/4266ba51-73b1-401e-ab06-e57cdfb6ad09'; // Později doplníme
    const AUTOCOMPLETE_WEBHOOK_URL = 'https://jbzone.app.n8n.cloud/webhook/6d80d418-c417-477f-9867-bf3e6c1bb74c'; // Později doplníme
    // =================

    const form = document.getElementById('stock-form');
    const itemsContainer = document.getElementById('items-container');
    const addItemBtn = document.getElementById('add-item');

    let householdId; // Zde si uložíme ID domácnosti

    // Získáme ID domácnosti z URL
    const urlParams = new URLSearchParams(window.location.search);
    householdId = urlParams.get('householdId');
    if (!householdId) {
        alert('Chyba: Chybí identifikátor domácnosti.');
    }

    const addItem = () => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'stock-item';
        itemDiv.innerHTML = `
            <input type="text" class="name" placeholder="Název potraviny..." list="ingredients-datalist">
            <input type="number" class="quantity" placeholder="Množství">
            <input type="text" class="unit" placeholder="Jednotka">
            <button type="button" class="remove-btn">-</button>
        `;
        itemsContainer.appendChild(itemDiv);

        // Funkcionalita pro tlačítko "Odebrat"
        itemDiv.querySelector('.remove-btn').addEventListener('click', () => {
            itemDiv.remove();
        });
    };
    
    // Našeptávač
    const setupAutocomplete = async () => {
        try {
            const response = await fetch(AUTOCOMPLETE_WEBHOOK_URL, { method: 'POST' });
            const ingredients = await response.json();
            
            const datalist = document.createElement('datalist');
            datalist.id = 'ingredients-datalist';
            ingredients.forEach(ingredient => {
                const option = document.createElement('option');
                option.value = ingredient.name;
                datalist.appendChild(option);
            });
            document.body.appendChild(datalist);
        } catch (error) {
            console.error('Chyba při načítání našeptávače:', error);
        }
    };

    addItem(); // Přidáme první řádek hned
    addItemBtn.addEventListener('click', addItem);
    setupAutocomplete(); // Spustíme načtení našeptávače

    // Odeslání formuláře
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
            household_id: parseInt(householdId),
            stock: []
        };

        const itemDivs = itemsContainer.querySelectorAll('.stock-item');
        itemDivs.forEach(div => {
            const item = {
                name: div.querySelector('.name').value,
                quantity: parseFloat(div.querySelector('.quantity').value) || 0,
                unit: div.querySelector('.unit').value || 'ks'
            };
            if (item.name) { // Přidáme jen vyplněné řádky
                data.stock.push(item);
            }
        });

        try {
            await fetch(SAVE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (window.MessengerExtensions) {
                MessengerExtensions.requestCloseBrowser();
            } else {
                window.close();
            }
        } catch (error) {
            alert(`Detailní chyba: ${error.message}`);
        }
    });
});
