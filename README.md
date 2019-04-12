# Uport Server and Client authentication

A POC try [uPort](https://www.uport.me/) authentication.

## Setup

### Prerequisite

1. Node version v10.15.3
2. Install uPort app for iOS/Android at [uport.me](https://www.uport.me)

### Install

``` bash
npm install
```

### Start the server

``` bash
node server.js
```

``` console
Login Service running, open at https://bf8ac40b.ngrok.io
```

### Test client authentication

1. Access the link like https://bf8ac40b.ngrok.io/client
2. Scan the barcode image by the uPort app download from [uport.me](https://www.uport.me)
3. The uPort app will display the allow access notification, click Share to Login
4. The server response with the address: Congratulations you are now logged in`. Here is your DID identifier: {"did":"did:ethr:0xf28b..."}

### Test server authentication

1. Access the link like https://bf8ac40b.ngrok.io
2. Click login then the server will return the barcode image
3. Scan the barcode image by the uPort app download from [uport.me](https://www.uport.me/)
4. The uPort app will display the allow access notification, click Share to Login
5. The JWT will display on the browser.

### Conclusion

1. Client authentication

* The uport-connect only return the DID(distributed identity) is the ETH address {"did":"did:ethr:0xf28b..."}.
* The address is public and can share to every one. We can't use the DID to authenticated to the back-end APi.

There is the suggestion to fix this issue [Issue #245](https://github.com/uport-project/uport-connect/issues/245)

2. Server authentication

* Once user scan the barcode, uport will send the credential via the callback url. The server handle this request but the JWT need to be transfer to client.

* Solution: We can use long pulling or SSE to push the JWT back to client.

* The [https://demo.uport.me](https://demo.uport.me) are using long pulling but I think long pulling is wasted the server resourse then I come up with the SSE (Server Send Event).

### Reference links

* https://github.com/uport-project/demo
* https://hackernoon.com/never-use-passwords-again-with-ethereum-and-metamask-b61c7e409f0d
* https://ethereum.stackexchange.com/questions/58553/login-system-for-dapp-without-metamask
* https://www.toptal.com/ethereum/one-click-login-flows-a-metamask-tutorial
* https://netbasal.com/javascript-the-magic-behind-event-emitter-cce3abcbcef9
