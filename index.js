import _ from 'lodash';
import { DOMParser, XMLSerializer } from 'xmldom';
import { parseString } from 'react-native-xml2js';

// const fetch = fetch || require('node-fetch');

const xmlHeader = '<?xml version="1.0" encoding="utf-8"?>';

class XMLHelper {
  constructor(xmlDoc) {
    this.xmlDoc = xmlDoc;
  }

  appendChild = (parentElement, name, text) => {
    let childElement = this.xmlDoc.createElement(name);
    if (typeof text !== 'undefined') {
      let textNode = this.xmlDoc.createTextNode(text);
      childElement.appendChild(textNode);
    }
    parentElement.appendChild(childElement);
    return childElement;
  }

  appendAttribute = (name, attribute, node) => {
    if (_.isObject(attribute)) {
      let childCDATA;
      const cdata = _.get(attribute, 'cdata');
      if (cdata) {
        childCDATA = this.xmlDoc.createCDATASection(cdata);
      }
      const nextNode = this.appendChild(node, name);
      if (childCDATA) {
        nextNode.appendChild(childCDATA);
      } else {
        this.appendEachChild(nextNode, attribute);
      }
    } else {
      this.appendChild(node, name, attribute);
    }
  }

  appendEachChild = (node, body) => {
    _.forEach(body, (value, key) => {
      if (_.isArray(value)) {
        const nextNode = this.appendChild(node, key);
        _.forEach(value, subValue => {
          this.appendEachChild(nextNode, subValue);
        });
      } else {
        this.appendAttribute(key, value, node);
      }
    });
  }
}

class SoapRequest {
  constructor(props) {
    this.defaults = {
      headers: {
        'Accept': 'text/xml',
        'Content-Type': 'text/xml;charset=UTF-8'
      },
      soapEnv: '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"></soap:Envelope>'
    };
    // Init properties
    this.init(props);
  }

  init = (props) => {
    this.soapEnv = _.get(props, 'soapEnv', this.defaults.soapEnv);
  }

  getXMLRequestString = () => {
    const xmlSerializer = new XMLSerializer();
    return `${xmlHeader}${xmlSerializer.serializeToString(this.xmlDoc)}`;
  }

  createRequest = (url, headers, body) => {
    this.requestURL = url;
    this.headers = { ...this.defaults.headers, ...headers };
    // Init XML
    this.xmlDoc = new DOMParser().parseFromString(this.soapEnv);
    this.XMLHelper = new XMLHelper(this.xmlDoc);
    this.rootElement = this.xmlDoc.documentElement;
    this.bodyElement = this.XMLHelper.appendChild(this.rootElement, 'soapenv:Body');
    // Append body
    this.XMLHelper.appendEachChild(this.bodyElement, body);
  }

  sendRequest = async () => {
    let response = await fetch(this.requestURL, {
      method: 'POST',
      headers: this.headers,
      body: this.getXMLRequestString()
    });

    this.xmlResponse = await response.text();

    parseString(this.xmlResponse, (err, result) => {
      if (err) {
        throw (err);
      }
      this.responseDoc = result;
    });

    return this.responseDoc;
  }
}

export default SoapRequest;
