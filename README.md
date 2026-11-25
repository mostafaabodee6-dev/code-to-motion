# CODE TO MOTION · مكتبة الأدوات

موقع ورشة **CODE TO MOTION**، إعداد عبدالرحمن مصطفى ([@mostafaabodee8](https://x.com/mostafaabodee8)).
فيه مكتبة Skills ووكلاء وأوامر وبرومبتات، وأدوات تجربة لايف لـ Remotion، ودروس الورشة، ومشروع جاهز للتحميل.

## تعديل الموقع بدون كود

### الورشة الجاية — `data/next.json`
```json
{
  "title": "CODE TO MOTION 2",
  "date": "2026-12-20T18:00:00+03:00",
  "link": "https://lu.ma/..."
}
```
اترك `date` فاضي (`""`) عشان تطلع «قريبًا».

### معرض الأعمال — `data/gallery.json`
ارفع الفيديو في مجلد `videos/` (أقل من 25MB)، وبعدين أضف سطر:
```json
[
  {"name": "اسم صاحب العمل", "title": "عنوان العمل", "link": "https://x.com/...", "video": "videos/work1.mp4"}
]
```

### المكتبة — `catalog.js`
كل Skill ووكيل وأمر وبرومبت مكتوب هنا. انسخ أي عنصر وعدّله. والنص الإنجليزي في `catalog_en.js`.

## ملفات
- `code-to-motion.zip`: مشروع الورشة (Remotion).
- `final.mp4`: فيديو المشروع النهائي.
