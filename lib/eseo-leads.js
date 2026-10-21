// Counts a real lead on the eSEOspace leads dashboard (eseospace-leads.vercel.app).
// Called only for leads that go to the client's normal inbox, after the spam /
// blocklist screen. Sends no name, email, phone, message or IP — just the site,
// the page and the channel label. Never throws and never waits more than 2.5s.
import { leadSourceSummary } from './lead-source.js';

const SITE = 'infinitykitchenandbathllc.com';

export function leadCountFields(s) {
  try {
    const sum = leadSourceSummary(s);
    const c = sum.label === 'not recorded' ? '' : sum.label;
    const p = sum.landing || s?.page || '';
    const cp = s?.l?.q?.utm_campaign || s?.f?.q?.utm_campaign || '';
    return { p, c, cp };
  } catch {
    return { p: '', c: '', cp: '' };
  }
}

export async function countLead(f) {
  // count this lead on the eSEOspace leads dashboard (never blocks or fails the form)
  try {
    await fetch('https://eseospace-leads.vercel.app/api/t', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-eseo-key': '7186827b9e1efb63eab8b94d43d6e5ed' },
      body: JSON.stringify({ k: 'lead', s: SITE, p: f?.p || '', c: f?.c || '', cp: f?.cp || '' }),
      signal: AbortSignal.timeout(2500),
    });
  } catch {}
}
