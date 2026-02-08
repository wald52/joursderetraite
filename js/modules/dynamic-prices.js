/**
 * Module: dynamic-prices.js
 * Met à jour certains exemples avec des données quotidiennes (sans clé API)
 */

import { updateExampleValueById } from './examples.js';

const CACHE_KEY = 'dynamicPricesCache';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 heures

const GOLD_ABOVE_GROUND_TONNES = 219891; // World Gold Council (end-2025)
const APPLE_SHARES_OUTSTANDING = 15.5e9; // Approx. shares, updated quarterly
const TROY_OZ_PER_TONNE = 32150.7466;

async function fetchJson(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

async function fetchText(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
    } finally {
        clearTimeout(timer);
    }
}

function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function writeCache(payload) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
        // ignore storage errors
    }
}

function isCacheFresh(cache) {
    if (!cache || !cache.timestamp) return false;
    return (Date.now() - cache.timestamp) < CACHE_TTL_MS;
}

function toNumber(value) {
    if (typeof value !== 'string') value = String(value || '');
    const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : null;
}

function parseUbcMetalsEur(html) {
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const tables = Array.from(doc.querySelectorAll('table'));
        for (const table of tables) {
            const headerCells = Array.from(table.querySelectorAll('tr th'));
            if (!headerCells.length) continue;

            const headerTexts = headerCells.map(th => th.textContent.replace(/\s+/g, ' ').trim().toLowerCase());
            const eurIndex = headerTexts.indexOf('eur/oz.');
            if (eurIndex === -1) continue;

            const rows = Array.from(table.querySelectorAll('tr'));
            return {
                goldEur: extractRowValue(rows, 'XAU', eurIndex)
            };
        }
    } catch {
        // ignore parsing errors
    }
    return { goldEur: null, silverEur: null, platinumEur: null };
}

function extractRowValue(rows, code, valueIndex) {
    for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));
        if (!cells.length) continue;
        const codeCell = cells[0].textContent.replace(/\s+/g, '').toUpperCase();
        if (codeCell !== code) continue;
        if (valueIndex < cells.length) {
            return toNumber(cells[valueIndex].textContent);
        }
    }
    return null;
}

export async function initDynamicPrices() {
    const cached = readCache();
    if (isCacheFresh(cached)) {
        applyDynamicValues(cached);
        return;
    }

    const results = await Promise.allSettled([
        fetchJson('https://api.coinbase.com/v2/prices/BTC-EUR/spot'),
        fetchText('https://blockchain.info/q/totalbc?cors=true'),
        fetchText('https://fx.sauder.ubc.ca/today.php'),
        fetchJson('https://api.coinbase.com/v2/exchange-rates?currency=USD'),
        fetchText('https://stooq.com/q/l/?s=aapl.us&i=d')
    ]);

    const btcSpot = results[0].status === 'fulfilled' ? results[0].value : null;
    const btcSupplySat = results[1].status === 'fulfilled' ? results[1].value : null;
    const metalsHtml = results[2].status === 'fulfilled' ? results[2].value : null;
    const usdRates = results[3].status === 'fulfilled' ? results[3].value : null;
    const appleCsv = results[4].status === 'fulfilled' ? results[4].value : null;

    const btcEur = toNumber(btcSpot?.data?.amount);
    const btcSupply = btcSupplySat ? (toNumber(btcSupplySat) / 1e8) : null;
    const usdToEur = toNumber(usdRates?.data?.rates?.EUR);

    const metals = metalsHtml ? parseUbcMetalsEur(metalsHtml) : { goldEur: null };
    const appleUsd = appleCsv ? parseStooqClose(appleCsv) : null;

    const payload = {
        timestamp: Date.now(),
        btcEur,
        btcSupply,
        usdToEur,
        goldEur: metals.goldEur,
        appleUsd
    };

    if (cached) {
        const merged = {
            ...cached,
            ...Object.fromEntries(Object.entries(payload).filter(([k, v]) => v !== null))
        };
        writeCache(merged);
        applyDynamicValues(merged);
    } else {
        writeCache(payload);
        applyDynamicValues(payload);
    }
}

function applyDynamicValues(data) {
    if (!data) return;

    if (Number.isFinite(data.btcEur)) {
        updateExampleValueById('btc_spot', data.btcEur);
    }
    if (Number.isFinite(data.goldEur)) {
        updateExampleValueById('gold_spot', data.goldEur);
    }

    if (Number.isFinite(data.btcEur) && Number.isFinite(data.btcSupply)) {
        updateExampleValueById('btc_market_cap', data.btcEur * data.btcSupply);
    }

    if (Number.isFinite(data.goldEur)) {
        const goldMarketCap = data.goldEur * TROY_OZ_PER_TONNE * GOLD_ABOVE_GROUND_TONNES;
        updateExampleValueById('gold_market_cap', goldMarketCap);
    }

    if (Number.isFinite(data.appleUsd) && Number.isFinite(data.usdToEur)) {
        const appleMarketCapEur = data.appleUsd * APPLE_SHARES_OUTSTANDING * data.usdToEur;
        updateExampleValueById('apple_market_cap', appleMarketCapEur);
    }
}

function parseStooqClose(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return null;
    const header = lines[0].split(',');
    const closeIndex = header.findIndex(h => h.toLowerCase() === 'close');
    if (closeIndex === -1) return null;
    const data = lines[1].split(',');
    if (closeIndex >= data.length) return null;
    return toNumber(data[closeIndex]);
}
