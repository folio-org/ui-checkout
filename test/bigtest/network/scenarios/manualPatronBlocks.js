import faker from 'faker';

import { manualBlockMessage } from '../../constants/mockData';

export default function patronBlocks(server) {
  server.del('/manualblocks/:id');

  server.get('/manualblocks',
    {
      manualblocks: [
        {
          type: 'Manual',
          desc: manualBlockMessage,
          staffInformation: 'Last 3 have bounced back and the letter we sent was returned to us.',
          patronMessage: 'Please contact the Main Library to update your contact information.',
          expirationDate: faker.date.future().toISOString(),
          borrowing: true,
          renewals: true,
          requests: true,
          metadata: {
            createdDate: '2018-10-16T23:07:02Z',
            createdByUserId: '1ad737b0-d847-11e6-bf26-cec0c932ce02',
            createdByUsername: 'Doe',
            updatedDate: '2018-10-16T23:07:02Z',
            updatedByUserId: '695540df-cf63-4c67-91c1-d8746920d1dd',
            updatedByUsername: 'robertjones'
          },
          userId: '1',
          id: '46399627-08a9-414f-b91c-a8a7ec850d03',
        },
      ],
      totalRecords: 1,
    });
}
