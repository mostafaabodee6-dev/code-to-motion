function open() {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('motion-arena',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('projects',{keyPath:'id'});
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>resolve(request.result);
  });
}
async function run(mode,act) {
  const db=await open();
  try {
    return await new Promise((resolve,reject)=>{
      const tx=db.transaction('projects',mode);
      const req=act(tx.objectStore('projects'));
      tx.oncomplete=()=>resolve(req.result);
      tx.onabort=tx.onerror=()=>reject(tx.error??req.error);
    });
  } finally {db.close();}
}
export const save=p=>run('readwrite',s=>s.put(p));
export const all=()=>run('readonly',s=>s.getAll());
export const get=id=>run('readonly',s=>s.get(id));
export const remove=id=>run('readwrite',s=>s.delete(id));
