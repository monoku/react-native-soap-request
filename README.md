# react-native-soap-request
Simple module for making SOAP requests

### Install

```
npm install react-native-soap-request --save
```

### Example Usage

```js
const soapRequest = new SoapRequest();

const xmlRequest = soapRequest.createRequest(
  'https://daf.magensa.net/v2/Service.svc',
  {
    'Connection': 'Keep-Alive'
  },
  {
  'tem:Process': {
    'dec:PayloadInfo': {
      'dec:Headers': {
        'sys:KeyValuePairOfstringstring': {
          'sys:key': 'Content-Type',
          'sys:value': 'text/xml; charset=utf-8'
        }
      },
      'dec:Payload': {
        cdata: 'USER=User'
      },
      'dec:Uri': 'https://payflowpro.paypal.com'
    }
  }
}
);

const response = await soapRequest.sendRequest();
```
