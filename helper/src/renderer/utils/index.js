const getFileURL = async (pathname) => {
  const { result } = await window.api.invoke('get-binary-file', { pathname })
  return URL.createObjectURL(new Blob([result]))
}

export { getFileURL }
