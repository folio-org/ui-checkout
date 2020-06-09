import { RestSerializer } from '@bigtest/mirage';

export default RestSerializer.extend({
  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    if (Array.isArray(json.automatedPatronBlocks)) {
      json.totalRecords = json.automatedPatronBlocks.length;
      json.resultInfo = {
        totalRecords: json.totalRecords,
        facets: [],
        diagnostics: [],
      };
    }

    return json;
  }
});