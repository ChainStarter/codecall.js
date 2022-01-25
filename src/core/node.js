import solc from 'solc'
import libs from './libs'
// set default solc
libs.setSolc(solc)

// download other solc version
const setVersion = (v = 'v0.7.4+commit.3f05b770') => {
  return new Promise((resolve, reject) => {
    solc.loadRemoteVersion(v, function(err, solcSnapshot) {
      if (err) {
        reject(err)
      } else {
        libs.setSolc(solcSnapshot)
      }
    });
  })
}

export default {
  ...libs,
  setVersion,
}
