import type { Pool, PoolClient } from 'pg'

/**
 * The subset of {@link PoolClient pg.PoolClient}'s API that Clarity exposes to custom features.
 * This may not be a true `PoolClient` instance, instead it may
 * be an adapter that provides the `Pool.connect`, `Pool.query`,
 * and `PoolClient.release()` with the same signatures as in `pg`.
 */
export type PostgresPoolClient = Pick<PoolClient, 'query' | 'release'>

/**
 * The subset of {@link Pool pg.Pool}'s API that Clarity exposes to custom features.
 * This may not be a true `Pool` instance, instead it may
 * be an adapter that provides the `Pool.connect`, `Pool.query`,
 * and `PoolClient.release()` with the same signatures as in `pg`.
 */
export type PostgresPool = Pick<Pool, 'query'> & {
  connect(): Promise<PostgresPoolClient>
  connect(
    callback: (
      err: Error | undefined,
      client: PostgresPoolClient | undefined,
      done: (release?: any) => void
    ) => void
  ): void
}

/**
 * The Clarity application context types exposed to custom features
 */
export interface AppContext {
  /**
   * The postgres pool of connections to the app database.
   * This may not be a true {@link Pool pg.Pool} instance, instead it may
   * be an adapter that provides the `Pool.connect`, `Pool.query`,
   * and `PoolClient.release()` with the same signatures in `pg`.
   */
  postgresPool: PostgresPool
}
