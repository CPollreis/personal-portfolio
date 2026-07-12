/**
 * Timeline data - the single source of truth for the /timeline spine.
 *
 * >>> EVERY EVENT BELOW IS A REALISTIC PLACEHOLDER. <<<
 * Edit titles, dates, `why` blurbs, and point `media.src` at real files in
 * /public (e.g. src: '/timeline/first-drive.jpg') to make this yours. The
 * spine layout, branch sides, and ghost year numerals all derive from this
 * file; nothing else needs to change when you edit it.
 *
 * media.src supports images (.jpg/.png/.webp) and video (.mp4/.webm). When
 * src is omitted the detail card shows an on-brand "media pending" frame
 * with the alt text as the description of the picture or video.
 */

export type EventKind = 'milestone' | 'fsae' | 'project' | 'photo';

export interface TimelineMedia {
  type: 'photo' | 'video';
  /** Path under /public. Omit while the real asset is pending. */
  src?: string;
  /** Description of the picture or video (shown in the card, used as alt). */
  alt: string;
}

export interface TimelineEvent {
  id: string;
  /** ISO date (yyyy-mm-dd). Shown on the detail card. */
  date: string;
  title: string;
  /** A few lines: why this moment mattered to me and my career. */
  why: string;
  kind: EventKind;
  /** 2 = major star: drawn larger, labeled even when zoomed far out. */
  weight?: 1 | 2;
  media?: TimelineMedia;
}

export interface TimelineYear {
  year: number;
  /** Short space-flavored theme word shown under the year numeral. */
  theme: string;
  events: TimelineEvent[];
}

export const timeline: TimelineYear[] = [
  {
    year: 2022,
    theme: 'Ignition',
    events: [
      {
        id: 'first-day-compe',
        date: '2022-09-07',
        title: 'First day of Computer Engineering',
        kind: 'milestone',
        weight: 2,
        why: 'Walked into the University of Manitoba as a computer engineering student. Everything on this map traces back to this decision.',
        media: { type: 'photo', alt: 'Photo of the engineering atrium on day one, student card in hand.' },
      },
      {
        id: 'first-camera',
        date: '2022-11-19',
        title: 'Bought my first camera',
        kind: 'photo',
        why: 'A used body and one lens. Photography became how I learned to actually look at light, which later made me care about how things are presented.',
        media: { type: 'photo', alt: 'The first frame I ever shot: a streetlight in falling snow.' },
      },
    ],
  },
  {
    year: 2023,
    theme: 'First contact',
    events: [
      {
        id: 'found-fsae',
        date: '2023-01-23',
        title: 'Found the FSAE Electric team',
        kind: 'fsae',
        weight: 2,
        why: 'Stopped at a club fair table with a half-built race car on it. Signed up on the spot. The single most important five minutes of university so far.',
        media: { type: 'photo', alt: 'The club fair table with the previous season chassis on display.' },
      },
      {
        id: 'first-firmware-task',
        date: '2023-10-05',
        title: 'Joined the team on firmware',
        kind: 'fsae',
        why: 'Programmed STM32 microcontrollers on the custom PCBs that run the car and learned to read its electrical systems through their schematics. First time my code lived inside something that could hurt you if you got it wrong; I also wrote a Python tool that logs high-current tab-test measurements through an ADC.',
        media: { type: 'photo', alt: 'The bench setup: dev board, CAN analyzer, and a very long logic trace.' },
      },
    ],
  },
  {
    year: 2024,
    theme: 'High voltage',
    events: [
      {
        id: 'software-system-lead',
        date: '2024-01-12',
        title: 'Software System Lead',
        kind: 'fsae',
        weight: 2,
        why: 'Took the software lead: 10+ members across 5+ vehicle codebases, CI/CD test pipelines in GitHub Actions, and CAN 2.0 between the custom PCBs, the battery-management system, and the 3-phase motor controller.',
        media: { type: 'photo', alt: 'Software team review in front of the vehicle CAN architecture diagram.' },
      },
      {
        id: 'accumulator-build',
        date: '2024-02-09',
        title: 'Joined the accumulator build',
        kind: 'fsae',
        weight: 2,
        why: 'HV pack assembly, cell testing, and safety procedure. Working around 400 volts teaches a kind of care that no course does.',
        media: { type: 'photo', alt: 'Gloved hands torquing busbars inside the accumulator container.' },
      },
      {
        id: 'bms-bringup',
        date: '2024-06-15',
        title: 'BMS firmware bring-up',
        kind: 'fsae',
        why: 'Brought up the battery management firmware and watched real cell voltages stream in for the first time. The moment firmware became my lane on the team.',
        media: { type: 'photo', alt: 'Terminal full of cell telemetry next to the open pack.' },
      },
      {
        id: 'winter-photo-series',
        date: '2024-11-22',
        title: 'Winnipeg at minus 30, on film',
        kind: 'photo',
        why: 'A winter photo series in brutal cold. Batteries die, fingers stop working, and you learn to plan every shot before you leave the house.',
        media: { type: 'photo', alt: 'Steam rising off the river at sunrise, minus 30 air.' },
      },
    ],
  },
  {
    year: 2025,
    theme: 'Taking command',
    events: [
      {
        id: 'autonomous-lead',
        date: '2025-01-15',
        title: 'Named Autonomous Systems Lead',
        kind: 'fsae',
        weight: 2,
        why: 'Handed the driverless program: leading 10+ members standing up a C++/ROS 2 monorepo on the NVIDIA Jetson Orin, $30k in sponsored LiDARs and cameras, and a system architecture built around the FS driverless ruleset. Target: driverless by 2028.',
        media: { type: 'photo', alt: 'Whiteboard photo from the first autonomy planning meeting.' },
      },
      {
        id: 'first-slam-demo',
        date: '2025-06-10',
        title: 'First SLAM demo on real data',
        kind: 'fsae',
        weight: 2,
        why: 'Cone landmarks and a pose graph built from a recorded run, live on screen. The first evidence that autonomous by 2028 is a plan and not a poster.',
        media: { type: 'video', alt: 'Screen capture of the SLAM map forming as the log replays.' },
      },
      {
        id: 'driverless-roadmap',
        date: '2025-12-02',
        title: 'Driverless 2028 roadmap approved',
        kind: 'fsae',
        why: 'Pitched the multi-season autonomy roadmap to the team leads and got the green light. My first time owning a plan measured in years, not semesters.',
      },
    ],
  },
  {
    year: 2026,
    theme: 'Escape velocity',
    events: [
      {
        id: 'perception-on-car',
        date: '2026-02-11',
        title: 'Perception stack runs on the car',
        kind: 'fsae',
        weight: 2,
        why: 'Cone detection running on the vehicle compute for the first time, off recorded camera data. The stack left the laptop and moved into the car.',
        media: { type: 'video', alt: 'Detection overlay on the forward camera feed, cones boxed in real time.' },
      },
      {
        id: 'portfolio-launch',
        date: '2026-04-25',
        title: 'Built this site',
        kind: 'project',
        why: 'Designed and shipped this portfolio to give the work a home. You are standing inside this event right now.',
      },
      {
        id: 'looking-ahead',
        date: '2026-07-01',
        title: 'Looking ahead: 2027 internships',
        kind: 'milestone',
        weight: 2,
        why: 'Open to internships from January to August 2027. The next star on this map could be with your team.',
      },
    ],
  },
];

/** Card tag text per event kind. */
export const kindLabels: Record<EventKind, string> = {
  milestone: 'Milestone',
  fsae: 'FSAE',
  project: 'Project',
  photo: 'Photography',
};
