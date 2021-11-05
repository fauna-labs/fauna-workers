This repository contains unofficial patterns, sample code, or tools to help developers build more effectively with [Fauna][fauna]. All [Fauna Labs][fauna-labs] repositories are provided “as-is” and without support. By using this repository or its contents, you agree that this repository may never be officially supported and moved to the [Fauna organization][fauna-organization].

---

# Fauna template for Cloudflare Workers

This template helps you build a fast, globally distributed REST API using [Cloudflare Workers](https://workers.cloudflare.com) and Fauna, the data API for modern applications.

The template uses [Fauna Schema Migrate](https://github.com/fauna-labs/fauna-schema-migrate), an infrastructure-as-code (IaC) tool, to deploy resources to your Fauna database. This template implements recommended practices for building with Fauna, including restricting access to the database through [user-defined functions](https://docs.fauna.com/fauna/current/learn/understanding/user_defined_functions) (UDFs) and least-privilege roles.

<!--
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fauna-labs/fauna-workers)
-->

## How to use this template

First, [install Wrangler](https://workers.cloudflare.com/docs/quickstart/), the Workers command-line tool, and generate a new project:

```console
$ wrangler generate my-fauna-api https://github.com/fauna-labs/fauna-workers
```

Change into the *my-fauna-api* directory, install the project dependencies, and publish your worker:

```console
$ cd my-fauna-api
$ wrangler publish
```

At this point your worker is published but is not yet configured to connect to your Fauna database. You can test this by sending an HTTP GET request to your worker's endpoint.

```console
$ curl https://my-fauna-api.<your-account-alias>.workers.dev

Hello, Fauna Workers!
```

### Creating your Fauna database

Open the [Fauna dashboard](https://dashboard.fauna.com) in your browser and login to your Fauna account. 

> **Note**: If you do not have a Fauna account, you can [sign up for one](https://dashboard.fauna.com/signup) and deploy this template using the free tier!

Choose *Create database*, provide a valid name, choose a [Region Group][fauna-region-groups] for your database, and choose *Create*.

> **Note**: If you choose either the *EU* or *US* Region Group, you must set the `FAUNADB_DOMAIN` environment variable to the correct endpoint before you deploy your Fauna resources with Fauna Schema Migrate.
 
EU Region Group:
```console
$ export FAUNADB_DOMAIN=db.eu.fauna.com
```

US Region Group:
```console
$ export FAUNADB_DOMAIN=db.fauna.com
```

This step is not necessary if you create your database in the *Classic* Region Group.

### Deploying your Fauna resources

Navigate to the *Security* tab and choose *New Key*. Ensure the *Role* is set to *Admin* and choose *Save* to create your new key. Copy and save this admin key to use in the next step.

> **Note**: You create an admin key *only* to create your Fauna infrastructure, such as [Collections](https://docs.fauna.com/fauna/current/learn/understanding/collections), [Roles](https://docs.fauna.com/fauna/current/security/roles), and [UDFs](https://docs.fauna.com/fauna/current/learn/understanding/user_defined_functions). Never use an admin key in your application!

From your project directory, run Fauna Schema Migrate in interactive mode:

```console
$ npx fauna-schema-migrate run
```

Choose *Generate* to generate the queries that will run in your migration. Review the queries in the *fauna/migrations* directory to see what is generated, then choose *Apply* to create the resources. When prompted, paste the admin key you copied in a previous step.

### Publishing your connection information to Cloudflare

The final step is creating a client key for accessing your database and storing that key in Cloudflare as a secret.

Return to your browser and again choose *New Key* from the *Security* tab in the Fauna dashboard. Be sure to select *Worker* as the role and choose *Save* to create your client key. Copy and save this client key to use in the next step.

> **Note**: This client key is restricted to the actions you explicitly allow. In this application, it is only allowed to call the *CreateProduct*, *GetProductByID*, AddProductQuantity*, and *DeleteProduct* UDFs. It cannot write to or read from any collections or indexes directly.

Add your key to your workers project by running the following command. Paste the client key you just created when prompted:

```console
$ wrangler secret put FAUNA_SECRET
```

If you created your database in a Region Group other than *Classic*, proceed to the next section to configure your connection.

If you created your database in the *Classic* Region Group, you can skip to [Testing your API](#testing-your-api).

### Configuring the connection for your Region Group

When you created your database, you specified a Region Group.  Connections to the database need to be configured with the corresponding Region Group endpoint.  If this is a child database, the Region Group will already be set to match the parent database.  If your database is in the `Classic` region group, then the default configuration is already set.  Otherwise, configure your project for the correct Region Group as follows:

1.  Refer to the [Region Groups][fauna-region-groups] documentation to obtain the correct endpoint for your Region Group.
1.  Set the `FAUNA_DOMAIN` environment variable to the appropriate endpoint.

    EU Region Group:
    ```console
    $ wrangler secret put FAUNA_DOMAIN
    Enter the secret text you'd like assigned to the variable FAUNA_DOMAIN on the script named my-fauna-api:
    db.eu.fauna.com
    🌀  Creating the secret for script name my-fauna-api
    ✨  Success! Uploaded secret FAUNA_DOMAIN.
    ```

    US Region Group:
    ```console
    $ wrangler secret put FAUNA_DOMAIN
    Enter the secret text you'd like assigned to the variable FAUNA_DOMAIN on the script named my-fauna-api:
    db.us.fauna.com
    🌀  Creating the secret for script name my-fauna-api
    ✨  Success! Uploaded secret FAUNA_DOMAIN.
    ```

## Testing your API

You can test your API using the endpoint that Wrangler provides, or you can test it locally using:

```console
$ wrangler dev
```

<details>
<summary>Create a product</summary>

```console
$ curl \
    --data '{"serialNumber": "H56N33834", "title": "Bluetooth Headphones", "weightLbs": 0.5}' \
    --header 'Content-Type: application/json' \
    --request POST \
    http://127.0.0.1:8787/products
```

You should receive a response similar to the following:

```json
{ 
  "productId": "<document_id>"
}
```

Copy and save the `productId` for use in the following queries.
</details>

<details>
<summary>Find a product by ID</summary>

```console
$ curl \
    --header 'Content-Type: application/json' \
    --request GET \
    http://127.0.0.1:8787/products/<document_id>
```

You should receive a response similar to the following:

```json
{
  "id": "<document_id>",
  "serialNumber": "H56N33834",
  "title": "Bluetooth Headphones",
  "weightLbs": 0.5,
  "quantity": 0
}
```

</details>

<details>
<summary>Update a product</summary>

```console
$ curl \
    --data '{"quantity": 5}' \
    --header 'Content-Type: application/json' \
    --request PATCH \
    http://127.0.0.1:8787/products/<document_id>/add-quantity
```

You should receive a response similar to the following:

```json
{
  "id": "<document_id>",
  "serialNumber": "H56N33834",
  "title": "Bluetooth Headphones",
  "weightLbs": 0.5,
  "quantity": 5
}
```
</details>

<details>
<summary>Delete a product</summary>

```console
$ curl \
    --header 'Content-Type: application/json' \
    --request DELETE \
    http://127.0.0.1:8787/products/<document_id>
```

You should receive a response similar to the following:

```json
{
  "id": "<document_id>",
  "serialNumber": "H56N33834",
  "title": "Bluetooth Headphones",
  "weightLbs": 0.5,
  "quantity": 0
}
```

</details>

## Additional resources

* [Fauna docs](https://docs.fauna.com)
* [Workers docs](https://developers.cloudflare.com/workers/)
* [Worktop](https://github.com/lukeed/worktop)
* [Wrangler docs](https://developers.cloudflare.com/workers/cli-wrangler)


[fauna]: https://www.fauna.com/
[fauna-labs]: https://github.com/fauna-labs
[fauna-organization]: https://github.com/fauna
[fauna-region-groups]: https://docs.fauna.com/fauna/current/api/fql/region_groups#how-to-use-region-groups
