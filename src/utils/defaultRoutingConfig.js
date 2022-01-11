const defaultRoutingConfig = {
  proxy: [],
  direct: [
    { type: "domains", value: "geosite:private" },
    { type: "domains", value: "geosite:cn" },
    { type: "ip", value: "geoip:private" },
    { type: "ip", value: "geoip:cn" },
  ],
  block: [],
}

export default defaultRoutingConfig
