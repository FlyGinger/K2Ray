// parser for trojan server
// format: trojan://password@address:port#name
function parseTrojan(raw: string): Server {
  // split name from url
  let name = '';
  let url = raw;
  const well = raw.indexOf('#');
  if (well >= 0) {
    name = raw.substring(well + 1);
    url = raw.substring(0, well); // so url can not use '#'
  }

  // parse url
  const at = url.indexOf('@');
  const colon = url.indexOf(':', at);
  if (at < 0 || colon < 0) {
    throw new Error(`不正确的 Trojan 协议： ${raw}`);
  }

  return {
    name,
    address: url.substring(at + 1, colon),
    port: parseInt(url.substring(colon + 1), 10),
    password: url.substring(9, at),
    protocol: 'trojan',
  };
}

// parser for server URL
function parseURL(raw: string): Server {
  if (raw.startsWith('trojan://')) {
    return parseTrojan(raw);
  }
  throw new Error(`不支持的协议： ${raw}`);
}

function readSubscribe(url: string): Promise<Server[]> {
  return fetch(url)
    .then((response) => {
      // construct a reject if failed to read
      if (!response.ok) {
        return Promise.reject(
          new Error(`网络错误： ${response.statusText} ${response.status.toString()}`),
        );
      }
      if (response.body === null) {
        return Promise.reject(
          new Error('网络错误：响应数据为空。'),
        );
      }

      // read data from response
      let text = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      const push = (
        { value, done }: ReadableStreamReadResult<Uint8Array>,
      ): Promise<string | ReadableStreamReadResult<Uint8Array>> => {
        if (done) {
          return Promise.resolve(text);
        }
        text += decoder.decode(value, { stream: true });
        return reader.read().then(push);
      };
      return reader.read().then(push);
    })
    .then((base64) => {
      // convert base64 string to utf-8 string
      const raw = Buffer.from(base64 as string, 'base64').toString().split(/\s/);

      // read servers from raw string
      const servers = [] as Server[];
      for (let i = 0; i < raw.length; i += 1) {
        if (raw[i].length > 0) {
          // use try because parser is not in promise chain,
          // and it sometimes needs to reject
          try {
            // check protocol for using different parser
            const server = parseURL(raw[i]);
            servers.push(server);
          } catch (e) {
            return Promise.reject(e);
          }
        }
      }
      return servers;
    });
}

export { parseURL, readSubscribe };
