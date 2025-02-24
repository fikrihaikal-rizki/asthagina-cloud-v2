export function toArrayChunk(chunkSize, data) {
  var chunks = [];

  var i = 0;
  for (i; i <= data.length; i = i + chunkSize) {
    var chunk = [];
    var j = parseInt(i);
    for (j; j < i + chunkSize && j < data.length; j++) {
      chunk.push(data[j]);
    }

    chunks.push(chunk);
  }

  return chunks;
}
