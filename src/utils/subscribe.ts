import { Server } from '../store/index'
import { fetch, ResponseType } from '@tauri-apps/api/http';
import { decode } from 'js-base64'

export function fetchServers(url: string): Promise<Server[]> {
  return new Promise((resolve, reject) => {
    const servers = [] as Server[]
    fetch(url, { method: 'GET', responseType: ResponseType.Text }).then((response) => {
      if (response.ok) {
        // @ts-ignore
        const text = decode(response.data)
        const lines = text.split('\n')

        // format: protocol://password@address:port#name
        lines.forEach((line) => {
          const server = {
            name: '',
            address: '',
            port: 0,
            password: '',
            protocol: ''
          }

          line = line.trim()

          // protocol
          const protocolIndex = line.indexOf('://')
          if (protocolIndex <= 0) {
            return
          }
          server.protocol = line.substring(0, protocolIndex)
          line = line.substring(protocolIndex + 3)

          // password
          const passwordIndex = line.indexOf('@')
          if (passwordIndex <= 0) {
            return
          }
          server.password = line.substring(0, passwordIndex)
          line = line.substring(passwordIndex + 1)

          // address
          const addressIndex = line.indexOf(':')
          if (addressIndex <= 0) {
            return
          }
          server.address = line.substring(0, addressIndex)
          line = line.substring(addressIndex + 1)

          // port
          const portIndex = line.indexOf('#')
          if (portIndex <= 0) {
            return
          }
          server.port = Number.parseInt(line.substring(0, portIndex), 10)
          line = line.substring(portIndex + 1)

          // name
          if (line.length == 0) {
            return
          }
          server.name = line

          // ok
          servers.push(server)
        })
      } else {
        reject('服务器的响应错误。')
      }
      resolve(servers)
    }).catch(() => {
      reject('无法从订阅链接获取数据，请检查链接和网络。')
    })
  })
}
