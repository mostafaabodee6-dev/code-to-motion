# Implementation status

The first release implements a bilingual static guest studio with six project templates, editable text/shape/image layers, frame-based motion, clipping by time, undo/redo, local project management, and browser export. It also implements the first competition workflow, audience voting, frozen vote counts, moderation, and five broadcast scenes. The deployment must have the workshop's existing Supabase client and admin helper.

## Release limitations

- The source is native ES modules to fit the existing static site. It uses a shared Canvas engine and MediaRecorder instead of Remotion for preview and export. The learning page and composition prompt show how to continue in Remotion.
- Video export is silent and records in real time. Advanced keyframes, graph editing, audio, cloud saving, and generated Remotion source are outside this version.
- The challenge workflow supports a seeded event and slug-based routing. Creating more events, access codes, judging weights, gamification, certificates, advanced reports and account deletion workflows are pending. Current results refer to the displayed challenge. Challenge history is pending.
- State synchronization uses polling. Video review is manual. Submission retries need an administrator if an already recorded work needs to be replaced. This release has one submission per challenge.
- Supabase integration, load, delivery of sign-in emails, privacy policies in the deployed project, and actual OBS operation must be rehearsed against the target project before public use.
