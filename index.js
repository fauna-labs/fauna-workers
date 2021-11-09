// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import {Router, listen} from 'worktop';
import faunadb from 'faunadb';
import {getFaunaError} from './utils.js';

const router = new Router();
const domain = globalThis.FAUNA_DOMAIN || 'db.fauna.com';
const secret = globalThis.FAUNA_SECRET || '';

const faunaClient = new faunadb.Client({
  secret: secret,
  headers: { 'X-Fauna-Source': 'fauna-workers' },
  domain: domain,
});

const { Call } = faunadb.query;

// This route is to test that your API was deployed and works
// independent of any Fauna settings. It is safe to remove.
router.add('GET', '/', async (_request, response) => {
  response.send(200, 'Hello, Fauna Workers!');
});

// Sending an HTTP POST request to this endpoint creates a new document
// in the "Products" collection.
//
// Expected body:
// {
//   "serialNumber": <string>,
//   "title": <string>,
//   "weightLbs": <number>
// }
//
// Expected response:
// {
//   "productId": <string>
// }
router.add('POST', '/products', async (request, response) => {
  try {
    const {serialNumber, title, weightLbs} = await request.body();

    const result = await faunaClient.query(
      Call(
        "CreateProduct",
        [
          serialNumber,
          title,
          weightLbs,
          0
        ]
      )
    );

    response.send(200, {
      productId: result.ref.id
    });
  } catch (error) {
    const faunaError = getFaunaError(error);
    response.send(faunaError.status, faunaError);
  }
});

// Sending an HTTP GET request to this endpoint retrieves the document
// from the "Products" collection with the ID specified in the URL.
//
// Expected response:
// {
//   "id": <string>,
//   "serialNumber": <string>,
//   "title": <string>,
//   "weightLbs": <number>,
//   "quantity": <number>
// }
router.add('GET', '/products/:productId', async (request, response) => {
  try {
    const productId = request.params.productId;

    const result = await faunaClient.query(
      Call(
        "GetProductByID",
        productId
      )
    );

    response.send(200, result);

  } catch (error) {
    const faunaError = getFaunaError(error);
    response.send(faunaError.status, faunaError);
  }
});

// Sending an HTTP PATCH request to this endpoint creates a new document
// in the "Products" collection.
//
// For details on why this endpoint uses PATCH and not PUT, please see:
//   https://fauna.com/blog/getting-started-with-fauna-and-cloudflare-workers#updating-the-inventory-quantity
//
// Expected body:
// {
//   "quantity": <number>
// }
//
// Expected response:
// {
//   "id": <string>,
//   "serialNumber": <string>,
//   "title": <string>,
//   "weightLbs": <number>,
//   "quantity": <number>
// }
router.add('PATCH', '/products/:productId/add-quantity', async (request, response) => {

  try {
    const productId = request.params.productId;
    const {quantity} = await request.body();

    const result = await faunaClient.query(
      Call(
        "AddProductQuantity",
        [
          productId,
          quantity
        ]
      )
    );

    response.send(200, result);

  } catch (error) {
    const faunaError = getFaunaError(error);
    response.send(faunaError.status, faunaError);
  }
});

// Sending an HTTP DELETE request to this endpoint removes the document
// with the ID specified in the URL from the "Products" collection.
//
// Expected response:
// {
//   "id": <string>,
//   "serialNumber": <string>,
//   "title": <string>,
//   "weightLbs": <number>,
//   "quantity": <number>
// }
router.add('DELETE', '/products/:productId', async (request, response) => {

  try {
    const productId = request.params.productId;

    const result = await faunaClient.query(
      Call(
        "DeleteProduct",
        productId
      )
    );

    response.send(200, result);

  } catch (error) {
    const faunaError = getFaunaError(error);
    response.send(faunaError.status, faunaError);
  }
});

// Start the Worktop router.
listen(router.run);
