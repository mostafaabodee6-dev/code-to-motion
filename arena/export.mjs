import {dimensions,draw} from './motion.mjs';
export function availableFormats() {
  if(!globalThis.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)return [];
  const formats=[
    {extension:'mp4',mimes:['video/mp4;codecs=avc1.42001f','video/mp4;codecs=avc1']},
    {extension:'webm',mimes:['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']}
  ];
  return formats.map(f=>({extension:f.extension,mime:f.mimes.find(m=>MediaRecorder.isTypeSupported(m))})).filter(f=>f.mime);
}
export async function imageMap(p) {
  const entries=await Promise.all(p.layers.filter(l=>l.asset).map(async l=>{
    const img=new Image();img.src=l.asset;await img.decode();
    if(img.width*img.height>16_000_000)throw Error('Image dimensions exceed the supported limit');
    return [l.asset,img];
  }));
  return new Map(entries);
}
export function download(blob,name) {
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export async function renderVideo(p,{format,quality,progress,signal}) {
  signal?.throwIfAborted();
  const images=await imageMap(p);
  signal?.throwIfAborted();
  const canvas=document.createElement('canvas');
  [canvas.width,canvas.height]=dimensions(p.ratio,quality);
  const context=canvas.getContext('2d',{alpha:false});
  draw(context,p,0,images);
  const stream=canvas.captureStream(p.fps);
  try {
    const recorder=new MediaRecorder(stream,{mimeType:format.mime,videoBitsPerSecond:quality===720?5_000_000:9_000_000});
    let raf;
    const chunks=[];
    try {
      return await new Promise((resolve,reject)=>{
        const abort=()=>{if(recorder.state!=='inactive')recorder.stop();reject(signal.reason);};
        recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
        recorder.onerror=e=>{signal?.removeEventListener('abort',abort);reject(e.error??Error('Encoder error'));};
        recorder.onstop=()=>{
          signal?.removeEventListener('abort',abort);
          if(signal?.aborted){reject(signal.reason);return;}
          const blob=new Blob(chunks,{type:format.mime.split(';')[0]});
          if(!blob.size){reject(Error('Encoder returned an empty video'));return;}
          resolve(blob);
        };
        recorder.start();
        signal?.addEventListener('abort',abort,{once:true});
        const start=performance.now();
        let last=-1;
        const tick=now=>{
          const seconds=(now-start)/1000;
          const frame=Math.min(Math.ceil(p.duration*p.fps)-1,Math.floor(seconds*p.fps));
          if(frame!==last){draw(context,p,frame,images);last=frame;}
          progress(Math.min(1,seconds/p.duration));
          if(seconds>=p.duration){if(recorder.state!=='inactive')recorder.stop();}
          else if(recorder.state!=='inactive')raf=requestAnimationFrame(tick);
        };
        raf=requestAnimationFrame(tick);
      });
    } finally {cancelAnimationFrame(raf);}
  } finally {stream.getTracks().forEach(track=>track.stop());}
}
