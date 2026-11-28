import {test} from 'node:test';
import assert from 'node:assert/strict';
import {animations,dimensions,draw,layer,project,templates,validate} from '../motion.mjs';

test('six templates create independent valid local projects in Arabic and English',()=>{
  assert.equal(new Set(templates.map(x=>x.id)).size,6);
  for(const t of templates){
    const ar=project(t.id,'ar'),en=project(t.id,'en');
    assert.notEqual(ar.id,en.id);
    assert.equal(validate(ar).template,t.id);
    assert.equal(validate(en).template,t.id);
    assert.match(ar.layers[0].text,/ستوديو/);
    assert.equal(en.layers[0].text,'REAL STUDIO');
    assert.ok(animations.includes(ar.layers[0].animation));
  }
});
test('output resolutions preserve ratio and are even',()=>{
  assert.deepEqual(dimensions('16:9',720),[1280,720]);
  assert.deepEqual(dimensions('9:16',1080),[1080,1920]);
  assert.deepEqual(dimensions('1:1',1080),[1080,1080]);
});
test('invalid and unsafe imports are rejected',()=>{
  const p=project();
  for(const bad of [
    {...p,ratio:'constructor'},{...p,duration:31},{...p,fps:48},{...p,schemaVersion:2},
    {...p,layers:[...p.layers,p.layers[0]]},
    {...p,layers:[{...layer('image','X'),asset:'https://example.test/a.png'}]},
    {...p,layers:[{...layer('image','X'),asset:'data:image/svg+xml;base64,AAAA'}]},
    {...p,layers:[{...p.layers[0],start:7,end:6}]}
  ]) assert.throws(()=>validate(bad));
  assert.equal(validate({...p,code:'untrusted'}).code,undefined);
});
test('renderer is deterministic for the same frame and honors hidden layers',()=>{
  const makeContext=()=>{
    const ops=[];
    const ctx=new Proxy({canvas:{width:640,height:360}},{get:(target,key)=>{
      if(key in target)return target[key];
      return (...args)=>{ops.push([key,...args]);if(key==='createRadialGradient')return {addColorStop:(...stops)=>ops.push(stops)};};
    },set:(target,key,value)=>{ops.push([key,typeof value==='object'?'gradient':value]);return Reflect.set(target,key,value);}});
    return {ctx,ops};
  };
  for(const t of templates){
    const p=project(t.id,'ar');
    const first=makeContext(),second=makeContext(),other=makeContext();
    draw(first.ctx,p,38);draw(second.ctx,p,38);draw(other.ctx,p,1);
    assert.deepEqual(first.ops,second.ops);
    assert.notDeepEqual(first.ops,other.ops);
    p.layers[0].hidden=true;
    const hidden=makeContext();draw(hidden.ctx,p,38);
    assert.ok(!hidden.ops.some(op=>op[0]==='fillText'&&op[1]==='ساحة الموشن'));
  }
});
