/* istanbul ignore file */

// default scenario is used during `yarn start --mirage`
export default function defaultScenario(server) {
  server.create('user', {
    barcode: 9676761472500
  });

  server.create('request');
}
