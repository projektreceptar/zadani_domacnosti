document.addEventListener('DOMContentLoaded', () => {
    const N8N_WEBHOOK_URL = 'https://jbzone.app.n8n.cloud/webhook-test/867e19c8-5689-400a-b595-767f4ec31b3e'; // DŮLEŽITÉ: Doplňte později!

    const form = document.getElementById('household-form');
    const membersContainer = document.getElementById('members-container');
    const addMemberBtn = document.getElementById('add-member');
    const psidInput = document.getElementById('messenger-psid');

    // Krok 1: Získání PSID z URL adresy
    const urlParams = new URLSearchParams(window.location.search);
    const psid = urlParams.get('psid');
    if (psid) {
        psidInput.value = psid;
    } else {
        alert('Chyba: Chybí identifikátor uživatele.');
    }

    // Funkce pro přidání nového člena
    const addMember = () => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member';
        memberDiv.innerHTML = `
            <select name="member_type">
                <option value="dospělý">Dospělý</option>
                <option value="dítě">Dítě</option>
            </select>
            <input type="number" name="age" placeholder="Věk (pouze pro děti)">
            <input type="text" name="restrictions" placeholder="Omezení, alergie (oddělené čárkou)">
        `;
        membersContainer.appendChild(memberDiv);
    };

    // Přidáme hned prvního člena
    addMember(); 

    // Reakce na kliknutí tlačítka "Přidat člena"
    addMemberBtn.addEventListener('click', addMember);

    // Krok 2: Zpracování a odeslání formuláře
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Zabráníme klasickému odeslání formuláře

        const data = {
            messenger_psid: psidInput.value,
            members: []
        };

        const memberDivs = membersContainer.querySelectorAll('.member');
        memberDivs.forEach(div => {
            const member = {
                member_type: div.querySelector('[name=member_type]').value,
                age: div.querySelector('[name=age]').value ? parseInt(div.querySelector('[name=age]').value) : null,
                // Rozdělí text na pole a odstraní prázdné místo kolem
                restrictions: div.querySelector('[name=restrictions]').value.split(',').map(s => s.trim()).filter(s => s)
            };
            data.members.push(member);
        });

        // Odeslání dat do n8n
        try {
            await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            // Krok 3: Zavření WebView po úspěšném odeslání
            window.close();
        } catch (error) {
            console.error('Chyba při odesílání dat:', error);
            alert('Nastala chyba při ukládání. Zkuste to prosím znovu.');
        }
    });
});
