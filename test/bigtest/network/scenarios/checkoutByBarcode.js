export default function checkoutByBarcode(server) {
  server.post('/circulation/check-out-by-barcode', ({ loans, items }, request) => {
    const params = JSON.parse(request.requestBody);
    const item = items.findBy({ barcode: params.itemBarcode });

    return loans.findBy({ itemId: item.id });
  });
}
