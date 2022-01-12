const execSync = require('child_process').execSync
import path from "path"

function getCert(v2rayPath) {
  return execSync(path.join(v2rayPath, "v2ctl") + " cert", {})
}

export default getCert
