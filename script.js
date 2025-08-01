document.addEventListener('DOMContentLoaded', () => {
  const N8N_WEBHOOK_URL = 'https://jbzone.app.n8n.cloud/webhook/867e19c8-5689-400a-b595-767f4ec31b3e';

  const form = document.getElementById('household-form');
  const membersContainer = document.getElementById('members-container');
  const addMemberBtn = document.getElementById('add-member');
  const psidInput = document.getElementById('messenger-psid');

  if (!form || !membersContainer || !addMemberBtn || !psidInput) {
    console.error('Chybí některý z prvků formuláře (IDs).');
    return;
  }

  // PSID z URL
  const urlParams = new URLSearchParams(window.location.search);
  const psid = urlParams.get('psid');
  if (psid) {
    psidInput.value = psid;
  } else {
    alert('Chyba: Chybí identifikátor uživatele.');
    // Volitelně return; // pokud je PSID povinný
  }

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
  addMember();
  addMemberBtn.addEventListener('click', addMember);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = {
      messenger_psid: psidInput.value || null,
      members: Array.from(membersContainer.querySelectorAll('.member')).map(div => ({
        member_type: div.querySelector('[name=member_type]').value,
        age: div.querySelector('[name=age]').value ? parseInt(div.querySelector('[name=age]').value, 10) : null,
        restrictions: div.querySelector('[name=restrictions]').value
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      }))
    };

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        // mode: 'cors' // default
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Webhook nevrátil 2xx', res.status, text);
        alert('Nepodařilo se odeslat data. Zkuste to prosím znovu.');
        return;
      }

      // Tady máš jistotu, že POST prošel
      // Pokud běžíš ve FB WebView, window.close nemusí fungovat
      // Lepší je zobrazit potvrzení, nebo použít MessengerExtensions.requestCloseBrowser
      // window.close();
      alert('Děkujeme, uloženo.');
    } catch (error) {
      console.error('Chyba při odesílání dat:', error);
      alert('Nastala chyba při ukládání. Zkuste to prosím znovu.');
    }
  });
});
