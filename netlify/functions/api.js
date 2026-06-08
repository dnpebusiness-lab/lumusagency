// Cloudbeds API proxy — credentials live in Netlify env vars, never in client code
// Set CLOUDBEDS_API_KEY in Netlify Dashboard → Site configuration → Environment variables

const CLOUDBEDS_BASE = 'https://hotels.cloudbeds.com/api/v1.2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

async function cloudbedsGet(path, params, apiKey) {
  const qs = params.toString();
  const url = `${CLOUDBEDS_BASE}${path}${qs ? '?' + qs : ''}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const apiKey = process.env.CLOUDBEDS_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'CLOUDBEDS_API_KEY environment variable is not set' }),
    };
  }

  const q = event.queryStringParameters || {};
  const { action, propertyID, startDate, endDate, adults, children } = q;

  try {
    let result;

    switch (action) {

      // List all properties in the account
      case 'properties': {
        result = await cloudbedsGet('/getHotels', new URLSearchParams(), apiKey);
        break;
      }

      // Get room types for a property
      case 'rooms': {
        if (!propertyID) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'propertyID is required' }) };
        }
        const p = new URLSearchParams({ propertyID });
        result = await cloudbedsGet('/getRooms', p, apiKey);
        break;
      }

      // Check available rooms for a date range
      case 'availability': {
        if (!propertyID || !startDate || !endDate) {
          return {
            statusCode: 400,
            headers: CORS,
            body: JSON.stringify({ error: 'propertyID, startDate and endDate are required' }),
          };
        }
        const p = new URLSearchParams({ propertyID, startDate, endDate });
        if (adults) p.set('adults', adults);
        if (children) p.set('children', children);
        result = await cloudbedsGet('/getAvailableRooms', p, apiKey);
        break;
      }

      // Get reservations (read-only)
      case 'reservations': {
        if (!propertyID) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'propertyID is required' }) };
        }
        const p = new URLSearchParams({ propertyID });
        if (q.status) p.set('status', q.status);
        if (q.dateFrom) p.set('dateFrom', q.dateFrom);
        if (q.dateTo) p.set('dateTo', q.dateTo);
        result = await cloudbedsGet('/getReservations', p, apiKey);
        break;
      }

      default:
        return {
          statusCode: 400,
          headers: CORS,
          body: JSON.stringify({
            error: 'Unknown action',
            available: ['properties', 'rooms', 'availability', 'reservations'],
          }),
        };
    }

    return {
      statusCode: result.status,
      headers: CORS,
      body: JSON.stringify(result.body),
    };

  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS,
      body: JSON.stringify({ error: 'Cloudbeds API request failed', detail: err.message }),
    };
  }
};
