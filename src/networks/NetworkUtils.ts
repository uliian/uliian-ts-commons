export function downloadBlob(blob:Blob,fileName:string) {
    const objectURL = URL.createObjectURL(blob);
    let btn = document.createElement('a');
    btn.download = fileName; //文件类型
    btn.href = objectURL;
    btn.click();
    URL.revokeObjectURL(objectURL);
}