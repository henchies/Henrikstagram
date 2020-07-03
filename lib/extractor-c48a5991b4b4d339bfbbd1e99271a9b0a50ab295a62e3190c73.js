var GtmHelper={pushGAEvent:function(action,label){if(typeof(label)==="undefined")
label='';if(typeof(dataLayer)!=="undefined"){dataLayer.push({event:'GAEvent',eventAction:action,eventLabel:label})}}};function extractAppleDepth(buffer){if(buffer[0].charCodeAt(0)==0xFF&&buffer[1].charCodeAt(0)==0xD8){}else{return false;}
var metadata=calculateJPEGMetadata(new Buffer(buffer,'binary'),true);var isApple=metadata.exifBlock&&(metadata.exifBlock.indexOf('Apple')!=-1);if(!isApple)
return false;var i=0;var startPosition=0;var lastPosition=0;var newFileChunkAvailable=false;var chunkNumber=0;do{startPosition=lastPosition;i=startPosition+2;while(buffer[i].charCodeAt(0)==0xFF){var chunkSize=(buffer[i+2].charCodeAt(0)<<8)+buffer[i+3].charCodeAt(0);i+=chunkSize+2;}
lastPosition=buffer.indexOf('\u00FF\u00D9',i);if(lastPosition>=0&&lastPosition<buffer.length-3&&buffer[lastPosition+2].charCodeAt(0)==0xFF&&buffer[lastPosition+3].charCodeAt(0)==0xD8)
newFileChunkAvailable=true;else
newFileChunkAvailable=false;lastPosition=lastPosition+2;chunkNumber++;}while(chunkNumber<2&&newFileChunkAvailable);if(chunkNumber!=2)
return false;var depthImage=buffer.slice(startPosition,lastPosition);if(metadata.width*4/metadata.height<3){alert("This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)");return true;}
var zip=new JSZip();zip.file("image.jpg",buffer,{binary:true});zip.file("image_depth.jpg",depthImage,{binary:true});zip.generateAsync({type:"blob"}).then(function(content){saveAs(content,"image.zip");switchProcessingMode(false);});return true;}
function extractSamsungLiveFocusPhoto(buffer){var i=0;if(buffer[i].charCodeAt(0)==0xFF&&buffer[i+1].charCodeAt(0)==0xD8){}else{return false;}
var dualShotExtraInfoIndex=buffer.indexOf('DualShot_Extra_Info',lastIndex+2);if(dualShotExtraInfoIndex==-1){return false;}
var firstFFFFIndex=buffer.indexOf('\u00ff\u00ff',dualShotExtraInfoIndex+2);if(firstFFFFIndex==-1){return false;}
var secondFFFFIndex=buffer.indexOf('\u00ff\u00ff',firstFFFFIndex+2);if(secondFFFFIndex==-1){return false;}
var _depthHeight=readUint16AtPosition(buffer,secondFFFFIndex+2);var _depthWidth=readUint16AtPosition(buffer,secondFFFFIndex+6);var imageData=null;var imageCount=0;var lastIndex=-2;var index=buffer.indexOf('DualShot_1'+'\u00ff\u00d8\u00ff');if(index!=-1){imageData=buffer.slice(index+'DualShot_1'.length,buffer.length);}else{imageData=buffer;}
if(!imageData){return false;}
var buf=new Buffer(imageData,'binary');var metadata=calculateJPEGMetadata(buf);var dualShotDepthMapIndex=buffer.lastIndexOf('\u00B1\u000A\u0013\u0000\u0000\u0000'+'DualShot_DepthMap_1');if(dualShotDepthMapIndex==-1){return false;}
var depthOffset=dualShotDepthMapIndex+6+'DualShot_DepthMap_1'.length;var depthWidth;var depthHeight;if(metadata.orientation<=4){depthWidth=_depthHeight;depthHeight=_depthWidth;}else{depthWidth=_depthWidth;depthHeight=_depthHeight;}
if(depthWidth*4/depthHeight<3){alert("This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)");return true;}
var depthOrientation=0;if(metadata.orientation==3)
depthOrientation=2;if(metadata.orientation==6)
depthOrientation=3;if(metadata.orientation==8)
depthOrientation=1;var depthImageBuffer=createDepthMapBufferFromRAW(buffer,depthOffset,depthWidth,depthHeight,depthOrientation);var rawImageData={data:depthImageBuffer,width:depthWidth,height:depthHeight};var jpegImageData=encodeJPEG(rawImageData,85);var zip=new JSZip();zip.file("image.jpg",imageData,{binary:true});zip.file("image_depth.jpg",jpegImageData.data.toString('binary'),{binary:true});zip.generateAsync({type:"blob"}).then(function(content){saveAs(content,"image.zip");switchProcessingMode(false);});return true;}
function extractHuaweiPortraitPhoto(buffer){var i=0;if(buffer[i].charCodeAt(0)==0xFF&&buffer[i+1].charCodeAt(0)==0xD8){}else{return false;}
var edofIndex=buffer.lastIndexOf('\u0065\u0064\u006F\u0066\u0000\u0000\u0000\u0000\u0001');if(edofIndex==-1)
return false;var imageData=null;var imageCount=0;var lastIndex=0;while((index=buffer.indexOf('\u00ff\u00d8\u00ff\u00e1',lastIndex+2))!=-1){imageCount++;if(imageCount==1||imageCount==2)
imageData=buffer.slice(lastIndex,index);lastIndex=index;}
imageCount++;if(imageCount==1||imageCount==2)
imageData=buffer.slice(lastIndex,index);if(!imageData){return false;}
var buf=new Buffer(imageData,'binary');var metadata=calculateJPEGMetadata(buf);var depthOrientation=buffer[edofIndex+11].charCodeAt(0)&0x03;var depthWidth=(buffer[edofIndex+21].charCodeAt(0)<<8)+buffer[edofIndex+20].charCodeAt(0);var depthHeight=(buffer[edofIndex+23].charCodeAt(0)<<8)+buffer[edofIndex+22].charCodeAt(0);if(depthOrientation==1||depthOrientation==3){var tmp=depthWidth;depthWidth=depthHeight;depthHeight=tmp;}
if(depthWidth*4/depthHeight<3){alert("This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)");return true;}
var depthOffset=edofIndex+72;var depthImageBuffer=createDepthMapBufferFromRAW(buffer,depthOffset,depthWidth,depthHeight,depthOrientation);var rawImageData={data:depthImageBuffer,width:depthWidth,height:depthHeight};var jpegImageData=encodeJPEG(rawImageData,85);var zip=new JSZip();zip.file("image.jpg",imageData,{binary:true});zip.file("image_depth.jpg",jpegImageData.data.toString('binary'),{binary:true});zip.generateAsync({type:"blob"}).then(function(content){saveAs(content,"image.zip");switchProcessingMode(false);});return true;}
function extractGooglePixelPortraitPhoto(buffer){var i=0;if(buffer[i].charCodeAt(0)==0xFF&&buffer[i+1].charCodeAt(0)==0xD8){}else{return false;}
var lastIndex=0;var xmpChunkBuffer="";while((i=buffer.indexOf('http://ns.adobe.com/xmp/extension/',lastIndex))!=-1){i-=2;let length=buffer[i].charCodeAt(0)*256+buffer[i+1].charCodeAt(0);xmpChunkBuffer=xmpChunkBuffer+buffer.slice(i+79-2,i+length);lastIndex=i+length;}
if(xmpChunkBuffer.length==0)
return false;var gdepthDataStartIndex=xmpChunkBuffer.indexOf('GDepth:Data="');var gdepthDataStopIndex=xmpChunkBuffer.indexOf('"/>',gdepthDataStartIndex);if(gdepthDataStopIndex==-1)
gdepthDataStopIndex=xmpChunkBuffer.indexOf('" />',gdepthDataStartIndex);if(gdepthDataStartIndex==-1||gdepthDataStopIndex==-1)
return false;var depthBase64StartIndex=gdepthDataStartIndex+'GDepth:Data="'.length;if((gdepthDataStopIndex-depthBase64StartIndex)%4!=0)
gdepthDataStopIndex--;var depthBase64=xmpChunkBuffer.slice(depthBase64StartIndex,gdepthDataStopIndex);if(!depthBase64||depthBase64.length==0)
return false;var metadata=calculateJPEGMetadata(new Buffer(buffer,'binary'));var depthData=base64ToByteArray(depthBase64);var jpegImageData;if(depthData[0]==0xFF&&depthData[1]==0xD8){var rawDepthData=decodeJPEG(depthData);var depthWidth=rawDepthData.width;var depthHeight=rawDepthData.height;var depthOrientation=metadata.orientation||0;if(depthOrientation>4){var tmp=depthWidth;depthWidth=depthHeight;depthHeight=tmp;}
if(depthWidth*4/depthHeight<3){alert("This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)");return true;}
var correctedDepthData=createDepthMapBufferFromRAWBuffer(rawDepthData.data,0,depthWidth,depthHeight,depthOrientation,4);var rawImageData={data:correctedDepthData,width:depthWidth,height:depthHeight};jpegImageData=encodeJPEG(rawImageData,85);}else{var depthWidth=(depthData[3]<<24)
+(depthData[2]<<16)
+(depthData[1]<<8)
+(depthData[0]);var depthHeight=(depthData[7]<<24)
+(depthData[6]<<16)
+(depthData[5]<<8)
+(depthData[4]);var depthOrientation=metadata.orientation||0;if(depthOrientation>4){var tmp=depthWidth;depthWidth=depthHeight;depthHeight=tmp;}
if(depthWidth*4/depthHeight<3){alert("This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)");return true;}
var correctedDepthData=createDepthMapBufferFromRAWBuffer(depthData,16,depthWidth,depthHeight,depthOrientation,1);var rawImageData={data:correctedDepthData,width:depthWidth,height:depthHeight};jpegImageData=encodeJPEG(rawImageData,85);}
var zip=new JSZip();zip.file("image.jpg",buffer,{binary:true});zip.file("image_depth.jpg",jpegImageData.data.toString('binary'),{binary:true});zip.generateAsync({type:"blob"}).then(function(content){saveAs(content,"image.zip");switchProcessingMode(false);});return true;}
function extractPMPDPortraitPhoto(buffer){if(buffer[0].charCodeAt(0)==0xFF&&buffer[1].charCodeAt(0)==0xD8){}else{return false;}
var pmpdMarker=buffer.lastIndexOf('\u0050\u004D\u0050\u0044\u0002\u0000\u0064\u0000\u0001\u0000\u0000\u0000');if(pmpdMarker==-1)
return false;var startSrcImageIndex=buffer.indexOf('\u00FF\u00D8\u00FF\u00E1',1);if(startSrcImageIndex==-1)
startSrcImageIndex=0;var stopSrcImageIndex=buffer.lastIndexOf('\u00FF\u00D9');var imageData=buffer.slice(startSrcImageIndex,stopSrcImageIndex+2);var depthWidth,depthHeight,offset,factor;var totalChunkSize=readUint16AtPosition(buffer,pmpdMarker+12);var depthChunkSize=readUint16AtPosition(buffer,pmpdMarker+16);var afterFillData=[];afterFillData[0]=readUint16AtPosition(buffer,pmpdMarker+1056);afterFillData[1]=readUint16AtPosition(buffer,pmpdMarker+1060);afterFillData[2]=readUint16AtPosition(buffer,pmpdMarker+1064);longVersionMarker=(0xFF<<24)+(0xFF<<16)+(0x00<<8)+0x01;if(afterFillData[0]==longVersionMarker){depthWidth=afterFillData[1];depthHeight=afterFillData[2];}else{depthWidth=afterFillData[0];depthHeight=afterFillData[1];}
factor=depthChunkSize-depthWidth*depthHeight;offset=pmpdMarker+1056+factor;var frameData=new Buffer(depthWidth*depthHeight*4);var i=depthWidth*(depthHeight-1);var j=0;var count=0;while(count*4<frameData.length){frameData[i*4+0]=buffer[offset+j].charCodeAt(0);frameData[i*4+1]=buffer[offset+j].charCodeAt(0);frameData[i*4+2]=buffer[offset+j].charCodeAt(0);frameData[i*4+3]=0xFF;i++;j++;count++;if(j==(1152-factor-128)||((j-(1152-factor-128))%(1152)==0&&j<(1152)*50))
j+=128;if(i%depthWidth==0)
i=i-(depthWidth*2);}
var metadata=calculateJPEGMetadata(new Buffer(imageData,'binary'));var depthOrientation=metadata.orientation||0;if(depthOrientation>4){var tmp=depthWidth;depthWidth=depthHeight;depthHeight=tmp;}
frameData=createDepthMapBufferFromRAWBuffer(frameData,0,depthWidth,depthHeight,depthOrientation,4);var rawImageData={data:frameData,width:depthWidth,height:depthHeight};var jpegImageData=encodeJPEG(rawImageData,85);var zip=new JSZip();zip.file("image.jpg",imageData,{binary:true});zip.file("image_depth.jpg",jpegImageData.data.toString('binary'),{binary:true});zip.generateAsync({type:"blob"}).then(function(content){saveAs(content,"image.zip");switchProcessingMode(false);});return true;}
function extractDepthBFDepth(buffer){if(buffer[0].charCodeAt(0)==0xFF&&buffer[1].charCodeAt(0)==0xD8){}else{return false;}
var depthBFIndex=buffer.indexOf('DEPTHBF');if(depthBFIndex==-1)
return false;var depthData="";while(depthBFIndex>=0){if(buffer[depthBFIndex-8].charCodeAt(0)==0xFF&&buffer[depthBFIndex-7].charCodeAt(0)==0xEF){var chunkSize=(buffer[depthBFIndex-6].charCodeAt(0)<<8)+buffer[depthBFIndex-5].charCodeAt(0);depthData=depthData+buffer.slice(depthBFIndex+8,depthBFIndex+chunkSize-6);}
depthBFIndex=buffer.indexOf('DEPTHBF',depthBFIndex+1);}
var depthBufferWidthIndex=buffer.indexOf('DepthBufferWidth="');var deepthBufferHeightIndex=buffer.indexOf('DepthBufferHeight="');if(depthBufferWidthIndex==-1||deepthBufferHeightIndex==-1)
return false;var depthBufferWidthStartIndex=depthBufferWidthIndex+'DepthBufferWidth="'.length;var depthBufferHeightStartIndex=deepthBufferHeightIndex+'DepthBufferHeight="'.length;var depthWidth=parseInt(buffer.slice(depthBufferWidthStartIndex,buffer.indexOf('"',depthBufferWidthStartIndex)));var depthHeight=parseInt(buffer.slice(depthBufferHeightStartIndex,buffer.indexOf('"',depthBufferHeightStartIndex)));var i=0;var frameData=new Buffer(depthWidth*depthHeight*4);while(i<depthWidth*depthHeight){color=depthData[i].charCodeAt(0);frameData[i*4+0]=color;frameData[i*4+1]=color;frameData[i*4+2]=color;frameData[i*4+3]=0xFF;i++;}
var rawImageData={data:frameData,width:depthWidth,height:depthHeight};var jpegImageData=encodeJPEG(rawImageData,85);var zip=new JSZip();zip.file("image.jpg",buffer,{binary:true});zip.file("image_depth.jpg",jpegImageData.data.toString('binary'),{binary:true});zip.generateAsync({type:"blob"}).then(function(content){saveAs(content,"image.zip");switchProcessingMode(false);});return true;}
function extractVivoAndNubiaDepth(buffer){if(buffer[0].charCodeAt(0)==0xFF&&buffer[1].charCodeAt(0)==0xD8){}else{return false;}
var metadata=calculateJPEGMetadata(new Buffer(buffer,'binary'),true);var isVivo=metadata.exifBlock&&(metadata.exifBlock.indexOf('vivo')!=-1);var isNubia=metadata.exifBlock&&(metadata.exifBlock.indexOf('nubia')!=-1);if(!isVivo&&!isNubia)
return false;var i=0;var startPosition=0;var lastPosition=0;var newFileChunkAvailable=false;do{startPosition=lastPosition;i=startPosition+2;while(buffer[i].charCodeAt(0)==0xFF){var chunkSize=(buffer[i+2].charCodeAt(0)<<8)+buffer[i+3].charCodeAt(0);i+=chunkSize+2;}
lastPosition=buffer.indexOf('\u00FF\u00D9',i);if(lastPosition>=0&&lastPosition<buffer.length-3&&buffer[lastPosition+2].charCodeAt(0)==0xFF&&buffer[lastPosition+3].charCodeAt(0)==0xD8)
newFileChunkAvailable=true;else
newFileChunkAvailable=false;lastPosition=lastPosition+2;}while(newFileChunkAvailable);if(lastPosition==-1+2||lastPosition>=buffer.length+3)
return false;var imageData=buffer.slice(startPosition,lastPosition);var depthWidth=readUint16AtPosition(buffer,lastPosition);var depthHeight=readUint16AtPosition(buffer,lastPosition+4);var val3=readUint16AtPosition(buffer,lastPosition+8);var offset;if((depthWidth!=0&&depthHeight!=0)&&(depthWidth==val3||depthHeight==val3)){}else if((depthWidth!=0&&depthHeight!=0)&&depthWidth*depthHeight*4==val3){offset=lastPosition+12}else{depthWidth=readUint16AtPosition(buffer,lastPosition+16);depthHeight=readUint16AtPosition(buffer,lastPosition+20);val3=readUint16AtPosition(buffer,lastPosition+24);if(depthWidth*depthHeight*4==val3)
offset=lastPosition+32;else
return false;}
var frameData;if(metadata.orientation>4){var tmp=depthWidth;depthWidth=depthHeight;depthHeight=tmp;}
if(depthWidth*depthHeight*4==val3){var color;var frameData=new Buffer(depthWidth*depthHeight);var i=0;while(i<frameData.length){color=buffer[offset+i*4+3].charCodeAt(0)<<24;color+=buffer[offset+i*4+2].charCodeAt(0)<<16;color=(color>>18)&0xFFF;if(color>2048)
color=0;color=color&0xFF;frameData[i]=255-color;i++;}
frameData=createDepthMapBufferFromRAWBuffer(frameData,0,depthWidth,depthHeight,metadata.orientation,1);}else{var depthOrientation=0;if(metadata.orientation==3)
depthOrientation=2;if(metadata.orientation==6)
depthOrientation=3;if(metadata.orientation==8)
depthOrientation=1;frameData=createDepthMapBufferFromRAW(buffer,lastPosition+(isNubia?16:36),depthWidth,depthHeight,depthOrientation);}
var rawImageData={data:frameData,width:depthWidth,height:depthHeight};var jpegImageData=encodeJPEG(rawImageData,85);var zip=new JSZip();zip.file("image.jpg",imageData,{binary:true});zip.file("image_depth.jpg",jpegImageData.data.toString('binary'),{binary:true});zip.generateAsync({type:"blob"}).then(function(content){saveAs(content,"image.zip");switchProcessingMode(false);});return true;}
function extractOPPODepth(buffer){if(buffer[0].charCodeAt(0)==0xFF&&buffer[1].charCodeAt(0)==0xD8){}else{return false;}
var metadata=calculateJPEGMetadata(new Buffer(buffer,'binary'),true);var isOPPO=metadata.exifBlock&&(metadata.exifBlock.indexOf('OPPO')!=-1);if(!isOPPO)
return false;var i=0;var startPosition=0;var lastPosition=0;var newFileChunkAvailable=false;do{startPosition=lastPosition;i=startPosition+2;while(buffer[i].charCodeAt(0)==0xFF){var chunkSize=(buffer[i+2].charCodeAt(0)<<8)+buffer[i+3].charCodeAt(0);i+=chunkSize+2;}
lastPosition=buffer.indexOf('\u00FF\u00D9',i);if(lastPosition>=0&&lastPosition<buffer.length-3&&buffer[lastPosition+2].charCodeAt(0)==0xFF&&buffer[lastPosition+3].charCodeAt(0)==0xD8)
newFileChunkAvailable=true;else
newFileChunkAvailable=false;lastPosition=lastPosition+2;}while(newFileChunkAvailable);if(lastPosition==-1+2||lastPosition>=buffer.length+3)
return false;var imageData=buffer.slice(startPosition,lastPosition);var depthWidth=readUint16AtPosition(buffer,lastPosition);var depthHeight=readUint16AtPosition(buffer,lastPosition+4);var val3=readUint16AtPosition(buffer,lastPosition+8);var offset;if((depthWidth!=0&&depthHeight!=0)&&(depthWidth==val3||depthHeight==val3)){}else if((depthWidth!=0&&depthHeight!=0)&&depthWidth*depthHeight*4==val3){offset=lastPosition+12}else{depthWidth=readUint16AtPosition(buffer,lastPosition+16);depthHeight=readUint16AtPosition(buffer,lastPosition+20);val3=readUint16AtPosition(buffer,lastPosition+24);if(depthWidth*depthHeight*4==val3)
offset=lastPosition+32;else
return false;}
var frameData;if(metadata.orientation>4){var tmp=depthWidth;depthWidth=depthHeight;depthHeight=tmp;}
if(depthWidth*depthHeight*4==val3){var color;var frameData=new Buffer(depthWidth*depthHeight);var i=0;while(i<frameData.length){color=buffer[offset+i*4+3].charCodeAt(0)<<24;color+=buffer[offset+i*4+2].charCodeAt(0)<<16;color=(color>>18)&0xFFF;if(color>2048)
color=0;color=color&0xFF;frameData[i]=255-color;i++;}
frameData=createDepthMapBufferFromRAWBuffer(frameData,0,depthWidth,depthHeight,metadata.orientation,1);}else{var depthOrientation=0;if(metadata.orientation==3)
depthOrientation=2;if(metadata.orientation==6)
depthOrientation=3;if(metadata.orientation==8)
depthOrientation=1;frameData=createDepthMapBufferFromRAW(buffer,lastPosition+(isNubia?16:36),depthWidth,depthHeight,depthOrientation);}
var rawImageData={data:frameData,width:depthWidth,height:depthHeight};var jpegImageData=encodeJPEG(rawImageData,85);var zip=new JSZip();zip.file("image.jpg",imageData,{binary:true});zip.file("image_depth.jpg",jpegImageData.data.toString('binary'),{binary:true});zip.generateAsync({type:"blob"}).then(function(content){saveAs(content,"image.zip");switchProcessingMode(false);});return true;}
function createDepthMapBufferFromRAWBuffer(buffer,offset,width,height,orientation,bitPerPixel){var outputBuffer=new Buffer(width*height*4);var i=0;var j=0;var color;for(i=0;i<height;i++){for(j=0;j<width;j++){switch(orientation){case 1:color=0xFF-buffer[(offset+i*width+j)*bitPerPixel];break;case 8:color=0xFF-buffer[(offset+(j*height)+(height-i-1))*bitPerPixel];break;case 3:color=0xFF-buffer[(offset+(width*height)-1-((i*width)+j))*bitPerPixel];break;case 6:color=0xFF-buffer[(offset+(width-j-1)*height+i)*bitPerPixel];break;}
outputBuffer[(i*width+j)*4+0]=color;outputBuffer[(i*width+j)*4+1]=color;outputBuffer[(i*width+j)*4+2]=color;outputBuffer[(i*width+j)*4+3]=0xFF;}}
return outputBuffer;}
function createDepthMapBufferFromRAW(buffer,offset,width,height,orientation){var outputBuffer=new Buffer(width*height*4);var i=0;var j=0;var color;for(i=0;i<height;i++){for(j=0;j<width;j++){switch(orientation){case 1:color=0xFF-buffer[offset+(j*height)+(height-i-1)].charCodeAt(0);break;case 2:color=0xFF-buffer[offset+(width*height)-1-((i*width)+j)].charCodeAt(0);break;case 3:color=0xFF-buffer[offset+(width-j-1)*height+i].charCodeAt(0);break;case 0:default:color=0xFF-buffer[offset+i*width+j].charCodeAt(0);break;}
outputBuffer[(i*width+j)*4+0]=color;outputBuffer[(i*width+j)*4+1]=color;outputBuffer[(i*width+j)*4+2]=color;outputBuffer[(i*width+j)*4+3]=0xFF;}}
return outputBuffer;}
function readUint16AtPosition(buffer,position){return(buffer.charCodeAt(position+3)<<24)+(buffer.charCodeAt(position+2)<<16)+(buffer.charCodeAt(position+1)<<8)+buffer.charCodeAt(position);}
function initExtractor(){if(window.File&&window.FileReader&&window.FileList&&window.Blob){}else{alert('The File APIs are not fully supported in this browser.');return;}}
function handleFileSelect(evt){GtmHelper.pushGAEvent('select-file')
var files=evt.target.files;if(files.length==0)
return;var output=[];for(var i=0,f;f=files[i];i++){if(!f.type.match('image.*'))
continue;switchProcessingMode(true);setTimeout((function(){var reader=new FileReader();reader.onload=function(theFile){var buffer=reader.result;var result=false;if(!result)
result=extractAppleDepth(buffer);if(!result)
result=extractSamsungLiveFocusPhoto(buffer);if(!result)
result=extractHuaweiPortraitPhoto(buffer);if(!result)
result=extractDepthBFDepth(buffer);if(!result)
result=extractPMPDPortraitPhoto(buffer);if(!result)
result=extractVivoAndNubiaDepth(buffer);if(!result)
result=extractGooglePixelPortraitPhoto(buffer);if(!result){GtmHelper.pushGAEvent('extraction-failed')
alert('Depth map could not be extracted. Please recheck that photo was taken in the depth-capable mode listed below in this page.');}else{GtmHelper.pushGAEvent('extraction-success')}
switchProcessingMode(false);document.getElementById('file-form').reset();};reader.readAsBinaryString(f);})(f),100);}}
function switchProcessingMode(processing){document.getElementById("input_box").style.display=processing?'block':'none';document.getElementById("processing_box").style.display=processing?'none':'inline-block';document.getElementById("input_box").style.display=processing?'none':'block';document.getElementById("processing_box").style.display=processing?'inline-block':'none';}
document.getElementById('file').addEventListener('change',handleFileSelect,false);