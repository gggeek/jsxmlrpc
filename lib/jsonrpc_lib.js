/**
* JS-XMLRPC: Yet Another JSONRPC Library, in Javascript!
*
* ...as if the world needed it...
*
* FOR COMPLETE API DOCS, READ PHP-XMLRPC API DOCS. THE SAME API (almost) IS IMPLEMENTED HERE!
*
* Many thanks to Jan-Klaas Kollhof for JSOLAIT, and to the Yahoo YUI team, for
* providing the building blocks for all of this
*
* @author G. Giunta
* @version $Id: jsonrpc_lib.js,v 1.11 2008/07/23 19:28:36 ggiunta Exp $
* @copyright (c) 2006-2009 G. Giunta
* @license code licensed under the BSD License: http://phpxmlrpc.sourceforge.net/jsxmlrpc/license.txt
*
* KNOWN DIFFERENCES FROM PHP-XMLRPC:
* + jsonrpc_parse_resp() defaults to native parsing
*
* @todo json parsing code in json_parse()
*/

// Requires: xmlrpc_lib.js

/**
* @private
* @todo add support for charset transcoding
*/
function json_encode_entities(data, src_encoding, dest_encoding)
{
    if (data == undefined) // catches case of data === null as well
	{
    	return '';
    }
	return data.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\u002F/g, '\\/').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u0008/g, '\\b').replace(/\v/g, '\\v').replace(/\f/g, '\\f');
}

/**
* @private
*/
function json_parse(data, return_jsvals, src_encoding, dest_encoding)
{
	if (return_jsvals == undefined)
	{
		return_jsvals = false;
	}
	if (src_encoding == undefined)
	{
		src_encoding = 'UTF-8';
	}
	if (dest_encoding == undefined)
	{
		dest_encoding = 'ISO-8859-1';
	}

	_xh['isf_reason'] = 'non-native JSON parsing not yet implemented.';
	return false;
}

/**
* @private
*/
function json_parse_native(data)
{
	/// @todo !!!VERY IMPORTANT!!! regexp to find out if it is valid json...
	try
	{
		var out = eval('(' + data + ')');
		_xh['value'] = out;
		return true;
	}
	catch (e)
	{
		_xh['isf_reason'] = 'JSON parsing failed';
		return false;
	}
}

/**
* @private
*/
function jsonrpc_parse_resp(data, return_jsvals, use_native_parsing)
{
	if (return_jsvals == undefined)
	{
		return_jsvals = false;
	}
	if (use_native_parsing == undefined)
	{
		use_native_parsing = true;
	}

	_xh['isf'] = 0;
	_xh['isf_reason'] = '';
	if (use_native_parsing)
	{
		var ok = json_parse_native(data);
		// we encode js vals to jsonrpcvals later, if needed
		//if (!return_jsvals)
		//{
		//	_xh['value'] = jsonrpc_encode(_xh['value']);
		//}
	}
	else
	{
		var ok = json_parse(data, return_jsvals);
	}
	if (ok)
	{
		//if (!return_jsvals)
		//{
		//	_xh['value'] = _xh['value'].me;
		//}
		if (typeof(_xh['value']) != 'object' || _xh['value']['result'] === undefined
			|| _xh['value']['error'] === undefined || _xh['value']['id'] === undefined)
		{
			//_xh['isf'] = 2;
			_xh['isf_reason'] = 'JSON parsing did not return correct jsonrpc response object';
			return false;
		}
		//if (!return_jsvals)
		//{
		//	var d_error = jsonrpc_decode(_xh['value']['error']);
		//	_xh['value']['id'] = php_jsonrpc_decode(_xh['value']['id']);
		//}
		//else
		//{
			var d_error = _xh['value']['error'];
		//}
		_xh['id'] = _xh['value']['id'];
		if (d_error != null)
		{
			_xh['isf'] = 1;
				//_xh['value'] = $d_error;
			if (typeof(d_error) == 'object' && d_error['faultCode'] !== undefined
				&& d_error['faultString'] !== undefined)
			{
				if(d_error['faultCode'] == 0)
				{
					// FAULT returned, errno needs to reflect that
					d_error['faultCode'] = -1;
				}
				_xh['value'] = d_error;
			}
			// NB: what about jsonrpc servers that do NOT respect
			// the faultCode/faultString convention???
			// we force the error into a string. regardless of type...
			else //if (is_string(_xh['value']))
			{
				if (return_jsvals)
				{
					_xh['value'] = {'faultCode': -1, 'faultString': var_export(_xh['value']['error'])};
				}
				else
				{
					_xh['value'] = {'faultCode': -1, 'faultString': serialize_jsonrpcval(jsonrpc_encode(_xh['value']['error']))};
				}
			}
		}
		else
		{
			if (!return_jsvals)
				_xh['value'] = jsonrpc_encode(_xh['value']['result']);
			else
				_xh['value'] = _xh['value']['result'];
		}
		return true;
	}
	else
	{
		return false;
	}
}

/******************************************************************************/
/**
* @constructor
**/
function jsonrpc_client(path, server, port, method)
{
	this.no_multicall = true; // by default, multicall is not supported in jsonrpc
	this.return_type = 'jsonrpcvals';

	this.init(path, server, port, method);
}

jsonrpc_client.prototype = new xmlrpc_client();

/******************************************************************************/
/**
* @param {string} meth Name of the method to be invoked
* @param {array} pars list of parameters for method call (jsonrpcval objects)
* @param {mixed} id of method call. Either a string, number or boolean or null. NULL has a special meaning for json-rpc
* @constructor
*/
function jsonrpcmsg(meth, pars, id)
{
	this.id = null;
	/** @private **/
	this.params = []; // somehow needed for making this weird subclassing work
	/** @private **/
	this.content_type = 'application/json';

	if(id !== undefined)
	{
		this.id = id;
	}

	this.init(meth, pars);
}

// let jsonrpcresp inherit methods from xmlrpcresp
jsonrpcmsg.prototype = new xmlrpcmsg();

/**
* @private
*/
jsonrpcmsg.prototype.parseResponse = function (data, headers_processed, return_type)
{
	var headers = '';
	if (headers_processed === undefined)
	{
		headers_processed = false;
	}
	else if (typeof(headers_processed) == 'string')
	{
		headers = headers_processed;
		headers_processed = true;
	}

	if (return_type === undefined)
	{
		return_type = 'jsonrpcvals';
	}

	if (this.debug)
	{
		xmlrpc_debug_log('<PRE>---GOT---\n' + htmlentities(data) + '\n---END---\n</PRE>');
	}
	if (data == '')
	{
		xmlrpc_error_log('XML-RPC: jsonrpcmsg::parseResponse: no response received from server.');
		var r = new jsonrpcresp(0, xmlrpcerr['no_data'], xmlrpcstr['no_data']);
		return r;
	}

	_xh = {headers: [], cookies: []};
	var raw_data = data;
	// examining http headers: check first if given as second param to function
	if (headers != '')
	{
		var r = this.parseResponseHeaders(headers, true);
	}
	// else check if http headers given as part of complete html response
	else if (data.slice(0, 4) == 'HTTP')
	{
		// if it was so, remove them (or return an error response, if parsing fails)
		var r = this.ParseResponseHeaders(data, headers_processed);
		if (typeof(r) !== 'string')
		{
			r.raw_data = data;
			return r;
		}
		else
		{
			data = r;
		}
	}

	if (this.debug)
	{
		var start = data.indexOf('/* SERVER DEBUG INFO (BASE64 ENCODED):');
		if (start != -1)
		{
			start += 39; //new String('<!-- SERVER DEBUG INFO (BASE64 ENCODED):').length();
			var end = data.indexOf('*/', start);
			var comments = data.slice(start, end-1);
			xmlrpc_debug_log('<PRE>---SERVER DEBUG INFO (DECODED)---\n\t'+htmlentities(base64_decode(comments).replace(/\n/g, '\n\t'))+'\n---END---\n</PRE>');
		}
	}

	// be tolerant of extra whitespace in response body
	data = data.replace(/^\s/, '').replace(/\s$/, '');

	// be tolerant of junk after methodResponse (e.g. javascript ads automatically inserted by free hosts)
	var pos = data.lastIndexOf('}');
	if (pos >= 0)
	{
		data = data.slice(0, pos+17);
	}

	// if user wants back raw json, give it to him
	if (return_type == 'json')
	{
		var r = new jsonrpcresp(data, 0, '', 'json');
		r.hdrs = _xh['headers'];
		r._cookies = _xh['cookies'];
		r.raw_data = raw_data;
		return r;
	}

	// @todo shall we try to check for non-unicode json received ???

	if (!jsonrpc_parse_resp(data, return_type=='jsvals'))
	{
		if (this.debug)
		{
			/// @todo echo something for user?
		}

		var r = new jsonrpcresp(0, xmlrpcerr['invalid_return'],
					xmlrpcstr['invalid_return'] + ' ' + _xh['isf_reason']);
	}
			//elseif ($return_type == 'jsonrpcvals' && !is_object($GLOBALS['_xh']['value']))
			//{
				// then something odd has happened
				// and it's time to generate a client side error
				// indicating something odd went on
			//	$r = & new jsonrpcresp(0, $GLOBALS['xmlrpcerr']['invalid_return'],
			//		$GLOBALS['xmlrpcstr']['invalid_return']);
			//}
	else
	{
		var v = _xh['value'];

		if (this.debug)
		{
			xmlrpc_debug_log("<PRE>---PARSED---\n");
			xmlrpc_debug_log(var_export(v));
			xmlrpc_debug_log("\n---END---</PRE>");
		}

		if(_xh['isf'])
		{
			var r = new jsonrpcresp(0, v['faultCode'], v['faultString']);
		}
		else
		{
			var r = new jsonrpcresp(v, 0, '', return_type);
		}
		r.id = _xh['id'];
	}

	r.hdrs = _xh['headers'];
	r._cookies = _xh['cookies'];
	r.raw_data = raw_data;
	return r;
}

/**
* @private
*/
jsonrpcmsg.prototype.createPayload = function (charset_encoding)
{
	/// @ todo: verify if all chars are allowed for method names or can
	/// we just skip the js encoding on it?
	this.payload = '{\n"method": "' + json_encode_entities(this.methodname, '', charset_encoding) + '",\n"params": [ ';
	for(var i = 0; i < this.params.length; ++i)
	{
		// NB: we try to force serialization as json even though the object
		// param might be a plain xmlrpcval object.
		// This way we do not need to override addParam, aren't we lazy?
		this.payload += '\n  ' + serialize_jsonrpcval(this.params[i], charset_encoding) + ',';
	}
	this.payload = this.payload.slice(0, -1) + '\n],\n"id": ' + (this.id == null ? 'null' : this.id) + '\n}\n';
}

/******************************************************************************/
/**
* @constructor
*/
function jsonrpcresp(val, fcode, fstr, valtyp)
{
	this.id = null;

	this.init(val, fcode, fstr, valtyp);
}

// let jsonrpcresp inherit methods, default values, from xmlrpcresp
jsonrpcresp.prototype = new xmlrpcresp();

/**
* @private
*/
jsonrpcresp.prototype.serialize = function (charset_encoding)
{
	this.payload = serialize_jsonrpcresp(this, this.id, charset_encoding);
	return this.payload;
}

/******************************************************************************/
/**
* Create a jsonrpcval object out of a plain javascript value
* @param {mixed} val
* @param {string} type Any valid json type name (lowercase). If null, 'string' is assumed
* @constructor
*/
function jsonrpcval(val, type)
{
	this.init(val, type);
}

// let jsonrpcval inherit from xmlrpcval
jsonrpcval.prototype = new xmlrpcval();

/**
* @private
*/
jsonrpcval.prototype.serialize = function (charset_encoding)
{
	return serialize_jsonrpcval(this, charset_encoding);
}

/******************************************************************************/

/**
* Takes a json value in jsonrpcval object format
* and translates it into native javascript types.
* @public
**/
function jsonrpc_decode(jsonrpc_val, options)
{
	switch(jsonrpc_val.kindOf())
	{
		case 'scalar':
			return jsonrpc_val.scalarVal();
		case 'array':
			var size = jsonrpc_val.arraySize();
			var arr = [];
			for(var i = 0; i < size; ++i)
			{
				arr[arr.length] = jsonrpc_decode(jsonrpc_val.arrayMem(i), options);
			}
			return arr;
		case 'struct':
			// If user said so, try to rebuild js objects for specific struct vals.
			/// @todo should we raise a warning for class not found?
			// shall we check for proper subclass of xmlrpcval instead of
			// presence of _php_class to detect what we can do?
			if ((options != undefined && options['decode_js_objs']) && jsonrpc_val._js_class != '')
				//&& class_exists($xmlrpc_val->_php_class)) /// @todo check if a class exists with given name
			{
				var obj = new jsonrpc_val._js_class;
			}
			else
			{
				var obj = {};
			}
			for(var key in jsonrpc_val.me)
			{
				obj[key] = jsonrpc_decode(jsonrpc_val.me[key], options);
			}
			return obj;
		case 'msg':
			var paramcount = jsonrpc_val.getNumParams();
			var arr = [];
			for(var i = 0; i < paramcount; ++i)
			{
				arr[arr.length] = jsonrpc_val(jsonrpc_val.getParam(i));
			}
			return arr;
		}
}

/**
* Takes native javascript types and encodes them into jsonrpc object format.
* It will not re-encode jsonrpcval objects.
* @public
**/
function jsonrpc_encode(js_val, options)
{
	var type = typeof js_val;
	switch(type)
	{
		case 'string':
			//if ((options != undefined && options['auto_dates']) && js_val.search(/^[0-9]{8}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/) != -1)
			//	var xmlrpc_val = new xmlrpcval(js_val, 'dateTime.iso8601');
			//else
				var jsonrpc_val = new jsonrpcval(js_val, 'string');
			break;
		case 'number':
			/// @todo...
			var num = new Number(js_val);
			if (num == parseInt(num))
			{
				var jsonrpc_val = new jsonrpcval(js_val, 'int');
			}
			else //if (num == parseFloat(num))
			{
				var jsonrpc_val = new jsonrpcval(js_val, 'double');
			}
			//else
			//{
				// ??? only NaN and Infinity can get here. Encode them as zero (double)...
			//	var xmlrpc_val = new xmlrpcval(0, 'double');
			//}
			break;
		case 'boolean':
			var jsonrpc_val = new jsonrpcval(js_val, 'boolean');
			break;
		case 'object':
			// we should be able to use js_val instanceof Null, but FF refuses it...
			// nb: check nulls first, since they have no attributes
			if (js_val === null)
			{
				//if (options != undefined && options['null_extension'])
				//{
					var jsonrpc_val = new jsonrpcval(null, 'null');
				//}
				//else
				//{
				//	var xmlrpc_val = new xmlrpcval();
				//}
			}
			else
			if (js_val.toJsonRpcVal)
			{
				var jsonrpc_val = js_val.toJsonRpcVal();
			}
			else
			if (js_val instanceof Array)
			{
				var arr = [];
					for(var i = 0; i < js_val.length; ++i)
					{
						arr[arr.length] = jsonrpc_encode(js_val[i], options);
					}
					var jsonrpc_val = new jsonrpcval(arr, 'array');
			}
			else
			// xmlrpcval acquired capability to do this on its own, declaring toXmlRpcVal()
			//if (js_val instanceof xmlrpcval)
			//{
			//	var xmlrpc_val = js_val;
			//}
			//else
			{
				// generic js object. encode all members except functions
				var arr = {};
				for(var attr in js_val)
				{
					if (typeof js_val[attr] != 'function')
					{
						arr[attr] = jsonrpc_encode(js_val[attr], options);
					}
				}
				var jsonrpc_val = new jsonrpcval(arr, 'struct');
				/*if (in_array('encode_php_objs', options))
				{
					// let's save original class name into xmlrpcval:
					// might be useful later on...
					$xmlrpc_val._php_class = get_class($php_val);
				}*/
			}
			break;
		// match 'function', 'undefined', ...
		default:
			// it has to return an empty object in case
			var jsonrpc_val = new jsonrpcval();
			break;
		}
		return jsonrpc_val;
}

/**
* Convert the json representation of a jsonrpc method call, jsonrpc method response
* or single json value into the appropriate object (deserialize)
* @param {string} json_val
* @param {object} options not used (yet)
* @type false | jsonrpcresp | jsonrpcmsg | jsonrpcval
* @public
*
* @bug cannot tell a jsonrpc object from a reponse/request, if the object contains
*      the same members
**/
function jsonrpc_decode_json(json_val, options)
{

	//if (typeof(options) == 'object')
	//{
	//	src_encoding = options['src_encoding'] != undefined  ? options['src_encoding'] : xmlrpc_defencoding;
	//	dest_encoding = options['dest_encoding'] != undefined ? options['dest_encoding'] : xmlrpc_internalencoding;
	//}

	_xh = {};
	//_xh['isf'] = 0;
	//if (!json_parse(json_val, false, src_encoding, dest_encoding))
	if (!json_parse_native(json_val))
	{
		xmlrpc_error_log(_xh['isf_reason']);
		return false;
	}
	else
	{
		if (typeof(_xh['value']) == 'object' )
		{
			if (/*_xh['value'].length == 3 &&*/ _xh['value']['result'] !== undefined
				&& _xh['value']['error'] !== undefined && _xh['value']['id'] !== undefined)
			{
				// decoding a jsonrpc reponse. Check first for error case
				if (_xh['value']['error'] != null)
				{
					if (typeof(_xh['value']['error']) == 'object' && _xh['value']['error']['faultCode'] !== undefined
						&& _xh['value']['error']['faultString'] !== undefined)
					{
						if (_xh['value']['error']['faultCode'] == 0)
						{
							// FAULT returned, errno needs to reflect that
							_xh['value']['error']['faultCode'] = -1;
						}
					}
					// NB: what about jsonrpc servers that do NOT respect
					// the faultCode/faultString convention???
					// we force the error into a string. regardless of type...
					else //if (is_string(_xh['value']))
					{
						_xh['value'] = {'faultCode': -1, 'faultString': var_export(_xh['value']['error'])};
					}
					var r = new jsonrpcresp(0, _xh['value']['faultCode'], _xh['value']['faultString']);
				}
				else
				{
					var r = new jsonrpcresp(jsonrpc_encode(_xh['value']['result']));
				}
				r.id = _xh['value']['id'];
				return r;
			}
			else if (/*_xh['value'].length == 3 &&*/ _xh['value']['method'] !== undefined
				&& _xh['value']['params'] !== undefined && _xh['value']['id'] !== undefined)
			{
				var r = new jsonrpcmsg(_xh['value']['method'], null, _xh['value']['id']);
				for (var i = 0; i < _xh['value']['params'].length; i++)
					r.addParam(jsonrpc_encode(_xh['value']['params'][i]));
				return r;
			}
			//else
			//	return new jsonrpcval(_xh['value'], 'struct');
		}
		//else
		// parsing ok, but not a response / request: it must be a plain jsonrpcval
		return jsonrpc_encode(_xh['value']);
	}
}

/**
* Serialize a jsonrpcresp (or xmlrpcresp) as json.
* @private
*/
function serialize_jsonrpcresp (resp, id, charset_encoding)
{
		var result = '{\n"id": ' + (id == undefined ? 'null' : id) + ', ';
		if(resp.errno)
		{
			// let non-ASCII response messages be tolerated by clients
			// by encoding non ascii chars
			result += '"error": { "faultCode": ' + resp.errno + ', "faultString": "' + json_encode_entities(resp.errstr, null, charset_encoding) + '" }, "result": null';
		}
		else
		{
			if(typeof resp.val != 'object' || !(resp.val instanceof xmlrpcval))
			{
				if(typeof resp.val == 'string' && resp.valtyp == 'json')
				{
					result += '"error": null, "result": ' + resp.val;
				}
				else
				{
					/// @todo try to build something serializable?
					//die('cannot serialize jsonrpcresp objects whose content is native php values');
				}
			}
			else
			{
				result += '"error": null, "result": ' +
					serialize_jsonrpcval(resp.val, charset_encoding);
			}
		}
		result += '\n}';
		return result;
}

/**
* Serialize a jsonrpcval (or xmlrpcval) as json.
* @private
*/
function serialize_jsonrpcval (value, charset_encoding)
{
	var rs = '';
	switch(value.mytype)
	{
		case 1:
			rs += '"' + json_encode_entities(value.me, null, charset_encoding) + '"';
			break;
		case 4:
			if(isFinite(value.me))
			{
				rs += value.me.toFixed(); // as per Ecma-262, toFixed is better than toString...
			}
			else
			{
				rs += '0';
			}
			break;
		case 5:
			// add a .0 in case value is integer.
			// This helps us carrying around floats in js, and keep them separated from ints
			if(isFinite(value.me) && value.me !== null)
			{
				rs += value.me.toString();
				var num = new Number(value.me);
				if(num == parseInt(num))
				{
					rs += '.0';
				}
			}
			else
			{
				rs += '0';
			}
			break;
		case 6:
			rs += (value.me ? 'true' : 'false');
			break;
		case 7:
			rs += '"' + value.me + '"'; /// @todo add some date string validation ???
			break;
		case 8:
			// treat base 64 values as strings ???
			rs += '"' + base64_encode(value.me) + '"';
			break;
		case 9:
			rs += "null";
			break;
		case 2:
			// array
			rs += "[";
			len = (value.me.length);
			if(len)
			{
				for(var i = 0; i < len-1; ++i)
				{
					rs += serialize_jsonrpcval(value.me[i], charset_encoding);
					rs += ",";
				}
				rs += serialize_jsonrpcval(value.me[i], charset_encoding);
			}
			rs += "]";
			break;
		case 3:
			// struct
			//if($value->_php_class)
			//{
				/// @todo implement json-rpc extension for object serialization
				//$rs.='<struct php_class="' . value._php_class . "\">\n";
			//}
			//else
			//{
			//}
			for(var val in value.me)
			{
				rs += ',"' + json_encode_entities(val, null, charset_encoding) + '":';
				rs += serialize_jsonrpcval(value.me[val], charset_encoding);
			}
			rs = '{' + rs.slice(1) + '}';
			break;
	}
	return rs;
}
