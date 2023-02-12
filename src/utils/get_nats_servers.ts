import config from '../config'

export function getNatsServers() {
    // Config
    const configService = config()
    const hosts = configService.nats.split(',')

    return hosts.map((host) => `nats://${host}`)
}
