const { ApolloServer } = require("apollo-server");
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
require("dotenv").config();

class StargateGraphQLDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    request.http.headers.set(
      "x-cassandra-token",
      process.env.REACT_APP_ASTRA_TOKEN
    );
  }
}

const gateway = new ApolloGateway({
  serviceList: [
    {
      name: "coins",
      url: "https://f83d3bef-1da3-4ce2-a905-05ea041ebc19-southcentralus.apps.astra.datastax.com/api/graphql/coins",
    },
    {
      name: "deals",
      url: "http://localhost:4001/graphql",
    },
  ],

  introspectionHeaders: {
    "x-cassandra-token": process.env.REACT_APP_ASTRA_TOKEN,
  },

  buildService({ name, url }) {
    if (name == "coins") {
      return new StargateGraphQLDataSource({ url });
    } else {
      return new RemoteGraphQLDataSource({ url });
    }
  },
  __exposeQueryPlanExperimental: true,
});

(async () => {
  const server = new ApolloServer({
    gateway,
    engine: false,
    subscriptions: false,
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Gateway ready at ${url}`);
  });
})();
