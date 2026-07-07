/** Subsystem metadata - shared color-coding + copy across the FSAE section. */
export type Subsystem = 'firmware' | 'manufacturing' | 'autonomous';

export interface SubsystemMeta {
  id: Subsystem;
  label: string;
  code: string;
  /** CSS var reference for the accent. */
  color: string;
  /** Tailwind text color utility. */
  text: string;
  blurb: string;
  focus: string[];
}

export const subsystems: Record<Subsystem, SubsystemMeta> = {
  firmware: {
    id: 'firmware',
    label: 'Firmware',
    code: 'FW',
    color: 'var(--color-accent)',
    text: 'text-accent',
    blurb: 'Embedded C on the vehicle control units: CAN networking, sensor drivers, and the battery-management stack.',
    focus: ['Embedded C', 'RTOS', 'CAN bus', 'BMS', 'Sensor drivers'],
  },
  manufacturing: {
    id: 'manufacturing',
    label: 'Manufacturing',
    code: 'MFG',
    color: 'var(--color-cyan)',
    text: 'text-cyan',
    blurb: 'Building and validating the HV accumulator: cell tab testing, segment assembly, and the wire harnessing and safety discipline that a 400V pack demands.',
    focus: ['Accumulator', 'HV safety', 'Tab testing', 'Harnessing', 'BMS integration'],
  },
  autonomous: {
    id: 'autonomous',
    label: 'Autonomy',
    code: 'AV',
    color: 'var(--color-indigo)',
    text: 'text-indigo',
    blurb: 'The driverless program, in active development: system architecture, C++/ROS 2 on Jetson Orin, and ruleset compliance, targeting autonomous events by 2028.',
    focus: ['ROS 2', 'C++', 'Jetson Orin', 'Perception', 'Architecture'],
  },
};

export const subsystemOrder: Subsystem[] = ['firmware', 'manufacturing', 'autonomous'];

/**
 * Role progression on the team, oldest first. Rendered on the home page
 * FSAE section; append a row when the role changes.
 */
export interface TrajectoryStep {
  marker: string;
  title: string;
  detail: string;
  tag?: string;
}

export const trajectory: TrajectoryStep[] = [
  {
    marker: '2022',
    title: 'Joined the team on firmware',
    detail:
      'Programmed STM32 microcontrollers on the custom PCBs that run the car, learned to troubleshoot electrical systems through their schematics, and wrote a Python tool that logs high-current tab-test measurements through an ADC.',
    tag: 'FW',
  },
  {
    marker: '2024',
    title: 'Software System Lead',
    detail:
      'Led 10+ software members across 5+ vehicle codebases: CI/CD test pipelines with GitHub Actions, and CAN 2.0 communication between the custom PCBs, the battery-management system, and the 3-phase motor controller.',
    tag: 'FW · MFG',
  },
  {
    marker: '2026',
    title: 'Autonomous Systems Lead (DSO)',
    detail:
      'Leading 10+ members standing up the driverless program: a C++/ROS 2 monorepo targeting the NVIDIA Jetson Orin, $30k in sponsored LiDARs and cameras, and system architecture built around the FS driverless ruleset. Target: driverless by 2028.',
    tag: 'AV',
  },
];
