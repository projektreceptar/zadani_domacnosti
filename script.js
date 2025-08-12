document.addEventListener('DOMContentLoaded', () => {
    const N8N_WEBHOOK_URL = 'https://jbzone.app.n8n.cloud/webhook/867e19c8-5689-400a-b595-767f4ec31b3e'; // DŮLEŽITÉ: Doplňte!

    const form = document.getElementById('household-form');
    const membersContainer = document.getElementById('members-container');
    const addMemberBtn = document.getElementById('add-member');
    const psidInput = document.getElementById('messenger-psid');

    const urlParams = new URLSearchParams(window.location.search);
    const psid = urlParams.get('psid');
    if (psid) {
        psidInput.value = psid;
    } else {
        alert('Chyba: Chybí identifikátor uživatele.');
    }

    const addMember = () => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member';
        memberDiv.innerHTML = `
            <select name="member_type" class="member_type_select">
                <option value="dospělý">Dospělý</option>
                <option value="dítě">Dítě</option>
            </select>
            <input type="number" name="age" class="age_input" placeholder="Věk (povinné pro děti)">
            <input type="text" name="allergens" placeholder="Alergie (oddělené čárkou)">
            <input type="text" name="restrictions" placeholder="Ostatní omezení, preference (oddělené čárkou)">
        `;
        membersContainer.appendChild(memberDiv);
        
        // Přidáme logiku pro zobrazení/skrytí a povinnost pole věku
        const typeSelect = memberDiv.querySelector('.member_type_select');
        const ageInput = memberDiv.querySelector('.age_input');
        
        typeSelect.addEventListener('change', () => {
            if (typeSelect.value === 'dítě') {
                ageInput.required = true;
                ageInput.style.display = 'block';
            } else {
                ageInput.required = false;
                ageInput.style.display = 'none';
                ageInput.value = ''; // Vyčistíme hodnotu
            }
        });
        // Vyvoláme událost hned na začátku, aby se pole pro dospělého skrylo
        typeSelect.dispatchEvent(new Event('change'));
    };

    addMember();
    addMemberBtn.addEventListener('click', addMember);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
            messenger_psid: psidInput.value,
            members: []
        };

        const memberDivs = membersContainer.querySelectorAll('.member');
        memberDivs.forEach(div => {
            const member = {
                member_type: div.querySelector('[name=member_type]').value,
                age: div.querySelector('[name=age]').value ? parseInt(div.querySelector('[name=age]').value) : null,
                allergens: div.querySelector('[name=allergens]').value.split(',').map(s => s.trim()).filter(s => s),
                restrictions: div.querySelector('[name=restrictions]').value.split(',').map(s => s.trim()).filter(s => s)
            };
            data.members.push(member);
        });

        try {
            await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            window.close();
        } catch (error) {
            alert(`Detailní chyba: ${error.message}`);
        }
    });
});
