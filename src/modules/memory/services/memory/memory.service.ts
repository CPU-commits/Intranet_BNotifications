import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { createClient, RedisClientType } from 'redis'
import config from 'src/config'

@Injectable()
export class MemoryService {
    private redisClient: RedisClientType
    private readonly memory = new Map<string, string>()

    constructor(
        @Inject(config.KEY)
        private readonly configService: ConfigType<typeof config>,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    ) {
        const { username, password, host, port } = this.configService.redis
        this.redisClient = createClient({
            url: `redis://${username}:${password}@${host}:${port}`,
        })

        this.redisClient.on('error', (err) => {
            this.logger.error('Redis err', err.message)
        })
        this.redisClient.on('connect', () => {
            this.logger.log('Redis connected')
            if (this.memory.values.length > 0) {
                this.logger.log('Passing values from local memory to Redis')

                // Build array with values
                const values: Array<{ value: string; key: any }> = []
                this.memory.forEach((value, key) => {
                    // Push value to array and delete key
                    values.push({
                        key,
                        value,
                    })
                    this.memory.delete(key)
                })
                // Try to insert values into redis
                Promise.allSettled(
                    values.map((value) => {
                        this.redisClient.set(value.key, value.value)
                    }),
                )
            }
        })

        this.redisClient.connect()
    }

    async set(key: string, value: string) {
        try {
            await this.redisClient.set(key, value, {
                EX: 10800,
            })
        } catch (err) {
            this.memory.set(key, value)
        }
    }

    async get(key: string): Promise<string | null | undefined> {
        try {
            const data = await this.redisClient.get(key)
            if (data) this.set(key, data)
            return data
        } catch (err) {
            return this.memory.get(key)
        }
    }

    async getKeys(value: string) {
        try {
            const keys = await this.redisClient.keys('*')
            const values = await this.redisClient.mGet(keys)
            const keysValues: Array<string> = []
            // Iterate
            values.forEach((val, index) => {
                if (val === value) keysValues.push(keys[index])
            })
            return keysValues
        } catch (err) {
            const keysValues: Array<string> = []
            this.memory.forEach((val, key) => {
                if (value === val) keysValues.push(key)
            })
            return keysValues
        }
    }

    async del(key: string) {
        if (this.memory.has(key)) this.memory.delete(key)
        await this.redisClient.del(key)
    }
}
