export function toArrayChunk(chunkSize, data) {
  var chunks = [];

  for (var i = 0; i < data.length; i += chunkSize) {
    var chunk = [];
    for (var j = i; j < i + chunkSize && j < data.length; j++) {
      chunk.push(data[j]);
    }

    chunks.push(chunk);
  }

  return chunks;
}
