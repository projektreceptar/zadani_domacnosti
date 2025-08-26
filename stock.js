document.addEventListener('DOMContentLoaded', () => {
    // === NASTAVENÍ ===
    const SAVE_WEBHOOK_URL = 'https://jbzone.app.n8n.cloud/webhook-test/4266ba51-73b1-401e-ab06-e57cdfb6ad09'; // Později doplníme
    const AUTOCOMPLETE_WEBHOOK_URL = 'https://jbzone.app.n8n.cloud/webhook/6d80d418-c417-477f-9867-bf3e6c1bb74c'; // Později doplníme
    // =================

    const form = document.getElementById('stock-form');
    const itemsContainer = document.getElementById('items-container');
    const addItemBtn = document.getElementById('add-item');

    let psid; // Zde si uložíme PSID uživatele

    // Získáme PSID z URL
    const urlParams = new URLSearchParams(window.location.search);
    psid = urlParams.get('psid');
    if (!psid) {
        alert('Chyba: Chybí identifikátor uživatele (psid).');
    }

    const addItem = () => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'stock-item';
        // Přidán atribut 'list' pro napojení na našeptávač
        itemDiv.innerHTML = `
            <input type="text" class="name" placeholder="Název potraviny..." list="ingredients-datalist" required>
            <input type="number" class="quantity" placeholder="Množství" required>
            <input type="text" class="unit" placeholder="Jednotka" value="ks" required>
            <button type="button" class="remove-btn">-</button>
        `;
        itemsContainer.appendChild(itemDiv);

        itemDiv.querySelector('.remove-btn').addEventListener('click', () => {
            itemDiv.remove();
        });
    };
    
    // Našeptávač
    const setupAutocomplete = async () => {
        try {
            // Použijeme metodu POST, jak jsme se dohodli
            const response = await fetch(AUTOCOMPLETE_WEBHOOK_URL, { method: 'POST' });
            if (!response.ok) {
                 throw new Error(`Našeptávač vrátil chybu: ${response.status}`);
            }
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

    addItem(); 
    addItemBtn.addEventListener('click', addItem);
    setupAutocomplete();

    // Odeslání formuláře
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
            messenger_psid: psid,
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
            await fetch(SAVE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
                window.close();
        } catch (error) {
            alert(`Došlo k chybě při odesílání: ${error.message}`);
            console.error('Chyba při odesílání dat:', error);
        }
    });
});
