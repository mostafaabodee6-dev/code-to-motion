import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const browser=await chromium.launch({channel:'chromium',headless:true});
const temp=await mkdtemp(join(tmpdir(),'arena-check-'));
const origin=process.env.ARENA_TEST_ORIGIN??'http://127.0.0.1:8766';
try{
  const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/arena/');
  await page.locator('h1').waitFor();
  assert.equal(await page.locator('h1').textContent(),'ساحة الموشن');
  assert.equal(await page.locator('[data-template]').count(),6);
  await page.locator('[data-template="kinetic"]').click();
  await page.locator('#stage').waitFor();
  const name=page.locator('.toolbar [data-key="name"]');
  await name.fill('اختبار ساحة الموشن');
  await name.press('Tab');
  await page.locator('textarea[data-key="text"]').fill('الكود يتحرّك · CODE IN MOTION');
  await page.locator('textarea[data-key="text"]').press('Tab');
  await page.locator('input[data-key="duration"]').fill('3');
  await page.locator('input[data-key="duration"]').press('Tab');
  await page.locator('#save').click();
  await page.waitForFunction(()=>document.querySelector('#save-state')?.textContent==='محفوظ محليًا');
  await page.reload();
  await page.locator('#stage').waitFor();
  assert.equal(await name.inputValue(),'اختبار ساحة الموشن');
  assert.equal(await page.locator('textarea[data-key="text"]').inputValue(),'الكود يتحرّك · CODE IN MOTION');
  await page.locator('#language').click();
  await page.waitForFunction(()=>document.documentElement.dir==='ltr');
  await page.locator('#export').click();
  const supported=await page.locator('#format option').allTextContents();
  assert.ok(supported.length,'This Chromium runner must have a supported codec');
  for(const kind of supported.map(s=>s.toLowerCase())){
    await page.locator('#format').selectOption(kind);
    const pending=page.waitForEvent('download',{timeout:15000});
    await page.locator('#video').click();
    const download=await pending;
    const path=join(temp,'arena.'+kind);
    await download.saveAs(path);
    const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',path],{encoding:'utf8'}));
    const stream=metadata.streams.find(s=>s.codec_type==='video');
    assert.equal(stream.width,1280);assert.equal(stream.height,720);
    assert.ok(Number.parseInt(stream.nb_read_frames,10)>=65,'At least 65 frames decode from a 3-second recording');
    if(metadata.format.duration){
      assert.ok(Math.abs(Number(metadata.format.duration)-3)<.5);
    }
    if(kind==='mp4')assert.equal(stream.codec_name,'h264');
    else assert.ok(['vp8','vp9'].includes(stream.codec_name));
    console.log(kind+': '+stream.codec_name+' '+stream.width+'×'+stream.height+', '+stream.nb_read_frames+' frames decoded');
  }
  await page.locator('#close-export').click();
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  assert.deepEqual(errors,[]);
  console.log('PASS: template, Arabic editing, storage, LTR, real video downloads, and mobile viewport');
}finally{
  await browser.close();
  await rm(temp,{recursive:true,force:true});
}
