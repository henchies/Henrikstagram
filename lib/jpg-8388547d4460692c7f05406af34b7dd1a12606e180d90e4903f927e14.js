'use strict';function readUInt(buffer,bits,offset,isBigEndian){offset=offset||0;var endian=isBigEndian?'BE':'LE';var method=buffer['readUInt'+bits+endian];return method.call(buffer,offset);}
function isJPG(buffer){var SOIMarker=buffer.toString('hex',0,2);return('ffd8'===SOIMarker);}
function isEXIF(buffer){var exifMarker=buffer.toString('hex',2,6);return(exifMarker==='45786966');}
function extractSize(buffer,i){return{'height':buffer.readUInt16BE(i),'width':buffer.readUInt16BE(i+2)};}
var APP1_DATA_SIZE_BYTES=2;var EXIF_HEADER_BYTES=6;var TIFF_BYTE_ALIGN_BYTES=2;var BIG_ENDIAN_BYTE_ALIGN='4d4d';var IDF_ENTRY_BYTES=12;var NUM_DIRECTORY_ENTRIES_BYTES=2;function extractExif(buffer,i,needExifBlock){var exifBlock=buffer.slice(APP1_DATA_SIZE_BYTES,i);var byteAlign=exifBlock.toString('hex',EXIF_HEADER_BYTES,EXIF_HEADER_BYTES+TIFF_BYTE_ALIGN_BYTES);var bigEndian=byteAlign===BIG_ENDIAN_BYTE_ALIGN;var idfOffset=8;var offset=EXIF_HEADER_BYTES+idfOffset;var idfDirectoryEntries=readUInt(exifBlock,16,offset,bigEndian);var start;var end;var orientation=1;for(var directoryEntryNumber=0;directoryEntryNumber<idfDirectoryEntries;directoryEntryNumber++){start=offset+NUM_DIRECTORY_ENTRIES_BYTES+(directoryEntryNumber*IDF_ENTRY_BYTES);end=start+IDF_ENTRY_BYTES;var block=exifBlock.slice(start,end);var tagNumber=readUInt(block,16,0,bigEndian);if(tagNumber===274){var dataFormat=readUInt(block,16,2,bigEndian);if(dataFormat!==3){return;}
var numberOfComponents=readUInt(block,32,4,bigEndian);if(numberOfComponents!==1){return;}
orientation=readUInt(block,16,8,bigEndian);}}
return{orientation:orientation,exifBlock:needExifBlock?exifBlock.toString():''}}
function validateBuffer(buffer,i){if(i>buffer.length){throw new TypeError('Corrupt JPG, exceeded buffer limits');}
if(buffer[i]!==0xFF){throw new TypeError('Invalid JPG, marker table corrupted');}}
function calculateJPEGMetadata(buffer,needExifBlock){if(typeof needExifBlock==='undefined')
needExifBlock=false;buffer=buffer.slice(4);var orientation;var exifBlock='';var i,next;while(buffer.length){i=buffer.readUInt16BE(0);if(isEXIF(buffer)){var exif=extractExif(buffer,i,needExifBlock);orientation=exif.orientation;exifBlock=exif.exifBlock;}
validateBuffer(buffer,i);next=buffer[i+1];if(next===0xC0||next===0xC1||next===0xC2){var size=extractSize(buffer,i+5);if(!orientation){size.orientation=1;size.exifBlock=exifBlock;return size;}
return{width:size.width,height:size.height,orientation:orientation,exifBlock:exifBlock};}
buffer=buffer.slice(i+2);}
throw new TypeError('Invalid JPG, no size found');};