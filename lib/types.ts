export type Database = {
  public: {
    Tables: {
      nt_organizations: {
        Row: NtOrganization
        Insert: Omit<NtOrganization, 'id' | 'created_at'>
        Update: Partial<Omit<NtOrganization, 'id' | 'created_at'>>
      }
      nt_events: {
        Row: NtEvent
        Insert: Omit<NtEvent, 'id' | 'created_at'>
        Update: Partial<Omit<NtEvent, 'id' | 'created_at'>>
      }
      pc_commitments: {
        Row: PcCommitment
        Insert: Omit<PcCommitment, 'id' | 'created_at'>
        Update: Partial<Omit<PcCommitment, 'id' | 'created_at'>>
      }
      pc_signatories: {
        Row: PcSignatory
        Insert: Omit<PcSignatory, 'id' | 'created_at'>
        Update: Partial<Omit<PcSignatory, 'id' | 'created_at'>>
      }
      bs_assessments: {
        Row: BsAssessment
        Insert: Omit<BsAssessment, 'id' | 'created_at'>
        Update: Partial<Omit<BsAssessment, 'id' | 'created_at'>>
      }
      mdp_pacts: {
        Row: MdpPact
        Insert: Omit<MdpPact, 'id' | 'created_at'>
        Update: Partial<Omit<MdpPact, 'id' | 'created_at'>>
      }
      mdp_members: {
        Row: MdpMember
        Insert: Omit<MdpMember, 'id' | 'created_at'>
        Update: Partial<Omit<MdpMember, 'id' | 'created_at'>>
      }
      mdp_activations: {
        Row: MdpActivation
        Insert: Omit<MdpActivation, 'id' | 'created_at'>
        Update: Partial<Omit<MdpActivation, 'id' | 'created_at'>>
      }
    }
  }
}

export type NtOrganization = {
  id: string
  name: string
  industry: string
  description: string | null
  created_at: string
}

export type NtEvent = {
  id: string
  org_id: string
  title: string
  description: string | null
  event_date: string
  compliance_level: number // 1=full resistance, 5=full capitulation
  pressure_source: string | null
  created_at: string
}

export type PcCommitment = {
  id: string
  title: string
  description: string
  group_type: string
  created_at: string
}

export type PcSignatory = {
  id: string
  commitment_id: string
  name: string
  organization: string
  role: string | null
  statement: string | null
  created_at: string
}

export type BsAssessment = {
  id: string
  organization_name: string
  industry: string
  atomization_score: number | null
  normalization_score: number | null
  elite_capture_score: number | null
  economic_dependence_score: number | null
  cross_group_score: number | null
  practiced_readiness_score: number | null
  identity_binding_score: number | null
  notes: Record<string, string>
  is_public: boolean
  created_at: string
}

export type MdpPact = {
  id: string
  title: string
  description: string
  trigger_conditions: string
  response_commitment: string
  industry: string
  is_active: boolean
  created_at: string
}

export type MdpMember = {
  id: string
  pact_id: string
  name: string
  organization: string
  role: string | null
  commitment_statement: string | null
  created_at: string
}

export type MdpActivation = {
  id: string
  pact_id: string
  situation_description: string
  affected_member: string
  status: 'active' | 'resolved'
  created_at: string
}

// Compliance level labels
export const COMPLIANCE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Full Resistance', color: '#22c55e' },
  2: { label: 'Minor Concession', color: '#84cc16' },
  3: { label: 'Significant Compromise', color: '#f59e0b' },
  4: { label: 'Near Capitulation', color: '#f97316' },
  5: { label: 'Full Capitulation', color: '#ef4444' },
}

export const BACKBONE_DIMENSIONS = [
  {
    key: 'atomization_score',
    label: 'Atomization Resistance',
    description: 'Does the group respond collectively rather than letting individuals face threats alone?',
    lowLabel: 'Highly atomized — everyone for themselves',
    highLabel: 'Strong collective response infrastructure',
  },
  {
    key: 'normalization_score',
    label: 'Normalization Awareness',
    description: 'Does the group track and resist gradual drift in its positions under sustained pressure?',
    lowLabel: 'Unaware of accumulated drift',
    highLabel: 'Active tracking of baseline vs. current posture',
  },
  {
    key: 'elite_capture_score',
    label: 'Elite Capture Resistance',
    description: 'Is leadership distributed enough that no single person can be captured or coerced?',
    lowLabel: 'Single point of failure in leadership',
    highLabel: 'Federated, distributed leadership structure',
  },
  {
    key: 'economic_dependence_score',
    label: 'Economic Independence',
    description: 'Is the group\'s economic model free from dependence on parties who might apply pressure?',
    lowLabel: 'Deeply dependent on capturable revenue',
    highLabel: 'Diversified, independent economic base',
  },
  {
    key: 'cross_group_score',
    label: 'Cross-Group Connectivity',
    description: 'Does the group have active relationships with other groups who would respond if targeted?',
    lowLabel: 'Isolated — no external solidarity networks',
    highLabel: 'Dense cross-group solidarity infrastructure',
  },
  {
    key: 'practiced_readiness_score',
    label: 'Practiced Readiness',
    description: 'Has the group rehearsed collective action? Do protocols, comms trees, and decision authorities exist?',
    lowLabel: 'No protocols — would need to build during crisis',
    highLabel: 'Existing protocols rehearsed through non-political activity',
  },
  {
    key: 'identity_binding_score',
    label: 'Identity Binding',
    description: 'Is professional/group integrity a core identity — not just a norm — making defection a status threat?',
    lowLabel: 'Norms are situationally negotiable',
    highLabel: 'Integrity is existential to group identity',
  },
]
