/**
 * 通过 fetch 校验地址的可用性
 * @param blobUrl URL.createObjectURL 生成的地址
 */
export async function isBlobUrlValid(blobUrl: string) {
  try {
    const res = await fetch(blobUrl, { headers: { Range: "bytes=0-0" } });
    if (!res.ok) return false;
    const partialBlob = await res.blob();
    return partialBlob.size > 0;
  } catch (err) {
    return false;
  }
}
