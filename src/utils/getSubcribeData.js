// get subcribe data using subcribe URL
// convert raw data into javascript object
// return a promise
function getSubcribeDate(url) {
  return fetch(url)
    .then((response) => {
      // construct a reject if failed to read
      if (!response.ok) {
        return Promise.reject({
          message: "网络错误： " + response.statusText + " " + response.status.toString(),
        });
      }

      // read data from response
      let text = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      const push = ({ value, done }) => {
        if (done) {
          return text;
        }
        text += decoder.decode(value, { stream: true });
        return reader.read().then(push);
      };
      return reader.read().then(push);
    })
    .then((base64String) => {
      // convert base64 string to utf-8 string
      let raw = Buffer.from(base64String, "base64").toString().split(/\s/);

      // read servers from raw string
      let servers = [];
      for (let i = 0; i < raw.length; i++) {
        // skip empty line
        if (raw[i].length === 0) {
          continue;
        }

        // use try because parser is not in promise chain
        // and it sometimes need to reject
        try {
          // check protocol for using different parser
          if (raw[i].startsWith("trojan://")) {
            let server = parseTrojan(raw[i]);
            server.protocol = "trojan";
            servers.push(server);
          } else {
            return Promise.reject({
              message: "不支持的协议： " + raw[i],
            });
          }
        } catch (e) {
          return Promise.reject({
            message: e,
          });
        }
      }
      return servers;
    })
}

// parser for trojan server
// format: trojan://password@address:port#name
function parseTrojan(raw) {
  let at = raw.indexOf("@");
  let well = raw.indexOf("#");
  if (at < 0 || well < 0) {
    throw "不支持的协议 " + raw;
  }
  let colon = raw.indexOf(":", at);
  if (colon < 0) {
    throw "不支持的协议 " + raw;
  }

  return {
    name: raw.substring(well + 1),
    address: raw.substring(at + 1, colon),
    port: parseInt(raw.substring(colon + 1, well)),
    password: raw.substring(9, at),
  };
}

export default getSubcribeDate
