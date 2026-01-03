export async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  if (RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'no-reply@senegal-livres.sn',
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[Email] Resend error:', res.status, text);
    }
    return;
  }

  if (SENDGRID_API_KEY) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'no-reply@senegal-livres.sn' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[Email] SendGrid error:', res.status, text);
    }
    return;
  }

  // Fallback: log the email content (no persistence beyond logs)
  console.warn('[Email] No email provider configured. Logging email content instead.');
  console.log('[Email] To:', to);
  console.log('[Email] Subject:', subject);
  console.log('[Email] HTML:', html);
}

export function renderFailNotification(params: {
  transactionRef: string;
  bookTitle?: string;
  customerPhone?: string;
  timestampIso: string;
}) {
  const { transactionRef, bookTitle, customerPhone, timestampIso } = params;
  const safeRef = transactionRef || 'N/A';
  const safeBook = bookTitle || 'N/A';
  const safePhone = customerPhone || 'N/A';
  const safeDate = new Date(timestampIso).toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' });

  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>PayDunya - Échec de paiement</h2>
      <p>Un paiement a échoué sur senegal-livres.sn.</p>
      <ul>
        <li><strong>Référence de transaction:</strong> ${safeRef}</li>
        <li><strong>Livre concerné:</strong> ${safeBook}</li>
        <li><strong>Téléphone client:</strong> ${safePhone}</li>
        <li><strong>Date et heure:</strong> ${safeDate}</li>
      </ul>
      <p>Aucune donnée personnelle n'a été stockée.</p>
    </div>
  `;
}

export function renderPurchaseDeliveryEmail(params: {
  toEmail: string;
  deliveries: Array<{ title: string; downloadUrl?: string | null; hasPdf?: boolean; r2Url?: string | null }>;
  etaMinutes?: number | null;
}) {
  const { toEmail, deliveries, etaMinutes } = params;
  const anyDownload = deliveries.some(d => d.downloadUrl || d.r2Url);
  const listItems = deliveries.map(d => {
    const link = d.r2Url || d.downloadUrl;
    if (link) {
      return `<li><strong>${d.title}</strong>: <a href="${link}">Télécharger votre eBook</a></li>`;
    }
    return `<li><strong>${d.title}</strong>: version physique — nous allons organiser la livraison.</li>`;
  }).join('');

  const header = anyDownload
    ? 'Vos eBooks sont prêts !'
    : 'Confirmation de paiement — livraison physique à organiser';

  const physicalNote = anyDownload
    ? ''
    : `<p>Merci pour votre achat. Pour la livraison physique, répondez à ce message avec :</p>
       <ul>
         <li>Votre nom complet</li>
         <li>Adresse de livraison</li>
         <li>Numéro de téléphone</li>
         <li>Email de contact</li>
       </ul>
       ${typeof etaMinutes === 'number' ? `<p>Délai estimé: ~${etaMinutes} minutes</p>` : ''}`;

  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>${header}</h2>
      <p>Bonjour, ${toEmail}</p>
      <ul>${listItems}</ul>
      ${physicalNote}
      <p>Cordialement,<br/>Senegal-Livres</p>
    </div>
  `;
}

export function renderAdminPaymentStatusEmail(params: {
  status: 'validated' | 'cancelled' | 'pending';
  orderId: string;
  amount?: number | null;
  userEmail?: string | null;
  bookTitles?: string[];
  provider?: string;
  responseCode?: string;
  timestampIso?: string;
}) {
  const { status, orderId, amount, userEmail, bookTitles, provider, responseCode } = params;
  const safeDate = new Date(params.timestampIso || new Date().toISOString()).toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' });
  const label = status === 'validated' ? 'Paiement validé' : status === 'cancelled' ? 'Paiement échoué/annulé' : 'Paiement en attente';
  const books = (bookTitles && bookTitles.length) ? `<ul>${bookTitles.map(t => `<li>${t}</li>`).join('')}</ul>` : '<em>N/A</em>';
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>${label}</h2>
      <p>Commande: <strong>${orderId || 'N/A'}</strong></p>
      <p>Montant: <strong>${typeof amount === 'number' ? amount.toFixed(2) + ' €' : 'N/A'}</strong></p>
      <p>Client: <strong>${userEmail || 'N/A'}</strong></p>
      <p>Fournisseur: <strong>${provider || 'PayDunya'}</strong></p>
      <p>Code réponse: <strong>${responseCode || 'N/A'}</strong></p>
      <p>Date: <strong>${safeDate}</strong></p>
      <p>Livres:</p>
      ${books}
    </div>
  `;
}

export function renderAdminPhysicalDeliveryInstructionEmail(params: {
  orderId: string;
  amount?: number | null;
  userEmail?: string | null;
  bookTitles?: string[];
  timestampIso?: string;
}) {
  const { orderId, amount, userEmail, bookTitles } = params;
  const safeDate = new Date(params.timestampIso || new Date().toISOString()).toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' });
  const books = (bookTitles && bookTitles.length) ? `<ul>${bookTitles.map(t => `<li>${t}</li>`).join('')}</ul>` : '<em>N/A</em>';
  const amt = typeof amount === 'number' ? `${amount.toFixed(2)} €` : 'N/A';
  const contact = userEmail || 'N/A';
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Action requise: expédier la version physique</h2>
      <p><strong>Commande:</strong> ${orderId || 'N/A'}</p>
      <p><strong>Montant:</strong> ${amt}</p>
      <p><strong>Acheteur (contact email):</strong> ${contact}</p>
      <p><strong>Livres concernés:</strong></p>
      ${books}
      <hr/>
      <p>Veuillez envoyer la version physique du/des livre(s) à l'acheteur.</p>
      <p>Si aucune adresse n'est enregistrée, contactez l'acheteur pour obtenir:</p>
      <ul>
        <li>Nom complet</li>
        <li>Adresse de livraison</li>
        <li>Numéro de téléphone</li>
        <li>Email de contact</li>
      </ul>
      <p>Date: <strong>${safeDate}</strong></p>
    </div>
  `;
}
