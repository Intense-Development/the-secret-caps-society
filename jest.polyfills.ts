import { TextEncoder, TextDecoder } from 'util';
// @ts-ignore
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
}
// @ts-ignore
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

// Polyfill Web Streams API pieces required by MSW/interceptors using Node built-in 'stream/web'
// Available in Node 18+
import {
  TransformStream as NodeTransformStream,
  ReadableStream as NodeReadableStream,
  WritableStream as NodeWritableStream,
} from 'stream/web';

// @ts-ignore
if (typeof global.TransformStream === 'undefined') {
  // @ts-ignore
  global.TransformStream = NodeTransformStream as unknown as typeof global.TransformStream;
}
// @ts-ignore
if (typeof global.ReadableStream === 'undefined') {
  // @ts-ignore
  global.ReadableStream = NodeReadableStream as unknown as typeof global.ReadableStream;
}
// @ts-ignore
if (typeof global.WritableStream === 'undefined') {
  // @ts-ignore
  global.WritableStream = NodeWritableStream as unknown as typeof global.WritableStream;
}
