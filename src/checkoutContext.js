import { createManifestContext } from '../../stripes-hooks';

const manifest2 = {
  /*
  selPatron: { initialValue: {} },
  query: { initialValue: {} },
  scannedItems: { initialValue: [] },
  checkoutSettings: {
    type: 'okapi',
    records: 'configs',
    path: 'configurations/entries?query=(module=CHECKOUT and configName=other_settings)',
  },
  */
  patrons: {
    type: 'okapi',
    records: 'users',
    path: 'users?query=id==%{activeRecord.patronId}',
    // accumulate: 'true',
    // fetch: false,
  },
  /*
  settings: {
    type: 'okapi',
    records: 'configs',
    path: 'configurations/entries?query=(module=USERS and configName=profile_pictures)',
  },
  loans: {
    type: 'okapi',
    path: 'circulation/loans?query=id=!{id}',
    // accumulate: 'true',
    // fetch: false,
  },
  patronBlocks: {
    type: 'okapi',
    records: 'manualblocks',
    path: 'manualblocks?query=userId=%{activeRecord.patronId}',
    DELETE: {
      path: 'manualblocks/%{activeRecord.blockId}',
    },
  },
  patronGroups: {
    type: 'okapi',
    records: 'usergroups',
    path: 'groups',
  },
  requests: {
    type: 'okapi',
    records: 'requests',
    accumulate: 'true',
    path: 'circulation/requests',
    fetch: false,
  },
  proxy: {
    type: 'okapi',
    records: 'proxiesFor',
    path: 'proxiesfor',
    accumulate: 'true',
    fetch: false,
  },
  */

  activeRecord: {},

};

export default createManifestContext(manifest2);
