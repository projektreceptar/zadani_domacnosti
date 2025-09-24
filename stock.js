document.addEventListener('DOMContentLoaded', () => {
    // === NASTAVENÍ ===
    const SAVE_WEBHOOK_URL = 'https://jbzone.app.n8n.cloud/webhook/4266ba51-73b1-401e-ab06-e57cdfb6ad09'; // Později doplníme
    const AUTOCOMPLETE_WEBHOOK_URL = 'https://jbzone.app.n8n.cloud/webhook/6d80d418-c417-477f-9867-bf3e6c1bb74c'; // Později doplníme
    // =================

    const form = document.getElementById('stock-form');
    const itemsContainer = document.getElementById('items-container');
    const addItemBtn = document.getElementById('add-item');

    let householdId;
    let ingredientsData = [];

    const urlParams = new URLSearchParams(window.location.search);
    // ZMĚNA: Používáme PSID, jak jsme se dohodli dříve
    const psid = urlParams.get('psid'); 
    if (!psid) {
        alert('Chyba: Chybí identifikátor uživatele (psid).');
    }

    const addItem = () => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'stock-item';
        itemDiv.innerHTML = `
            <input type="text" class="name" placeholder="Název potraviny..." list="ingredients-datalist" required>
            <input type="number" step="any" class="quantity" placeholder="Množství" required>
            <input type="text" class="unit" placeholder="Jednotka" value="ks" required>
            <button type="button" class="remove-btn">-</button>
        `;
        itemsContainer.appendChild(itemDiv);

        const nameInput = itemDiv.querySelector('.name');
        const unitInput = itemDiv.querySelector('.unit');

        nameInput.addEventListener('change', () => {
            const selectedIngredient = ingredientsData.find(ing => ing.name === nameInput.value);
            if (selectedIngredient && selectedIngredient.default_unit) {
                unitInput.value = selectedIngredient.default_unit;
            }
        });

        itemDiv.querySelector('.remove-btn').addEventListener('click', () => {
            itemDiv.remove();
        });
    };
    
    const setupAutocomplete = async () => {
        try {
            const response = await fetch(AUTOCOMPLETE_WEBHOOK_URL, { method: 'POST' });
            if (!response.ok) throw new Error(`Našeptávač vrátil chybu: ${response.status}`);
            
            const ingredients = await response.json();
            ingredientsData = ingredients;
            
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

    addItem(); 
    addItemBtn.addEventListener('click', addItem);
    setupAutocomplete();

    // Odeslání formuláře - NOVÁ ROBUSTNÍ VERZE
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
            messenger_psid: psid, // Používáme PSID
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
            if (item.name && item.quantity > 0) {
                data.stock.push(item);
            }
        });

        try {
            console.log("Pokouším se odeslat data:", JSON.stringify(data, null, 2));
            console.log("Cílová URL:", SAVE_WEBHOOK_URL);

            const response = await fetch(SAVE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            console.log("Odpověď ze serveru:", response);

            if (!response.ok) {
                // Pokud server vrátí chybu (např. 4xx, 5xx), zobrazíme ji
                throw new Error(`Server odpověděl s chybou: ${response.status} ${response.statusText}`);
            }

            alert('Data byla úspěšně odeslána!');
            window.close();

        } catch (error) {
            alert(`Došlo k chybě, zkontrolujte konzoli (F12) pro detaily. Chyba: ${error.message}`);
            console.error('Detailní chyba při odesílání:', error);
        }
    });
});
