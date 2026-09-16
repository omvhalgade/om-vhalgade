export interface ProjectItem {
  id: string;
  num: string;
  title: string;
  description: string;
  tag: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface TimelineEntry {
  period: string;
  title: string;
  institution: string;
  description: string;
}

export interface MetricItem {
  number: string;
  label: string;
}
