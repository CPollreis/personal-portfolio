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
    blurb: 'The driverless stack: perception, state estimation, path planning, and vehicle controls for the autonomous events.',
    focus: ['Perception', 'SLAM', 'Planning', 'Controls', 'ROS 2'],
  },
};

export const subsystemOrder: Subsystem[] = ['firmware', 'manufacturing', 'autonomous'];
