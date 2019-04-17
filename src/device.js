// @flow
import os          from 'os';
import { version } from '../package.json';

export type Device = {
  name:                string,
  UUID:                string,
  os?:                 string,
  type:                string,
  version:             string,
  serverPrefix:        string,
  suppportedEncodings: [string]
};

export default {
  name:         'Kamicast1234',
  UUID:         'a7205345-e79b-43a3-b569-b658fafdbe0c',
  os:           `${os.platform()}/${os.release()}`,
  type:         'server',
  version,
  serverPrefix: '',
  suppportedEncodings: ['json', 'bencode']
};
