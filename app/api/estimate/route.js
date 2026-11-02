import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// All customer-supplied strings are HTML-escaped before interpolation into the
// email template — this endpoint is public and must never reflect raw markup.
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return ch;
    }
  });
}

function cleanPhone(phone = '') {
  return String(phone).replace(/[^0-9]/g, '').slice(0, 15);
}

function clampString(value, max) {
  const s = typeof value === 'string' ? value.trim() : '';
  return s.slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_LENGTHS = {
  name: 200,
  phone: 30,
  email: 254,
  organization: 200,
  kitType: 100,
  qualityTier: 100,
  customNames: 50,
  notes: 5000
};

export async function POST(request) {
  try {
    let payload;
    try {
      payload = await request.json();
    } catch (parseErr) {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const {
      name,
      phone,
      email,
      organization,
      kitType,
      qualityTier,
      quantity,
      customNames,
      notes
    } = payload || {};

    // --- Validation & normalization (all values capped to sane lengths) ---
    const safeName = clampString(name, MAX_LENGTHS.name);
    const safePhone = clampString(phone, MAX_LENGTHS.phone);
    const safeEmail = clampString(email, MAX_LENGTHS.email);
    const safeOrganization = clampString(organization, MAX_LENGTHS.organization);
    const safeKitType = clampString(kitType, MAX_LENGTHS.kitType);
    const safeQualityTier = clampString(qualityTier, MAX_LENGTHS.qualityTier);
    const safeCustomNames = clampString(customNames, MAX_LENGTHS.customNames);
    const safeNotes = clampString(notes, MAX_LENGTHS.notes);

    if (!safeName) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    const phoneDigits = cleanPhone(safePhone);
    if (!safePhone || phoneDigits.length < 8 || phoneDigits.length > 15) {
      return NextResponse.json(
        { error: 'A valid WhatsApp phone number (8-15 digits) is required.' },
        { status: 400 }
      );
    }

    if (safeEmail && !EMAIL_RE.test(safeEmail)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    let safeQuantity = parseInt(quantity, 10);
    if (!Number.isFinite(safeQuantity)) safeQuantity = 10;
    safeQuantity = Math.min(10000, Math.max(1, safeQuantity));

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.ESTIMATE_NOTIFICATION_EMAIL || 'crownandcross29@gmail.com';
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Crown & Cross <onboarding@resend.dev>';

    // Guard if API key is not yet provided by the owner
    if (!apiKey || apiKey === 're_placeholder_api_key') {
      return NextResponse.json(
        {
          error: 'Resend API key is not configured yet in .env.local',
          isConfigError: true
        },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);

    // Strip newlines — email subjects must stay single-line
    const emailSubject = `New Estimate Request: ${safeName} (${safeQuantity} kits - ${safeKitType || 'Team Kit'})`.replace(
      /[\r\n]+/g,
      ' '
    );

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d140f; color: #f2f6f3; padding: 32px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #141e17; border: 1px solid #233428; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #19271e; padding: 24px; border-bottom: 2px solid #c8a96a; text-align: center;">
            <h1 style="color: #c8a96a; margin: 0; font-size: 24px; letter-spacing: 0.04em;">CROWN &amp; CROSS</h1>
            <p style="color: #a4b6a9; font-size: 13px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.08em;">Bulk / Team Estimate Request</p>
          </div>

          <div style="padding: 28px;">
            <p style="font-size: 15px; color: #f2f6f3; margin-top: 0;">
              Hello Jason, a new wholesale / team estimate request was submitted on the website:
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <tr style="border-bottom: 1px solid #233428;">
                <td style="padding: 10px 0; color: #a4b6a9; width: 40%;">Customer Name:</td>
                <td style="padding: 10px 0; color: #f2f6f3; font-weight: bold;">${escapeHtml(safeName)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #233428;">
                <td style="padding: 10px 0; color: #a4b6a9;">WhatsApp Phone:</td>
                <td style="padding: 10px 0;">
                  <a href="https://wa.me/${phoneDigits}" style="color: #4ade80; text-decoration: none; font-weight: bold;">
                    ${escapeHtml(safePhone)} (Chat on WhatsApp)
                  </a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #233428;">
                <td style="padding: 10px 0; color: #a4b6a9;">Customer Email:</td>
                <td style="padding: 10px 0; color: #f2f6f3;">${escapeHtml(safeEmail) || 'Not provided'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #233428;">
                <td style="padding: 10px 0; color: #a4b6a9;">Team / Organization:</td>
                <td style="padding: 10px 0; color: #c8a96a; font-weight: bold;">${escapeHtml(safeOrganization) || 'Individual'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #233428;">
                <td style="padding: 10px 0; color: #a4b6a9;">Kit Type:</td>
                <td style="padding: 10px 0; color: #f2f6f3;">${escapeHtml(safeKitType)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #233428;">
                <td style="padding: 10px 0; color: #a4b6a9;">Quality Standard:</td>
                <td style="padding: 10px 0; color: #f2f6f3;">${escapeHtml(safeQualityTier)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #233428;">
                <td style="padding: 10px 0; color: #a4b6a9;">Quantity:</td>
                <td style="padding: 10px 0; color: #c8a96a; font-weight: bold; font-size: 16px;">${safeQuantity} kits</td>
              </tr>
              <tr style="border-bottom: 1px solid #233428;">
                <td style="padding: 10px 0; color: #a4b6a9;">Custom Printing:</td>
                <td style="padding: 10px 0; color: #f2f6f3;">${escapeHtml(safeCustomNames)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #a4b6a9; vertical-align: top;">Notes &amp; Requirements:</td>
                <td style="padding: 10px 0; color: #f2f6f3; white-space: pre-wrap;">${escapeHtml(safeNotes) || 'None specified.'}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 28px;">
              <a href="https://wa.me/${phoneDigits}" style="display: inline-block; background-color: #22c55e; color: #0d140f; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px;">
                Reply to Customer on WhatsApp →
              </a>
            </div>
          </div>

          <div style="background-color: #0a0f0c; padding: 16px; text-align: center; font-size: 12px; color: #6f8374; border-top: 1px solid #233428;">
            Crown &amp; Cross • Chennai, Tamil Nadu • "Wear Your Club. Wear Your Story."
          </div>
        </div>
      </div>
    `;

    const sendResult = await resend.emails.send({
      from: fromAddress,
      to: recipient,
      subject: emailSubject,
      html: htmlContent,
      replyTo: safeEmail || recipient
    });

    if (sendResult.error) {
      console.error('Resend delivery error:', sendResult.error);
      return NextResponse.json(
        { error: sendResult.error.message || 'Failed to dispatch email' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      id: sendResult.data?.id,
      message: `Estimate request emailed to ${recipient} successfully.`
    });
  } catch (err) {
    console.error('Estimate API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
