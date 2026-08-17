import { FastifyPluginAsync } from "fastify";
import { BlockchainAdapterFactory } from "@crypto-tracer/blockchain";

export function createBlockchainRoutes(): FastifyPluginAsync {
  return async function (fastify) {
    // Address lookup
    fastify.get<{ Params: { address: string }; Querystring: { chain?: string } }>(
      "/api/addresses/:address",
      async (req, reply) => {
        const addr = req.params.address;
        const detected = BlockchainAdapterFactory.detectChain(addr);
        const chain = req.query.chain || detected.chain;
        const adapter = BlockchainAdapterFactory.getAdapter(chain);

        const balance = await adapter.getBalance(addr);
        const txs = await adapter.getAddressTransactions(addr, { limit: 25 });

        return reply.send({
          success: true,
          data: {
            address: addr,
            chain,
            balance,
            transactions: txs,
          },
        });
      }
    );

    // Transaction lookup
    fastify.get<{ Params: { hash: string }; Querystring: { chain?: string } }>(
      "/api/transactions/:hash",
      async (req, reply) => {
        const hash = req.params.hash;
        const detected = BlockchainAdapterFactory.detectChain(hash);
        const chain = req.query.chain || detected.chain;
        const adapter = BlockchainAdapterFactory.getAdapter(chain);

        const tx = await adapter.getTransaction(hash);
        if (!tx) {
          return reply.status(404).send({ success: false, error: "Transaction not found" });
        }

        return reply.send({ success: true, data: tx });
      }
    );
  };
}
