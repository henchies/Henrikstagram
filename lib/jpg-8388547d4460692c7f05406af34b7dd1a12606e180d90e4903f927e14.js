function readUInt(buffer, bits, offset = 0, isBigEndian) {
  const endian = isBigEndian ? 'BE' : 'LE';
  const method = buffer[`readUInt${bits}${endian}`];
  return method.call(buffer, offset);
}

function isJPG(buffer) {
  const SOIMarker = buffer.toString('hex', 0, 2);
  return 'ffd8' === SOIMarker;
}

function isEXIF(buffer) {
  const exifMarker = buffer.toString('hex', 2, 6);
  return exifMarker === '45786966';
}

function extractSize(buffer, i) {
  return { height: buffer.readUInt16BE(i), width: buffer.readUInt16BE(i + 2) };
}
const APP1_DATA_SIZE_BYTES = 2;
const EXIF_HEADER_BYTES = 6;
const TIFF_BYTE_ALIGN_BYTES = 2;
const BIG_ENDIAN_BYTE_ALIGN = '4d4d';
const IDF_ENTRY_BYTES = 12;
const NUM_DIRECTORY_ENTRIES_BYTES = 2;

function extractExif(buffer, i, needExifBlock) {
  const exifBlock = buffer.slice(APP1_DATA_SIZE_BYTES, i);
  const byteAlign = exifBlock.toString(
    'hex',
    EXIF_HEADER_BYTES,
    EXIF_HEADER_BYTES + TIFF_BYTE_ALIGN_BYTES
  );
  const bigEndian = byteAlign === BIG_ENDIAN_BYTE_ALIGN;
  const idfOffset = 8;
  const offset = EXIF_HEADER_BYTES + idfOffset;
  const idfDirectoryEntries = readUInt(exifBlock, 16, offset, bigEndian);
  let start;
  let end;
  let orientation = 1;
  for (
    let directoryEntryNumber = 0;
    directoryEntryNumber < idfDirectoryEntries;
    directoryEntryNumber++
  ) {
    start =
      offset +
      NUM_DIRECTORY_ENTRIES_BYTES +
      directoryEntryNumber * IDF_ENTRY_BYTES;
    end = start + IDF_ENTRY_BYTES;
    const block = exifBlock.slice(start, end);
    const tagNumber = readUInt(block, 16, 0, bigEndian);
    if (tagNumber === 274) {
      const dataFormat = readUInt(block, 16, 2, bigEndian);
      if (dataFormat !== 3) {
        return;
      }
      const numberOfComponents = readUInt(block, 32, 4, bigEndian);
      if (numberOfComponents !== 1) {
        return;
      }
      orientation = readUInt(block, 16, 8, bigEndian);
    }
  }
  return {
    orientation,
    exifBlock: needExifBlock ? exifBlock.toString() : '',
  };
}

function validateBuffer(buffer, i) {
  if (i > buffer.length) {
    throw new TypeError('Corrupt JPG, exceeded buffer limits');
  }
  if (buffer[i] !== 0xff) {
    throw new TypeError('Invalid JPG, marker table corrupted');
  }
}

function calculateJPEGMetadata(buffer, needExifBlock) {
  if (typeof needExifBlock === 'undefined') needExifBlock = false;
  buffer = buffer.slice(4);
  let orientation;
  let exifBlock = '';
  let i;
  let next;
  while (buffer.length) {
    i = buffer.readUInt16BE(0);
    if (isEXIF(buffer)) {
      const exif = extractExif(buffer, i, needExifBlock);
      orientation = exif.orientation;
      exifBlock = exif.exifBlock;
    }
    validateBuffer(buffer, i);
    next = buffer[i + 1];
    if (next === 0xc0 || next === 0xc1 || next === 0xc2) {
      const size = extractSize(buffer, i + 5);
      if (!orientation) {
        size.orientation = 1;
        size.exifBlock = exifBlock;
        return size;
      }
      return {
        width: size.width,
        height: size.height,
        orientation,
        exifBlock,
      };
    }
    buffer = buffer.slice(i + 2);
  }
  throw new TypeError('Invalid JPG, no size found');
}
