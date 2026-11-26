export const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export const $=(id,root=document)=>root.querySelector(id);
export const $$=(query,root=document)=>[...root.querySelectorAll(query)];
export const language=()=>localStorage.getItem('arena-lang')??'ar';
export const tr=(ar,en)=>language()==='ar'?ar:en;
export const choice=(value,label,selected)=>'<option value="'+escape(value)+'"'+(value===selected?' selected':'')+'>'+escape(label)+'</option>';
export const label=(title,control)=>'<label>'+escape(title)+control+'</label>';
export const action=(id,title,primary=false)=>'<button type="button" id="'+id+'"'+(primary?' class="primary"':'')+'>'+escape(title)+'</button>';
export function toast(message){
  const el=$('#notice');el.textContent=message;
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.textContent='',5500);
}
export const err=e=>toast(e?.message||String(e));
export const section=(title,content)=>'<section class="wrap"><h1 class="page-title">'+escape(title)+'</h1>'+content+'</section>';
export const clock=seconds=>{const s=Math.max(0,Math.ceil(seconds));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
