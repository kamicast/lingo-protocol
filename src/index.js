// @flow
import LingoServer from './server';
import LingoClient from './client';

export default {
  server: LingoServer,
  client: LingoClient
};

export { default as LingoServer } from './server';
export { default as LingoClient } from './client';
