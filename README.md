# Fauna Labs

This repository contains unofficial patterns, sample code, or tools to help developers build more effectively with [Fauna][fauna]. All [Fauna Labs][fauna-labs] repositories are provided “as-is” and without support. By using this repository or its contents, you agree that this repository may never be officially supported and moved to the [Fauna organization][fauna-organization].

...

### Configure the connection for your Region Group
When you created your database, you specified a Region Group.  Connections to the database need to be configured with the corresponding Region Group endpoint.  If this is a child database, the Region Group will already be set to match the parent database.  If your database is in the `Classic` region group, then the default configuration is already set.  Otherwise, configure your project for the correct Region Group as follows:

- Refer to the [Region Groups](https://docs.fauna.com/fauna/current/api/fql/region_groups#how-to-use-region-groups) documentation to obtain the correct endpoint for your Region Group.
- Reference the [Connections](https://docs.fauna.com/fauna/current/drivers/connections.html) documentation for how to correctly set the endpoint for your specific driver.

[fauna]: https://www.fauna.com/
[fauna-labs]: https://github.com/fauna-labs
[fauna-organization]: https://github.com/fauna

