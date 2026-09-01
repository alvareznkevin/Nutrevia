import * as mockClient from './mockClient';
import * as realClient from './realClient';

export const api = {
  ...mockClient,
  ...realClient,
};