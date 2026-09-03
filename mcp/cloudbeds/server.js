#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_BASE = 'https://hotels.cloudbeds.com/api/v1.1';
const API_KEY = process.env.CLOUDBEDS_API_KEY;

if (!API_KEY) {
  process.stderr.write('Error: CLOUDBEDS_API_KEY environment variable is not set\n');
  process.exit(1);
}

async function cb(endpoint, params = {}) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Cloudbeds API error ${res.status}`);
  }
  return json;
}

const server = new Server(
  { name: 'cloudbeds', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_reservations',
      description: 'List reservations. Filter by status, check-in date range, or text search.',
      inputSchema: {
        type: 'object',
        properties: {
          propertyID:  { type: 'string', description: 'Cloudbeds property ID' },
          status:      { type: 'string', enum: ['confirmed','canceled','checked_in','checked_out','not_confirmed'], description: 'Filter by reservation status' },
          checkInFrom: { type: 'string', description: 'Check-in from (YYYY-MM-DD)' },
          checkInTo:   { type: 'string', description: 'Check-in to (YYYY-MM-DD)' },
          modifiedFrom:{ type: 'string', description: 'Modified from (YYYY-MM-DD)' },
          guestName:   { type: 'string', description: 'Search by guest name' },
          pageNumber:  { type: 'number', description: 'Page number (default 1)' },
          pageSize:    { type: 'number', description: 'Results per page (max 100, default 20)' },
        },
        required: ['propertyID'],
      },
    },
    {
      name: 'get_reservation',
      description: 'Get full details of a single reservation by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          propertyID:    { type: 'string', description: 'Cloudbeds property ID' },
          reservationID: { type: 'string', description: 'Reservation ID' },
        },
        required: ['propertyID', 'reservationID'],
      },
    },
    {
      name: 'get_rooms',
      description: 'List all room types and units in a property.',
      inputSchema: {
        type: 'object',
        properties: {
          propertyID: { type: 'string', description: 'Cloudbeds property ID' },
        },
        required: ['propertyID'],
      },
    },
    {
      name: 'get_availability',
      description: 'Check room availability and rates for a date range.',
      inputSchema: {
        type: 'object',
        properties: {
          propertyID: { type: 'string', description: 'Cloudbeds property ID' },
          startDate:  { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          endDate:    { type: 'string', description: 'End date (YYYY-MM-DD)' },
          adults:     { type: 'number', description: 'Number of adults (default 1)' },
        },
        required: ['propertyID', 'startDate', 'endDate'],
      },
    },
    {
      name: 'get_guests',
      description: 'Search guests by name or email.',
      inputSchema: {
        type: 'object',
        properties: {
          propertyID: { type: 'string', description: 'Cloudbeds property ID' },
          guestName:  { type: 'string', description: 'Search by guest name' },
          email:      { type: 'string', description: 'Search by email address' },
          pageNumber: { type: 'number' },
          pageSize:   { type: 'number' },
        },
        required: ['propertyID'],
      },
    },
    {
      name: 'get_properties',
      description: 'List all properties in the Cloudbeds account. Use this first to get property IDs.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'get_housekeeping',
      description: 'Get housekeeping status for all rooms on a given date.',
      inputSchema: {
        type: 'object',
        properties: {
          propertyID: { type: 'string', description: 'Cloudbeds property ID' },
          date:       { type: 'string', description: 'Date (YYYY-MM-DD), defaults to today' },
        },
        required: ['propertyID'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'get_reservations':
        result = await cb('getReservations', args);
        break;

      case 'get_reservation':
        result = await cb('getReservation', args);
        break;

      case 'get_rooms':
        result = await cb('getRooms', args);
        break;

      case 'get_availability':
        result = await cb('getAvailability', args);
        break;

      case 'get_guests':
        result = await cb('getGuests', args);
        break;

      case 'get_properties':
        result = await cb('getProperties');
        break;

      case 'get_housekeeping':
        result = await cb('getHousekeeping', {
          propertyID: args.propertyID,
          date: args.date,
        });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
