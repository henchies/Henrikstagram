const GtmHelper = {
  pushGAEvent(action, label) {
    if (typeof label === 'undefined') label = '';
    if (typeof dataLayer !== 'undefined') {
      dataLayer.push({
        event: 'GAEvent',
        eventAction: action,
        eventLabel: label,
      });
    }
  },
};

function extractAppleDepth(buffer) {
  if (buffer[0].charCodeAt(0) == 0xff && buffer[1].charCodeAt(0) == 0xd8) {
  } else {
    return false;
  }
  const metadata = calculateJPEGMetadata(new Buffer(buffer, 'binary'), true);
  const isApple = metadata.exifBlock && metadata.exifBlock.includes('Apple');
  if (!isApple) return false;
  let i = 0;
  let startPosition = 0;
  let lastPosition = 0;
  let newFileChunkAvailable = false;
  let chunkNumber = 0;
  do {
    startPosition = lastPosition;
    i = startPosition + 2;
    while (buffer[i].charCodeAt(0) == 0xff) {
      const chunkSize =
        (buffer[i + 2].charCodeAt(0) << 8) + buffer[i + 3].charCodeAt(0);
      i += chunkSize + 2;
    }
    lastPosition = buffer.indexOf('\u00FF\u00D9', i);
    if (
      lastPosition >= 0 &&
      lastPosition < buffer.length - 3 &&
      buffer[lastPosition + 2].charCodeAt(0) == 0xff &&
      buffer[lastPosition + 3].charCodeAt(0) == 0xd8
    )
      newFileChunkAvailable = true;
    else newFileChunkAvailable = false;
    lastPosition = lastPosition + 2;
    chunkNumber++;
  } while (chunkNumber < 2 && newFileChunkAvailable);
  if (chunkNumber != 2) return false;
  const depthImage = buffer.slice(startPosition, lastPosition);
  if ((metadata.width * 4) / metadata.height < 3) {
    alert(
      'This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)'
    );
    return true;
  }
  const zip = new JSZip();
  zip.file('image.jpg', buffer, { binary: true });
  zip.file('image_depth.jpg', depthImage, { binary: true });
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'image.zip');
    switchProcessingMode(false);
  });
  return true;
}

function extractSamsungLiveFocusPhoto(buffer) {
  const i = 0;
  if (buffer[i].charCodeAt(0) == 0xff && buffer[i + 1].charCodeAt(0) == 0xd8) {
  } else {
    return false;
  }
  const dualShotExtraInfoIndex = buffer.indexOf(
    'DualShot_Extra_Info',
    lastIndex + 2
  );
  if (dualShotExtraInfoIndex == -1) {
    return false;
  }
  const firstFFFFIndex = buffer.indexOf(
    '\u00ff\u00ff',
    dualShotExtraInfoIndex + 2
  );
  if (firstFFFFIndex == -1) {
    return false;
  }
  const secondFFFFIndex = buffer.indexOf('\u00ff\u00ff', firstFFFFIndex + 2);
  if (secondFFFFIndex == -1) {
    return false;
  }
  const _depthHeight = readUint16AtPosition(buffer, secondFFFFIndex + 2);
  const _depthWidth = readUint16AtPosition(buffer, secondFFFFIndex + 6);
  let imageData = null;
  const imageCount = 0;
  var lastIndex = -2;
  const index = buffer.indexOf('DualShot_1' + '\u00ff\u00d8\u00ff');
  if (index != -1) {
    imageData = buffer.slice(index + 'DualShot_1'.length, buffer.length);
  } else {
    imageData = buffer;
  }
  if (!imageData) {
    return false;
  }
  const buf = new Buffer(imageData, 'binary');
  const metadata = calculateJPEGMetadata(buf);
  const dualShotDepthMapIndex = buffer.lastIndexOf(
    '\u00B1\u000A\u0013\u0000\u0000\u0000' + 'DualShot_DepthMap_1'
  );
  if (dualShotDepthMapIndex == -1) {
    return false;
  }
  const depthOffset = dualShotDepthMapIndex + 6 + 'DualShot_DepthMap_1'.length;
  let depthWidth;
  let depthHeight;
  if (metadata.orientation <= 4) {
    depthWidth = _depthHeight;
    depthHeight = _depthWidth;
  } else {
    depthWidth = _depthWidth;
    depthHeight = _depthHeight;
  }
  if ((depthWidth * 4) / depthHeight < 3) {
    alert(
      'This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)'
    );
    return true;
  }
  let depthOrientation = 0;
  if (metadata.orientation == 3) depthOrientation = 2;
  if (metadata.orientation == 6) depthOrientation = 3;
  if (metadata.orientation == 8) depthOrientation = 1;
  const depthImageBuffer = createDepthMapBufferFromRAW(
    buffer,
    depthOffset,
    depthWidth,
    depthHeight,
    depthOrientation
  );
  const rawImageData = {
    data: depthImageBuffer,
    width: depthWidth,
    height: depthHeight,
  };
  const jpegImageData = encodeJPEG(rawImageData, 85);
  const zip = new JSZip();
  zip.file('image.jpg', imageData, { binary: true });
  zip.file('image_depth.jpg', jpegImageData.data.toString('binary'), {
    binary: true,
  });
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'image.zip');
    switchProcessingMode(false);
  });
  return true;
}

function extractHuaweiPortraitPhoto(buffer) {
  const i = 0;
  if (buffer[i].charCodeAt(0) == 0xff && buffer[i + 1].charCodeAt(0) == 0xd8) {
  } else {
    return false;
  }
  const edofIndex = buffer.lastIndexOf(
    '\u0065\u0064\u006F\u0066\u0000\u0000\u0000\u0000\u0001'
  );
  if (edofIndex == -1) return false;
  let imageData = null;
  let imageCount = 0;
  let lastIndex = 0;
  while (
    (index = buffer.indexOf('\u00ff\u00d8\u00ff\u00e1', lastIndex + 2)) != -1
  ) {
    imageCount++;
    if (imageCount == 1 || imageCount == 2)
      imageData = buffer.slice(lastIndex, index);
    lastIndex = index;
  }
  imageCount++;
  if (imageCount == 1 || imageCount == 2)
    imageData = buffer.slice(lastIndex, index);
  if (!imageData) {
    return false;
  }
  const buf = new Buffer(imageData, 'binary');
  const metadata = calculateJPEGMetadata(buf);
  const depthOrientation = buffer[edofIndex + 11].charCodeAt(0) & 0x03;
  let depthWidth =
    (buffer[edofIndex + 21].charCodeAt(0) << 8) +
    buffer[edofIndex + 20].charCodeAt(0);
  let depthHeight =
    (buffer[edofIndex + 23].charCodeAt(0) << 8) +
    buffer[edofIndex + 22].charCodeAt(0);
  if (depthOrientation == 1 || depthOrientation == 3) {
    const tmp = depthWidth;
    depthWidth = depthHeight;
    depthHeight = tmp;
  }
  if ((depthWidth * 4) / depthHeight < 3) {
    alert(
      'This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)'
    );
    return true;
  }
  const depthOffset = edofIndex + 72;
  const depthImageBuffer = createDepthMapBufferFromRAW(
    buffer,
    depthOffset,
    depthWidth,
    depthHeight,
    depthOrientation
  );
  const rawImageData = {
    data: depthImageBuffer,
    width: depthWidth,
    height: depthHeight,
  };
  const jpegImageData = encodeJPEG(rawImageData, 85);
  const zip = new JSZip();
  zip.file('image.jpg', imageData, { binary: true });
  zip.file('image_depth.jpg', jpegImageData.data.toString('binary'), {
    binary: true,
  });
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'image.zip');
    switchProcessingMode(false);
  });
  return true;
}

function extractGooglePixelPortraitPhoto(buffer) {
  let i = 0;
  if (buffer[i].charCodeAt(0) == 0xff && buffer[i + 1].charCodeAt(0) == 0xd8) {
  } else {
    return false;
  }
  let lastIndex = 0;
  let xmpChunkBuffer = '';
  while (
    (i = buffer.indexOf('http://ns.adobe.com/xmp/extension/', lastIndex)) != -1
  ) {
    i -= 2;
    let length = buffer[i].charCodeAt(0) * 256 + buffer[i + 1].charCodeAt(0);
    xmpChunkBuffer = xmpChunkBuffer + buffer.slice(i + 79 - 2, i + length);
    lastIndex = i + length;
  }
  if (xmpChunkBuffer.length == 0) return false;
  const gdepthDataStartIndex = xmpChunkBuffer.indexOf('GDepth:Data="');
  let gdepthDataStopIndex = xmpChunkBuffer.indexOf('"/>', gdepthDataStartIndex);
  if (gdepthDataStopIndex == -1)
    gdepthDataStopIndex = xmpChunkBuffer.indexOf('" />', gdepthDataStartIndex);
  if (gdepthDataStartIndex == -1 || gdepthDataStopIndex == -1) return false;
  const depthBase64StartIndex = gdepthDataStartIndex + 'GDepth:Data="'.length;
  if ((gdepthDataStopIndex - depthBase64StartIndex) % 4 != 0)
    gdepthDataStopIndex--;
  const depthBase64 = xmpChunkBuffer.slice(
    depthBase64StartIndex,
    gdepthDataStopIndex
  );
  if (!depthBase64 || depthBase64.length == 0) return false;
  const metadata = calculateJPEGMetadata(new Buffer(buffer, 'binary'));
  const depthData = base64ToByteArray(depthBase64);
  let jpegImageData;
  if (depthData[0] == 0xff && depthData[1] == 0xd8) {
    const rawDepthData = decodeJPEG(depthData);
    var depthWidth = rawDepthData.width;
    var depthHeight = rawDepthData.height;
    var depthOrientation = metadata.orientation || 0;
    if (depthOrientation > 4) {
      var tmp = depthWidth;
      depthWidth = depthHeight;
      depthHeight = tmp;
    }
    if ((depthWidth * 4) / depthHeight < 3) {
      alert(
        'This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)'
      );
      return true;
    }
    var correctedDepthData = createDepthMapBufferFromRAWBuffer(
      rawDepthData.data,
      0,
      depthWidth,
      depthHeight,
      depthOrientation,
      4
    );
    var rawImageData = {
      data: correctedDepthData,
      width: depthWidth,
      height: depthHeight,
    };
    jpegImageData = encodeJPEG(rawImageData, 85);
  } else {
    var depthWidth =
      (depthData[3] << 24) +
      (depthData[2] << 16) +
      (depthData[1] << 8) +
      depthData[0];
    var depthHeight =
      (depthData[7] << 24) +
      (depthData[6] << 16) +
      (depthData[5] << 8) +
      depthData[4];
    var depthOrientation = metadata.orientation || 0;
    if (depthOrientation > 4) {
      var tmp = depthWidth;
      depthWidth = depthHeight;
      depthHeight = tmp;
    }
    if ((depthWidth * 4) / depthHeight < 3) {
      alert(
        'This photo could not be uploaded to Facebook as a 3D photo since the image ratio could not be lower than 3:4 (w:h)'
      );
      return true;
    }
    var correctedDepthData = createDepthMapBufferFromRAWBuffer(
      depthData,
      16,
      depthWidth,
      depthHeight,
      depthOrientation,
      1
    );
    var rawImageData = {
      data: correctedDepthData,
      width: depthWidth,
      height: depthHeight,
    };
    jpegImageData = encodeJPEG(rawImageData, 85);
  }
  const zip = new JSZip();
  zip.file('image.jpg', buffer, { binary: true });
  zip.file('image_depth.jpg', jpegImageData.data.toString('binary'), {
    binary: true,
  });
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'image.zip');
    switchProcessingMode(false);
  });
  return true;
}

function extractPMPDPortraitPhoto(buffer) {
  if (buffer[0].charCodeAt(0) == 0xff && buffer[1].charCodeAt(0) == 0xd8) {
  } else {
    return false;
  }
  const pmpdMarker = buffer.lastIndexOf(
    '\u0050\u004D\u0050\u0044\u0002\u0000\u0064\u0000\u0001\u0000\u0000\u0000'
  );
  if (pmpdMarker == -1) return false;
  let startSrcImageIndex = buffer.indexOf('\u00FF\u00D8\u00FF\u00E1', 1);
  if (startSrcImageIndex == -1) startSrcImageIndex = 0;
  const stopSrcImageIndex = buffer.lastIndexOf('\u00FF\u00D9');
  const imageData = buffer.slice(startSrcImageIndex, stopSrcImageIndex + 2);
  let depthWidth;
  let depthHeight;
  let offset;
  let factor;
  const totalChunkSize = readUint16AtPosition(buffer, pmpdMarker + 12);
  const depthChunkSize = readUint16AtPosition(buffer, pmpdMarker + 16);
  const afterFillData = [];
  afterFillData[0] = readUint16AtPosition(buffer, pmpdMarker + 1056);
  afterFillData[1] = readUint16AtPosition(buffer, pmpdMarker + 1060);
  afterFillData[2] = readUint16AtPosition(buffer, pmpdMarker + 1064);
  longVersionMarker = (0xff << 24) + (0xff << 16) + (0x00 << 8) + 0x01;
  if (afterFillData[0] == longVersionMarker) {
    depthWidth = afterFillData[1];
    depthHeight = afterFillData[2];
  } else {
    depthWidth = afterFillData[0];
    depthHeight = afterFillData[1];
  }
  factor = depthChunkSize - depthWidth * depthHeight;
  offset = pmpdMarker + 1056 + factor;
  let frameData = new Buffer(depthWidth * depthHeight * 4);
  let i = depthWidth * (depthHeight - 1);
  let j = 0;
  let count = 0;
  while (count * 4 < frameData.length) {
    frameData[i * 4 + 0] = buffer[offset + j].charCodeAt(0);
    frameData[i * 4 + 1] = buffer[offset + j].charCodeAt(0);
    frameData[i * 4 + 2] = buffer[offset + j].charCodeAt(0);
    frameData[i * 4 + 3] = 0xff;
    i++;
    j++;
    count++;
    if (
      j == 1152 - factor - 128 ||
      ((j - (1152 - factor - 128)) % 1152 == 0 && j < 1152 * 50)
    )
      j += 128;
    if (i % depthWidth == 0) i = i - depthWidth * 2;
  }
  const metadata = calculateJPEGMetadata(new Buffer(imageData, 'binary'));
  const depthOrientation = metadata.orientation || 0;
  if (depthOrientation > 4) {
    const tmp = depthWidth;
    depthWidth = depthHeight;
    depthHeight = tmp;
  }
  frameData = createDepthMapBufferFromRAWBuffer(
    frameData,
    0,
    depthWidth,
    depthHeight,
    depthOrientation,
    4
  );
  const rawImageData = {
    data: frameData,
    width: depthWidth,
    height: depthHeight,
  };
  const jpegImageData = encodeJPEG(rawImageData, 85);
  const zip = new JSZip();
  zip.file('image.jpg', imageData, { binary: true });
  zip.file('image_depth.jpg', jpegImageData.data.toString('binary'), {
    binary: true,
  });
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'image.zip');
    switchProcessingMode(false);
  });
  return true;
}

function extractDepthBFDepth(buffer) {
  if (buffer[0].charCodeAt(0) == 0xff && buffer[1].charCodeAt(0) == 0xd8) {
  } else {
    return false;
  }
  let depthBFIndex = buffer.indexOf('DEPTHBF');
  if (depthBFIndex == -1) return false;
  let depthData = '';
  while (depthBFIndex >= 0) {
    if (
      buffer[depthBFIndex - 8].charCodeAt(0) == 0xff &&
      buffer[depthBFIndex - 7].charCodeAt(0) == 0xef
    ) {
      const chunkSize =
        (buffer[depthBFIndex - 6].charCodeAt(0) << 8) +
        buffer[depthBFIndex - 5].charCodeAt(0);
      depthData =
        depthData +
        buffer.slice(depthBFIndex + 8, depthBFIndex + chunkSize - 6);
    }
    depthBFIndex = buffer.indexOf('DEPTHBF', depthBFIndex + 1);
  }
  const depthBufferWidthIndex = buffer.indexOf('DepthBufferWidth="');
  const deepthBufferHeightIndex = buffer.indexOf('DepthBufferHeight="');
  if (depthBufferWidthIndex == -1 || deepthBufferHeightIndex == -1)
    return false;
  const depthBufferWidthStartIndex =
    depthBufferWidthIndex + 'DepthBufferWidth="'.length;
  const depthBufferHeightStartIndex =
    deepthBufferHeightIndex + 'DepthBufferHeight="'.length;
  const depthWidth = parseInt(
    buffer.slice(
      depthBufferWidthStartIndex,
      buffer.indexOf('"', depthBufferWidthStartIndex)
    )
  );
  const depthHeight = parseInt(
    buffer.slice(
      depthBufferHeightStartIndex,
      buffer.indexOf('"', depthBufferHeightStartIndex)
    )
  );
  let i = 0;
  const frameData = new Buffer(depthWidth * depthHeight * 4);
  while (i < depthWidth * depthHeight) {
    color = depthData[i].charCodeAt(0);
    frameData[i * 4 + 0] = color;
    frameData[i * 4 + 1] = color;
    frameData[i * 4 + 2] = color;
    frameData[i * 4 + 3] = 0xff;
    i++;
  }
  const rawImageData = {
    data: frameData,
    width: depthWidth,
    height: depthHeight,
  };
  const jpegImageData = encodeJPEG(rawImageData, 85);
  const zip = new JSZip();
  zip.file('image.jpg', buffer, { binary: true });
  zip.file('image_depth.jpg', jpegImageData.data.toString('binary'), {
    binary: true,
  });
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'image.zip');
    switchProcessingMode(false);
  });
  return true;
}

function extractVivoAndNubiaDepth(buffer) {
  if (buffer[0].charCodeAt(0) == 0xff && buffer[1].charCodeAt(0) == 0xd8) {
  } else {
    return false;
  }
  const metadata = calculateJPEGMetadata(new Buffer(buffer, 'binary'), true);
  const isVivo = metadata.exifBlock && metadata.exifBlock.includes('vivo');
  const isNubia = metadata.exifBlock && metadata.exifBlock.includes('nubia');
  if (!isVivo && !isNubia) return false;
  var i = 0;
  let startPosition = 0;
  let lastPosition = 0;
  let newFileChunkAvailable = false;
  do {
    startPosition = lastPosition;
    i = startPosition + 2;
    while (buffer[i].charCodeAt(0) == 0xff) {
      const chunkSize =
        (buffer[i + 2].charCodeAt(0) << 8) + buffer[i + 3].charCodeAt(0);
      i += chunkSize + 2;
    }
    lastPosition = buffer.indexOf('\u00FF\u00D9', i);
    if (
      lastPosition >= 0 &&
      lastPosition < buffer.length - 3 &&
      buffer[lastPosition + 2].charCodeAt(0) == 0xff &&
      buffer[lastPosition + 3].charCodeAt(0) == 0xd8
    )
      newFileChunkAvailable = true;
    else newFileChunkAvailable = false;
    lastPosition = lastPosition + 2;
  } while (newFileChunkAvailable);
  if (lastPosition == -1 + 2 || lastPosition >= buffer.length + 3) return false;
  const imageData = buffer.slice(startPosition, lastPosition);
  let depthWidth = readUint16AtPosition(buffer, lastPosition);
  let depthHeight = readUint16AtPosition(buffer, lastPosition + 4);
  let val3 = readUint16AtPosition(buffer, lastPosition + 8);
  let offset;
  if (
    depthWidth != 0 &&
    depthHeight != 0 &&
    (depthWidth == val3 || depthHeight == val3)
  ) {
  } else if (
    depthWidth != 0 &&
    depthHeight != 0 &&
    depthWidth * depthHeight * 4 == val3
  ) {
    offset = lastPosition + 12;
  } else {
    depthWidth = readUint16AtPosition(buffer, lastPosition + 16);
    depthHeight = readUint16AtPosition(buffer, lastPosition + 20);
    val3 = readUint16AtPosition(buffer, lastPosition + 24);
    if (depthWidth * depthHeight * 4 == val3) offset = lastPosition + 32;
    else return false;
  }
  var frameData;
  if (metadata.orientation > 4) {
    const tmp = depthWidth;
    depthWidth = depthHeight;
    depthHeight = tmp;
  }
  if (depthWidth * depthHeight * 4 == val3) {
    let color;
    var frameData = new Buffer(depthWidth * depthHeight);
    var i = 0;
    while (i < frameData.length) {
      color = buffer[offset + i * 4 + 3].charCodeAt(0) << 24;
      color += buffer[offset + i * 4 + 2].charCodeAt(0) << 16;
      color = (color >> 18) & 0xfff;
      if (color > 2048) color = 0;
      color = color & 0xff;
      frameData[i] = 255 - color;
      i++;
    }
    frameData = createDepthMapBufferFromRAWBuffer(
      frameData,
      0,
      depthWidth,
      depthHeight,
      metadata.orientation,
      1
    );
  } else {
    let depthOrientation = 0;
    if (metadata.orientation == 3) depthOrientation = 2;
    if (metadata.orientation == 6) depthOrientation = 3;
    if (metadata.orientation == 8) depthOrientation = 1;
    frameData = createDepthMapBufferFromRAW(
      buffer,
      lastPosition + (isNubia ? 16 : 36),
      depthWidth,
      depthHeight,
      depthOrientation
    );
  }
  const rawImageData = {
    data: frameData,
    width: depthWidth,
    height: depthHeight,
  };
  const jpegImageData = encodeJPEG(rawImageData, 85);
  const zip = new JSZip();
  zip.file('image.jpg', imageData, { binary: true });
  zip.file('image_depth.jpg', jpegImageData.data.toString('binary'), {
    binary: true,
  });
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'image.zip');
    switchProcessingMode(false);
  });
  return true;
}

function extractOPPODepth(buffer) {
  if (buffer[0].charCodeAt(0) == 0xff && buffer[1].charCodeAt(0) == 0xd8) {
  } else {
    return false;
  }
  const metadata = calculateJPEGMetadata(new Buffer(buffer, 'binary'), true);
  const isOPPO = metadata.exifBlock && metadata.exifBlock.includes('OPPO');
  if (!isOPPO) return false;
  var i = 0;
  let startPosition = 0;
  let lastPosition = 0;
  let newFileChunkAvailable = false;
  do {
    startPosition = lastPosition;
    i = startPosition + 2;
    while (buffer[i].charCodeAt(0) == 0xff) {
      const chunkSize =
        (buffer[i + 2].charCodeAt(0) << 8) + buffer[i + 3].charCodeAt(0);
      i += chunkSize + 2;
    }
    lastPosition = buffer.indexOf('\u00FF\u00D9', i);
    if (
      lastPosition >= 0 &&
      lastPosition < buffer.length - 3 &&
      buffer[lastPosition + 2].charCodeAt(0) == 0xff &&
      buffer[lastPosition + 3].charCodeAt(0) == 0xd8
    )
      newFileChunkAvailable = true;
    else newFileChunkAvailable = false;
    lastPosition = lastPosition + 2;
  } while (newFileChunkAvailable);
  if (lastPosition == -1 + 2 || lastPosition >= buffer.length + 3) return false;
  const imageData = buffer.slice(startPosition, lastPosition);
  let depthWidth = readUint16AtPosition(buffer, lastPosition);
  let depthHeight = readUint16AtPosition(buffer, lastPosition + 4);
  let val3 = readUint16AtPosition(buffer, lastPosition + 8);
  let offset;
  if (
    depthWidth != 0 &&
    depthHeight != 0 &&
    (depthWidth == val3 || depthHeight == val3)
  ) {
  } else if (
    depthWidth != 0 &&
    depthHeight != 0 &&
    depthWidth * depthHeight * 4 == val3
  ) {
    offset = lastPosition + 12;
  } else {
    depthWidth = readUint16AtPosition(buffer, lastPosition + 16);
    depthHeight = readUint16AtPosition(buffer, lastPosition + 20);
    val3 = readUint16AtPosition(buffer, lastPosition + 24);
    if (depthWidth * depthHeight * 4 == val3) offset = lastPosition + 32;
    else return false;
  }
  var frameData;
  if (metadata.orientation > 4) {
    const tmp = depthWidth;
    depthWidth = depthHeight;
    depthHeight = tmp;
  }
  if (depthWidth * depthHeight * 4 == val3) {
    let color;
    var frameData = new Buffer(depthWidth * depthHeight);
    var i = 0;
    while (i < frameData.length) {
      color = buffer[offset + i * 4 + 3].charCodeAt(0) << 24;
      color += buffer[offset + i * 4 + 2].charCodeAt(0) << 16;
      color = (color >> 18) & 0xfff;
      if (color > 2048) color = 0;
      color = color & 0xff;
      frameData[i] = 255 - color;
      i++;
    }
    frameData = createDepthMapBufferFromRAWBuffer(
      frameData,
      0,
      depthWidth,
      depthHeight,
      metadata.orientation,
      1
    );
  } else {
    let depthOrientation = 0;
    if (metadata.orientation == 3) depthOrientation = 2;
    if (metadata.orientation == 6) depthOrientation = 3;
    if (metadata.orientation == 8) depthOrientation = 1;
    frameData = createDepthMapBufferFromRAW(
      buffer,
      lastPosition + (isNubia ? 16 : 36),
      depthWidth,
      depthHeight,
      depthOrientation
    );
  }
  const rawImageData = {
    data: frameData,
    width: depthWidth,
    height: depthHeight,
  };
  const jpegImageData = encodeJPEG(rawImageData, 85);
  const zip = new JSZip();
  zip.file('image.jpg', imageData, { binary: true });
  zip.file('image_depth.jpg', jpegImageData.data.toString('binary'), {
    binary: true,
  });
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'image.zip');
    switchProcessingMode(false);
  });
  return true;
}

function createDepthMapBufferFromRAWBuffer(
  buffer,
  offset,
  width,
  height,
  orientation,
  bitPerPixel
) {
  const outputBuffer = new Buffer(width * height * 4);
  let i = 0;
  let j = 0;
  let color;
  for (i = 0; i < height; i++) {
    for (j = 0; j < width; j++) {
      switch (orientation) {
        case 1:
          color = 0xff - buffer[(offset + i * width + j) * bitPerPixel];
          break;
        case 8:
          color =
            0xff -
            buffer[(offset + j * height + (height - i - 1)) * bitPerPixel];
          break;
        case 3:
          color =
            0xff -
            buffer[
              (offset + width * height - 1 - (i * width + j)) * bitPerPixel
            ];
          break;
        case 6:
          color =
            0xff -
            buffer[(offset + (width - j - 1) * height + i) * bitPerPixel];
          break;
      }
      outputBuffer[(i * width + j) * 4 + 0] = color;
      outputBuffer[(i * width + j) * 4 + 1] = color;
      outputBuffer[(i * width + j) * 4 + 2] = color;
      outputBuffer[(i * width + j) * 4 + 3] = 0xff;
    }
  }
  return outputBuffer;
}

function createDepthMapBufferFromRAW(
  buffer,
  offset,
  width,
  height,
  orientation
) {
  const outputBuffer = new Buffer(width * height * 4);
  let i = 0;
  let j = 0;
  let color;
  for (i = 0; i < height; i++) {
    for (j = 0; j < width; j++) {
      switch (orientation) {
        case 1:
          color =
            0xff - buffer[offset + j * height + (height - i - 1)].charCodeAt(0);
          break;
        case 2:
          color =
            0xff -
            buffer[offset + width * height - 1 - (i * width + j)].charCodeAt(0);
          break;
        case 3:
          color =
            0xff - buffer[offset + (width - j - 1) * height + i].charCodeAt(0);
          break;
        case 0:
        default:
          color = 0xff - buffer[offset + i * width + j].charCodeAt(0);
          break;
      }
      outputBuffer[(i * width + j) * 4 + 0] = color;
      outputBuffer[(i * width + j) * 4 + 1] = color;
      outputBuffer[(i * width + j) * 4 + 2] = color;
      outputBuffer[(i * width + j) * 4 + 3] = 0xff;
    }
  }
  return outputBuffer;
}

function readUint16AtPosition(buffer, position) {
  return (
    (buffer.charCodeAt(position + 3) << 24) +
    (buffer.charCodeAt(position + 2) << 16) +
    (buffer.charCodeAt(position + 1) << 8) +
    buffer.charCodeAt(position)
  );
}

function initExtractor() {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
  } else {
    alert('The File APIs are not fully supported in this browser.');
    return;
  }
}

function handleFileSelect({ target }) {
  GtmHelper.pushGAEvent('select-file');
  const files = target.files;
  if (files.length == 0) return;
  const output = [];
  for (let i = 0, f; (f = files[i]); i++) {
    if (!f.type.match('image.*')) continue;
    switchProcessingMode(true);
    setTimeout(
      (() => {
        const reader = new FileReader();
        reader.onload = (theFile) => {
          const buffer = reader.result;
          let result = false;
          if (!result) result = extractAppleDepth(buffer);
          if (!result) result = extractSamsungLiveFocusPhoto(buffer);
          if (!result) result = extractHuaweiPortraitPhoto(buffer);
          if (!result) result = extractDepthBFDepth(buffer);
          if (!result) result = extractPMPDPortraitPhoto(buffer);
          if (!result) result = extractVivoAndNubiaDepth(buffer);
          if (!result) result = extractGooglePixelPortraitPhoto(buffer);
          if (!result) {
            GtmHelper.pushGAEvent('extraction-failed');
            alert(
              'Depth map could not be extracted. Please recheck that photo was taken in the depth-capable mode listed below in this page.'
            );
          } else {
            GtmHelper.pushGAEvent('extraction-success');
          }
          switchProcessingMode(false);
          document.getElementById('file-form').reset();
        };
        reader.readAsBinaryString(f);
      })(f),
      100
    );
  }
}

function switchProcessingMode(processing) {
  document.getElementById('input_box').style.display = processing
    ? 'block'
    : 'none';
  document.getElementById('processing_box').style.display = processing
    ? 'none'
    : 'inline-block';
  document.getElementById('input_box').style.display = processing
    ? 'none'
    : 'block';
  document.getElementById('processing_box').style.display = processing
    ? 'inline-block'
    : 'none';
}
document
  .getElementById('file')
  .addEventListener('change', handleFileSelect, false);
