// يدمج Skills والوكلاء والبرومبتات الاحترافية من ai.js داخل المكتبة
(() => {
  const A = window.CTM_AI, C = window.CTM, EN = window.CTM_EN.items;
  if (!A) return;
  const SRC = 'CODE TO MOTION';
  A.skills.forEach(s => {
    const id = 'ctm-' + s.name;
    C.SKILLS.push({type: 'skill', id, n: s.name, cat: s.cat, src: SRC, d: s.ar + ': ' + s.dar, file: s.file, path: `.claude/skills/${s.name}/SKILL.md`,
      envs: {'Claude Code': `.claude/skills/${s.name}/SKILL.md`, 'Codex': `.agents/skills/${s.name}/SKILL.md`, 'Cursor': `.cursor/skills/${s.name}/SKILL.md`}});
    EN[id] = {d: s.desc};
  });
  // الوكلاء الثمانية تحل محل الوكلاء القدام
  C.AGENTS.length = 0;
  A.agents.forEach(a => {
    const id = 'agent-' + a.name;
    C.AGENTS.push({type: 'agent', id, n: a.name, cat: a.cat, src: SRC, d: a.ar + ': ' + a.dar, file: a.claude, path: `.claude/agents/${a.name}.md`,
      skills: a.skills, envs: {'Claude Code': `.claude/agents/${a.name}.md`, 'Cursor': `.cursor/agents/${a.name}.md`, 'Codex': `.agents/skills/agent-${a.name}/SKILL.md`}});
    EN[id] = {d: a.desc};
  });
  A.prompts.forEach(p => {
    const id = 'pro-' + p.id;
    C.PROMPTS.push({type: 'prompt', id, n: p.ar, cat: p.cat, src: SRC + ' · ' + p.en, d: p.d, text: p.text, vars: p.vars, tools: p.tools, req: p.req, example: p.example, preview: p.preview, star: 1});
    EN[id] = {n: p.en, d: p.en};
  });
})();
