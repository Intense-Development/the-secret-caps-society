import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfills for Node test environment
// TextEncoder/TextDecoder are required by msw/@mswjs/interceptors in some Node versions
import { TextEncoder, TextDecoder } from 'util';
// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// MSW setup for tests (node environment)
// Note: MSW v2 is ESM-only and may require custom Jest transform settings for node_modules.
// To keep unit tests simple and fast, we do not start the MSW server here by default.
// If you need MSW in a specific test, set it up within that test file using dynamic import.
// import { server } from './src/test/msw/server';
// beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
