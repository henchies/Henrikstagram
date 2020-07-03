var assert={};assert.ok=function(value,message){if(!value)throw new Error(message);}
Buffer.poolSize=8192;function stringtrim(str){if(str.trim)return str.trim();return str.replace(/^\s+|\s+$/g,'');}
function Buffer(subject,encoding,offset){if(!assert)assert=require('assert');if(!(this instanceof Buffer)){return new Buffer(subject,encoding,offset);}
this.parent=this;this.offset=0;if(encoding=="base64"&&typeof subject=="string"){subject=stringtrim(subject);while(subject.length%4!=0){subject=subject+"=";}}
var type;if(typeof offset==='number'){this.length=coerce(encoding);for(var i=0;i<this.length;i++){this[i]=subject.get(i+offset);}}else{switch(type=typeof subject){case 'number':this.length=coerce(subject);break;case 'string':this.length=Buffer.byteLength(subject,encoding);break;case 'object':this.length=coerce(subject.length);break;default:throw new TypeError('First argument needs to be a number, '+
'array or string.');}
if(isArrayIsh(subject)){for(var i=0;i<this.length;i++){if(subject instanceof Buffer){this[i]=subject.readUInt8(i);}
else{this[i]=((subject[i]%256)+256)%256;}}}else if(type=='string'){this.length=this.write(subject,0,encoding);}else if(type==='number'){for(var i=0;i<this.length;i++){this[i]=0;}}}}
Buffer.prototype.get=function get(i){if(i<0||i>=this.length)throw new Error('oob');return this[i];};Buffer.prototype.set=function set(i,v){if(i<0||i>=this.length)throw new Error('oob');return this[i]=v;};Buffer.byteLength=function(str,encoding){switch(encoding||"utf8"){case 'hex':return str.length/2;case 'utf8':case 'utf-8':return utf8ToBytes(str).length;case 'ascii':case 'binary':return str.length;case 'base64':return base64ToBytes(str).length;default:throw new Error('Unknown encoding');}};Buffer.prototype.utf8Write=function(string,offset,length){var bytes,pos;return Buffer._charsWritten=blitBuffer(utf8ToBytes(string),this,offset,length);};Buffer.prototype.asciiWrite=function(string,offset,length){var bytes,pos;return Buffer._charsWritten=blitBuffer(asciiToBytes(string),this,offset,length);};Buffer.prototype.binaryWrite=Buffer.prototype.asciiWrite;Buffer.prototype.base64Write=function(string,offset,length){var bytes,pos;return Buffer._charsWritten=blitBuffer(base64ToBytes(string),this,offset,length);};Buffer.prototype.base64Slice=function(start,end){var bytes=Array.prototype.slice.apply(this,arguments)
return require("base64-js").fromByteArray(bytes);};Buffer.prototype.utf8Slice=function(){var bytes=Array.prototype.slice.apply(this,arguments);var res="";var tmp="";var i=0;while(i<bytes.length){if(bytes[i]<=0x7F){res+=decodeUtf8Char(tmp)+String.fromCharCode(bytes[i]);tmp="";}else
tmp+="%"+bytes[i].toString(16);i++;}
return res+decodeUtf8Char(tmp);}
Buffer.prototype.asciiSlice=function(){var bytes=Array.prototype.slice.apply(this,arguments);var ret="";for(var i=0;i<bytes.length;i++)
ret+=String.fromCharCode(bytes[i]);return ret;}
Buffer.prototype.binarySlice=Buffer.prototype.asciiSlice;Buffer.prototype.inspect=function(){var out=[],len=this.length;for(var i=0;i<len;i++){out[i]=toHex(this[i]);if(i==exports.INSPECT_MAX_BYTES){out[i+1]='...';break;}}
return '<Buffer '+out.join(' ')+'>';};Buffer.prototype.hexSlice=function(start,end){var len=this.length;if(!start||start<0)start=0;if(!end||end<0||end>len)end=len;var out='';for(var i=start;i<end;i++){out+=toHex(this[i]);}
return out;};Buffer.prototype.toString=function(encoding,start,end){encoding=String(encoding||'utf8').toLowerCase();start=+start||0;if(typeof end=='undefined')end=this.length;if(+end==start){return '';}
switch(encoding){case 'hex':return this.hexSlice(start,end);case 'utf8':case 'utf-8':return this.utf8Slice(start,end);case 'ascii':return this.asciiSlice(start,end);case 'binary':return this.binarySlice(start,end);case 'base64':return this.base64Slice(start,end);case 'ucs2':case 'ucs-2':return this.ucs2Slice(start,end);default:throw new Error('Unknown encoding');}};Buffer.prototype.hexWrite=function(string,offset,length){offset=+offset||0;var remaining=this.length-offset;if(!length){length=remaining;}else{length=+length;if(length>remaining){length=remaining;}}
var strLen=string.length;if(strLen%2){throw new Error('Invalid hex string');}
if(length>strLen/2){length=strLen/2;}
for(var i=0;i<length;i++){var b=parseInt(string.substr(i*2,2),16);if(isNaN(b))throw new Error('Invalid hex string');this[offset+i]=b;}
Buffer._charsWritten=i*2;return i;};Buffer.prototype.write=function(string,offset,length,encoding){if(isFinite(offset)){if(!isFinite(length)){encoding=length;length=undefined;}}else{var swap=encoding;encoding=offset;offset=length;length=swap;}
offset=+offset||0;var remaining=this.length-offset;if(!length){length=remaining;}else{length=+length;if(length>remaining){length=remaining;}}
encoding=String(encoding||'utf8').toLowerCase();switch(encoding){case 'hex':return this.hexWrite(string,offset,length);case 'utf8':case 'utf-8':return this.utf8Write(string,offset,length);case 'ascii':return this.asciiWrite(string,offset,length);case 'binary':return this.binaryWrite(string,offset,length);case 'base64':return this.base64Write(string,offset,length);case 'ucs2':case 'ucs-2':return this.ucs2Write(string,offset,length);default:throw new Error('Unknown encoding');}};function clamp(index,len,defaultValue){if(typeof index!=='number')return defaultValue;index=~~index;if(index>=len)return len;if(index>=0)return index;index+=len;if(index>=0)return index;return 0;}
Buffer.prototype.slice=function(start,end){var len=this.length;start=clamp(start,len,0);end=clamp(end,len,len);return new Buffer(this,end-start,+start);};Buffer.prototype.copy=function(target,target_start,start,end){var source=this;start||(start=0);if(end===undefined||isNaN(end)){end=this.length;}
target_start||(target_start=0);if(end<start)throw new Error('sourceEnd < sourceStart');if(end===start)return 0;if(target.length==0||source.length==0)return 0;if(target_start<0||target_start>=target.length){throw new Error('targetStart out of bounds');}
if(start<0||start>=source.length){throw new Error('sourceStart out of bounds');}
if(end<0||end>source.length){throw new Error('sourceEnd out of bounds');}
if(end>this.length){end=this.length;}
if(target.length-target_start<end-start){end=target.length-target_start+start;}
var temp=[];for(var i=start;i<end;i++){assert.ok(typeof this[i]!=='undefined',"copying undefined buffer bytes!");temp.push(this[i]);}
for(var i=target_start;i<target_start+temp.length;i++){target[i]=temp[i-target_start];}};Buffer.prototype.fill=function fill(value,start,end){value||(value=0);start||(start=0);end||(end=this.length);if(typeof value==='string'){value=value.charCodeAt(0);}
if(!(typeof value==='number')||isNaN(value)){throw new Error('value is not a number');}
if(end<start)throw new Error('end < start');if(end===start)return 0;if(this.length==0)return 0;if(start<0||start>=this.length){throw new Error('start out of bounds');}
if(end<0||end>this.length){throw new Error('end out of bounds');}
for(var i=start;i<end;i++){this[i]=value;}}
Buffer.isBuffer=function isBuffer(b){return b instanceof Buffer;};Buffer.concat=function(list,totalLength){if(!isArray(list)){throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");}
if(list.length===0){return new Buffer(0);}else if(list.length===1){return list[0];}
if(typeof totalLength!=='number'){totalLength=0;for(var i=0;i<list.length;i++){var buf=list[i];totalLength+=buf.length;}}
var buffer=new Buffer(totalLength);var pos=0;for(var i=0;i<list.length;i++){var buf=list[i];buf.copy(buffer,pos);pos+=buf.length;}
return buffer;};Buffer.isEncoding=function(encoding){switch((encoding+'').toLowerCase()){case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':return true;default:return false;}};function coerce(length){length=~~Math.ceil(+length);return length<0?0:length;}
function isArray(subject){return(Array.isArray||function(subject){return{}.toString.apply(subject)=='[object Array]'})
(subject)}
function isArrayIsh(subject){return isArray(subject)||Buffer.isBuffer(subject)||subject&&typeof subject==='object'&&typeof subject.length==='number';}
function toHex(n){if(n<16)return '0'+n.toString(16);return n.toString(16);}
function utf8ToBytes(str){var byteArray=[];for(var i=0;i<str.length;i++)
if(str.charCodeAt(i)<=0x7F)
byteArray.push(str.charCodeAt(i));else{var h=encodeURIComponent(str.charAt(i)).substr(1).split('%');for(var j=0;j<h.length;j++)
byteArray.push(parseInt(h[j],16));}
return byteArray;}
function asciiToBytes(str){var byteArray=[]
for(var i=0;i<str.length;i++)
byteArray.push(str.charCodeAt(i)&0xFF);return byteArray;}
function base64ToBytes(str){return require("base64-js").toByteArray(str);}
function blitBuffer(src,dst,offset,length){var pos,i=0;while(i<length){if((i+offset>=dst.length)||(i>=src.length))
break;dst[i+offset]=src[i];i++;}
return i;}
function decodeUtf8Char(str){try{return decodeURIComponent(str);}catch(err){return String.fromCharCode(0xFFFD);}}
Buffer.prototype.readUInt8=function(offset,noAssert){var buffer=this;if(!noAssert){assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset<buffer.length,'Trying to read beyond buffer length');}
if(offset>=buffer.length)return;return buffer[offset];};function readUInt16(buffer,offset,isBigEndian,noAssert){var val=0;if(!noAssert){assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+1<buffer.length,'Trying to read beyond buffer length');}
if(offset>=buffer.length)return 0;if(isBigEndian){val=buffer[offset]<<8;if(offset+1<buffer.length){val|=buffer[offset+1];}}else{val=buffer[offset];if(offset+1<buffer.length){val|=buffer[offset+1]<<8;}}
return val;}
Buffer.prototype.readUInt16LE=function(offset,noAssert){return readUInt16(this,offset,false,noAssert);};Buffer.prototype.readUInt16BE=function(offset,noAssert){return readUInt16(this,offset,true,noAssert);};function readUInt32(buffer,offset,isBigEndian,noAssert){var val=0;if(!noAssert){assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+3<buffer.length,'Trying to read beyond buffer length');}
if(offset>=buffer.length)return 0;if(isBigEndian){if(offset+1<buffer.length)
val=buffer[offset+1]<<16;if(offset+2<buffer.length)
val|=buffer[offset+2]<<8;if(offset+3<buffer.length)
val|=buffer[offset+3];val=val+(buffer[offset]<<24>>>0);}else{if(offset+2<buffer.length)
val=buffer[offset+2]<<16;if(offset+1<buffer.length)
val|=buffer[offset+1]<<8;val|=buffer[offset];if(offset+3<buffer.length)
val=val+(buffer[offset+3]<<24>>>0);}
return val;}
Buffer.prototype.readUInt32LE=function(offset,noAssert){return readUInt32(this,offset,false,noAssert);};Buffer.prototype.readUInt32BE=function(offset,noAssert){return readUInt32(this,offset,true,noAssert);};Buffer.prototype.readInt8=function(offset,noAssert){var buffer=this;var neg;if(!noAssert){assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset<buffer.length,'Trying to read beyond buffer length');}
if(offset>=buffer.length)return;neg=buffer[offset]&0x80;if(!neg){return(buffer[offset]);}
return((0xff-buffer[offset]+1)*-1);};function readInt16(buffer,offset,isBigEndian,noAssert){var neg,val;if(!noAssert){assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+1<buffer.length,'Trying to read beyond buffer length');}
val=readUInt16(buffer,offset,isBigEndian,noAssert);neg=val&0x8000;if(!neg){return val;}
return(0xffff-val+1)*-1;}
Buffer.prototype.readInt16LE=function(offset,noAssert){return readInt16(this,offset,false,noAssert);};Buffer.prototype.readInt16BE=function(offset,noAssert){return readInt16(this,offset,true,noAssert);};function readInt32(buffer,offset,isBigEndian,noAssert){var neg,val;if(!noAssert){assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+3<buffer.length,'Trying to read beyond buffer length');}
val=readUInt32(buffer,offset,isBigEndian,noAssert);neg=val&0x80000000;if(!neg){return(val);}
return(0xffffffff-val+1)*-1;}
Buffer.prototype.readInt32LE=function(offset,noAssert){return readInt32(this,offset,false,noAssert);};Buffer.prototype.readInt32BE=function(offset,noAssert){return readInt32(this,offset,true,noAssert);};function readFloat(buffer,offset,isBigEndian,noAssert){if(!noAssert){assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset+3<buffer.length,'Trying to read beyond buffer length');}
return require('./buffer_ieee754').readIEEE754(buffer,offset,isBigEndian,23,4);}
Buffer.prototype.readFloatLE=function(offset,noAssert){return readFloat(this,offset,false,noAssert);};Buffer.prototype.readFloatBE=function(offset,noAssert){return readFloat(this,offset,true,noAssert);};function readDouble(buffer,offset,isBigEndian,noAssert){if(!noAssert){assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset+7<buffer.length,'Trying to read beyond buffer length');}
return require('./buffer_ieee754').readIEEE754(buffer,offset,isBigEndian,52,8);}
Buffer.prototype.readDoubleLE=function(offset,noAssert){return readDouble(this,offset,false,noAssert);};Buffer.prototype.readDoubleBE=function(offset,noAssert){return readDouble(this,offset,true,noAssert);};function verifuint(value,max){assert.ok(typeof(value)=='number','cannot write a non-number as a number');assert.ok(value>=0,'specified a negative value for writing an unsigned value');assert.ok(value<=max,'value is larger than maximum value for type');assert.ok(Math.floor(value)===value,'value has a fractional component');}
Buffer.prototype.writeUInt8=function(value,offset,noAssert){var buffer=this;if(!noAssert){assert.ok(value!==undefined&&value!==null,'missing value');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset<buffer.length,'trying to write beyond buffer length');verifuint(value,0xff);}
if(offset<buffer.length){buffer[offset]=value;}};function writeUInt16(buffer,value,offset,isBigEndian,noAssert){if(!noAssert){assert.ok(value!==undefined&&value!==null,'missing value');assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+1<buffer.length,'trying to write beyond buffer length');verifuint(value,0xffff);}
for(var i=0;i<Math.min(buffer.length-offset,2);i++){buffer[offset+i]=(value&(0xff<<(8*(isBigEndian?1-i:i))))>>>(isBigEndian?1-i:i)*8;}}
Buffer.prototype.writeUInt16LE=function(value,offset,noAssert){writeUInt16(this,value,offset,false,noAssert);};Buffer.prototype.writeUInt16BE=function(value,offset,noAssert){writeUInt16(this,value,offset,true,noAssert);};function writeUInt32(buffer,value,offset,isBigEndian,noAssert){if(!noAssert){assert.ok(value!==undefined&&value!==null,'missing value');assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+3<buffer.length,'trying to write beyond buffer length');verifuint(value,0xffffffff);}
for(var i=0;i<Math.min(buffer.length-offset,4);i++){buffer[offset+i]=(value>>>(isBigEndian?3-i:i)*8)&0xff;}}
Buffer.prototype.writeUInt32LE=function(value,offset,noAssert){writeUInt32(this,value,offset,false,noAssert);};Buffer.prototype.writeUInt32BE=function(value,offset,noAssert){writeUInt32(this,value,offset,true,noAssert);};function verifsint(value,max,min){assert.ok(typeof(value)=='number','cannot write a non-number as a number');assert.ok(value<=max,'value larger than maximum allowed value');assert.ok(value>=min,'value smaller than minimum allowed value');assert.ok(Math.floor(value)===value,'value has a fractional component');}
function verifIEEE754(value,max,min){assert.ok(typeof(value)=='number','cannot write a non-number as a number');assert.ok(value<=max,'value larger than maximum allowed value');assert.ok(value>=min,'value smaller than minimum allowed value');}
Buffer.prototype.writeInt8=function(value,offset,noAssert){var buffer=this;if(!noAssert){assert.ok(value!==undefined&&value!==null,'missing value');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset<buffer.length,'Trying to write beyond buffer length');verifsint(value,0x7f,-0x80);}
if(value>=0){buffer.writeUInt8(value,offset,noAssert);}else{buffer.writeUInt8(0xff+value+1,offset,noAssert);}};function writeInt16(buffer,value,offset,isBigEndian,noAssert){if(!noAssert){assert.ok(value!==undefined&&value!==null,'missing value');assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+1<buffer.length,'Trying to write beyond buffer length');verifsint(value,0x7fff,-0x8000);}
if(value>=0){writeUInt16(buffer,value,offset,isBigEndian,noAssert);}else{writeUInt16(buffer,0xffff+value+1,offset,isBigEndian,noAssert);}}
Buffer.prototype.writeInt16LE=function(value,offset,noAssert){writeInt16(this,value,offset,false,noAssert);};Buffer.prototype.writeInt16BE=function(value,offset,noAssert){writeInt16(this,value,offset,true,noAssert);};function writeInt32(buffer,value,offset,isBigEndian,noAssert){if(!noAssert){assert.ok(value!==undefined&&value!==null,'missing value');assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+3<buffer.length,'Trying to write beyond buffer length');verifsint(value,0x7fffffff,-0x80000000);}
if(value>=0){writeUInt32(buffer,value,offset,isBigEndian,noAssert);}else{writeUInt32(buffer,0xffffffff+value+1,offset,isBigEndian,noAssert);}}
Buffer.prototype.writeInt32LE=function(value,offset,noAssert){writeInt32(this,value,offset,false,noAssert);};Buffer.prototype.writeInt32BE=function(value,offset,noAssert){writeInt32(this,value,offset,true,noAssert);};function writeFloat(buffer,value,offset,isBigEndian,noAssert){if(!noAssert){assert.ok(value!==undefined&&value!==null,'missing value');assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+3<buffer.length,'Trying to write beyond buffer length');verifIEEE754(value,3.4028234663852886e+38,-3.4028234663852886e+38);}
require('./buffer_ieee754').writeIEEE754(buffer,value,offset,isBigEndian,23,4);}
Buffer.prototype.writeFloatLE=function(value,offset,noAssert){writeFloat(this,value,offset,false,noAssert);};Buffer.prototype.writeFloatBE=function(value,offset,noAssert){writeFloat(this,value,offset,true,noAssert);};function writeDouble(buffer,value,offset,isBigEndian,noAssert){if(!noAssert){assert.ok(value!==undefined&&value!==null,'missing value');assert.ok(typeof(isBigEndian)==='boolean','missing or invalid endian');assert.ok(offset!==undefined&&offset!==null,'missing offset');assert.ok(offset+7<buffer.length,'Trying to write beyond buffer length');verifIEEE754(value,1.7976931348623157E+308,-1.7976931348623157E+308);}
require('./buffer_ieee754').writeIEEE754(buffer,value,offset,isBigEndian,52,8);}
Buffer.prototype.writeDoubleLE=function(value,offset,noAssert){writeDouble(this,value,offset,false,noAssert);};Buffer.prototype.writeDoubleBE=function(value,offset,noAssert){writeDouble(this,value,offset,true,noAssert);};