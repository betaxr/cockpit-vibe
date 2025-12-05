// Process Lifecycle Status Colors
// These colors represent the different stages of process automation

export type LifecycleStatus = 'idle' | 'scheduled' | 'testing' | 'semi_automated' | 'automated';

export const PROCESS_COLORS: Record<LifecycleStatus, { bg: string; border: string; text: string; label: string }> = {
  // Restkapazitäten - Transparent Grau-Schwarz
  idle: {
    bg: 'oklch(0.15 0.01 45 / 50%)',
    border: 'oklch(0.25 0.02 45 / 40%)',
    text: 'oklch(0.6 0.02 45)',
    label: 'Restkapazitäten'
  },
  // Geplante Prozesse - Grauer Ton
  scheduled: {
    bg: 'oklch(0.35 0.02 45 / 60%)',
    border: 'oklch(0.45 0.03 45 / 50%)',
    text: 'oklch(0.75 0.02 45)',
    label: 'Geplante Prozesse'
  },
  // Neue Test Prozesse - Weiß
  testing: {
    bg: 'oklch(0.95 0.01 45 / 90%)',
    border: 'oklch(1 0 0 / 60%)',
    text: 'oklch(0.2 0.02 45)',
    label: 'Neue Test Prozesse'
  },
  // Teilautomatisierte Prozesse - Hell-Orange (Secondary)
  semi_automated: {
    bg: 'oklch(0.65 0.14 55 / 80%)',
    border: 'oklch(0.7 0.16 55 / 70%)',
    text: 'oklch(0.15 0.02 45)',
    label: 'Teilautomatisierte Prozesse'
  },
  // Reguläre Auslastung - Neon-Orange (Primary)
  automated: {
    bg: 'oklch(0.55 0.18 45 / 90%)',
    border: 'oklch(0.6 0.2 45 / 80%)',
    text: 'oklch(1 0 0)',
    label: 'Reguläre Auslastung'
  }
};

// Get Tailwind-compatible class names for process status
export function getProcessColorClasses(status: LifecycleStatus): string {
  switch (status) {
    case 'idle':
      return 'bg-[oklch(0.15_0.01_45/50%)] border-[oklch(0.25_0.02_45/40%)] text-[oklch(0.6_0.02_45)]';
    case 'scheduled':
      return 'bg-[oklch(0.35_0.02_45/60%)] border-[oklch(0.45_0.03_45/50%)] text-[oklch(0.75_0.02_45)]';
    case 'testing':
      return 'bg-[oklch(0.95_0.01_45/90%)] border-[oklch(1_0_0/60%)] text-[oklch(0.2_0.02_45)]';
    case 'semi_automated':
      return 'bg-[oklch(0.65_0.14_55/80%)] border-[oklch(0.7_0.16_55/70%)] text-[oklch(0.15_0.02_45)]';
    case 'automated':
      return 'bg-[oklch(0.55_0.18_45/90%)] border-[oklch(0.6_0.2_45/80%)] text-white';
    default:
      return 'bg-[oklch(0.15_0.01_45/50%)] border-[oklch(0.25_0.02_45/40%)] text-[oklch(0.6_0.02_45)]';
  }
}

// Get inline style object for process status
export function getProcessColorStyle(status: LifecycleStatus): React.CSSProperties {
  const colors = PROCESS_COLORS[status];
  return {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    color: colors.text
  };
}

// Legend items for display
export const PROCESS_LEGEND = [
  { status: 'idle' as LifecycleStatus, label: 'Restkapazitäten', dotColor: 'bg-[oklch(0.25_0.02_45)]' },
  { status: 'scheduled' as LifecycleStatus, label: 'Geplante Prozesse', dotColor: 'bg-[oklch(0.45_0.03_45)]' },
  { status: 'testing' as LifecycleStatus, label: 'Neue Test Prozesse', dotColor: 'bg-white' },
  { status: 'semi_automated' as LifecycleStatus, label: 'Teilautomatisierte Prozesse', dotColor: 'bg-[oklch(0.7_0.16_55)]' },
  { status: 'automated' as LifecycleStatus, label: 'Reguläre Auslastung', dotColor: 'bg-[oklch(0.6_0.2_45)]' }
];
