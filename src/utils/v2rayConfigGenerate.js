import path from 'path'
const { execSync } = require('child_process')

function v2rayConfigGenerate(state) {
  let certRaw = execSync(path.join(state.k2ray.v2rayPath, "v2ctl") + " cert", {})
  let certStr = new TextDecoder().decode(certRaw)
  let cert = JSON.parse(certStr)

  let server = state.k2ray.serverInUse
  let config = {
    log: {
      access: path.join(state.k2ray.v2rayPath, "access.log"),
      error: path.join(state.k2ray.v2rayPath, "error.log"),
      logLevel: "warning"
    },
    inbounds: [
      {
        port: state.k2ray.socks,
        listen: "127.0.0.1",
        protocol: "socks",
        settings: { udp: true, auth: "noauth" }
      },
      {
        port: state.k2ray.http,
        listen: "127.0.0.1",
        protocol: "http"
      }
    ],
    outbounds: [
      {
        tag: "proxy",
        protocol: server.protocol,
        streamSettings: {
          network: "tcp",
          security: "tls",
          tlsSettings: {
            certificates: [cert]
          }
        },
        settings: {
          servers: [{
            password: server.password,
            port: server.port,
            email: "",
            level: 0,
            address: server.address
          }]
        }
      },
      {
        tag: "direct",
        protocol: "freedom",
        settings: {
          domainStrategy: "UseIP",
          userLevel: 0
        }
      },
      {
        tag: "block",
        protocol: "blackhole",
        settings: {
          response: {
            type: "none"
          }
        }
      }
    ],
    routing: {
      domainStrategy: "IPIfNonMatch",
      domainMatcher: "mph",
      rules: []
    }
  }

  Object.keys(state.routing).forEach((key) => {
    let rules = state.routing[key]
    let domains = []
    let ip = []
    for (let rule of rules) {
      if (rule.type === "domains") {
        domains.push(rule.value)
      } else {
        ip.push(rule.value)
      }
    }
    if (domains.length > 0) {
      config.routing.rules.push({
        type: "field",
        domains: domains,
        outboundTag: key
      })
    }
    if (ip.length > 0) {
      config.routing.rules.push({
        type: "field",
        ip: ip,
        outboundTag: key
      })
    }
  })

  return config
}

export default v2rayConfigGenerate
